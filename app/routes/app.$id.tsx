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

    // ✅ **Basic validation**
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
        { errors: { products: "At least one product is required" } },
        { status: 400 },
      );
    }

    const method = request.method.toUpperCase();

    // ✅ **Ensure all products exist before creating/updating the collection**
    const productIds = await Promise.all(
      products.map(async (product) => {
        let existingProduct = await prisma.product.findUnique({
          where: { id: String(product.id) },
        });

        if (!existingProduct) {
          existingProduct = await prisma.product.create({
            data: {
              id: String(product.id),
              title: product.title,
              imageUrl: product.imageUrl || null,
            },
          });
        }

        return existingProduct.id;
      }),
    );

    if (method === "POST") {
      // ✅ **Create new collection**
      await prisma.collection.create({
        data: {
          name,
          priority: priority as "HIGH" | "MEDIUM" | "LOW",
          products: {
            create: productIds.map((productId) => ({
              product: { connect: { id: productId } },
            })),
          },
        },
      });
    } else if (method === "PUT" && id) {
      // ✅ **Update existing collection**
      await prisma.collection.update({
        where: { id },
        data: {
          name,
          priority: priority as "HIGH" | "MEDIUM" | "LOW",
          products: {
            deleteMany: {}, // Remove old product relations
            create: productIds.map((productId) => ({
              product: { connect: { id: productId } },
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
    console.error("Error in action function:", error);
    return Response.json(
      { errors: { form: "An error occurred while processing your request." } },
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
