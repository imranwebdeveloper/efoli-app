import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import CollectionTable from "./components/CollectionTable";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const collections = await prisma.collection.findMany({
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  return Response.json({ data: collections });
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Dashboard"
      primaryAction={{ content: "Add folder", url: "/app/new" }}
    >
      <Layout>
        <Layout.Section>
          <CollectionTable data={data} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
