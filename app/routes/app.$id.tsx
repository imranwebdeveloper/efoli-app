import { Form, redirect, useActionData, useLoaderData } from "@remix-run/react";
import {
  TextField,
  Select,
  Button,
  Card,
  Page,
  BlockStack,
  FormLayout,
} from "@shopify/polaris";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import ProductList from "./components/ProductList";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { CollectionDetails } from "./components/CollectionDetails";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  if (!params.id || params.id === "new") {
    return Response.json({ collection: null });
  }

  const collection = await prisma.collection.findUnique({
    where: { id: Number(params.id) },
    include: {
      products: { include: { product: true } },
    },
  });

  if (!collection) {
    return Response.json(
      { errors: { form: "Collection not found" } },
      { status: 404 },
    );
  }

  return Response.json({ collection }, { status: 200 });
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    await authenticate.admin(request);
    const formData = await request.formData();

    const id = params.id !== "new" ? Number(params.id) : null;
    const name = formData.get("name")?.toString();
    const priority = formData.get("priority")?.toString();
    const productsString = formData.get("products")?.toString();

    if (!name) {
      return Response.json(
        { errors: { name: "Name is required" } },
        { status: 400 },
      );
    }

    if (!productsString) {
      return Response.json(
        { errors: { products: "Products are required" } },
        { status: 400 },
      );
    }

    const products = JSON.parse(productsString);

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json(
        { errors: { products: "Products are required" } },
        { status: 400 },
      );
    }

    const method = request.method.toUpperCase();

    if (method === "POST") {
      // CREATE NEW COLLECTION
      await prisma.collection.create({
        data: {
          name,
          priority: priority as "HIGH" | "MEDIUM" | "LOW",
          products: {
            create: products.map((product) => ({
              product: { connect: { id: String(product.id) } },
            })),
          },
        },
      });
    } else if (method === "PUT" && id) {
      //  UPDATE EXISTING COLLECTION
      await prisma.collection.update({
        where: { id },
        data: {
          name,
          priority: priority as "HIGH" | "MEDIUM" | "LOW",
          products: {
            deleteMany: {},
            create: products.map((product) => ({
              product: { connect: { id: String(product.id) } },
            })),
          },
        },
      });
    } else {
      return Response.json(
        { errors: { form: "Invalid request method" } },
        { status: 405 },
      );
    }

    return redirect(`/app`);
  } catch (error) {
    return Response.json(
      { errors: { form: "An error occurred." } },
      { status: 400 },
    );
  }
}

export default function NewCollection() {
  const { collection } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const data = useActionData<typeof action>();
  const [products, setProducts] = useState<
    { id: number; title: string; imageUrl: string | undefined }[]
  >([]);

  const [name, setName] = useState("");
  const [priority, setPriority] = useState("High");

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setPriority(collection.priority);
      setProducts(
        collection.products.map((product: any) => ({
          id: product.product.id,
          title: product.product.title,
          imageUrl: product.product.imageUrl,
        })),
      );
    }
  }, [collection]);

  return (
    <Page
      title={collection ? "Edit Folder" : "New Folder"}
      primaryAction={
        collection && {
          content: "View",
          onAction: () => {
            shopify.modal.show("collection-details-modal");
          },
        }
      }
    >
      <Form method={collection ? "PUT" : "POST"}>
        <BlockStack gap={"300"}>
          <Card>
            <FormLayout>
              <TextField
                autoComplete="off"
                label="Title"
                name="name"
                placeholder="Title"
                value={name}
                onChange={setName}
                autoFocus
                error={data?.errors?.name}
              />

              <Select
                label="Priority"
                name="priority"
                options={[
                  { label: "High", value: "HIGH" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "Low", value: "LOW" },
                ]}
                value={priority}
                onChange={setPriority}
              />

              <input
                type="hidden"
                name="products"
                value={JSON.stringify(products)}
                readOnly
              />
            </FormLayout>
            <ProductList items={products} setItems={setProducts} />
          </Card>
          <div className="flex justify-end">
            <Button variant="primary" submit disabled={products.length === 0}>
              Save
            </Button>
          </div>
        </BlockStack>
      </Form>
      <CollectionDetails collection={collection} />
    </Page>
  );
}
