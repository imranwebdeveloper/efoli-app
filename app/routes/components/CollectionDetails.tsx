import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";

export function CollectionDetails({ collection }: any) {
  const shopify = useAppBridge();

  if (!collection) {
    return null;
  }

  return (
    <Modal id="collection-details-modal">
      <TitleBar title={collection.name} />
      <Box padding={"400"}>
        <BlockStack gap={"400"}>
          <Box>
            <Text as="p" variant="headingLg">
              {collection.name}
            </Text>
            <Text as="p" variant="bodyMd">
              Priority: {collection.priority}
            </Text>
            <Text as="p" variant="bodyMd">
              Created At: {new Date(collection.createdAt).toLocaleDateString()}
            </Text>
          </Box>
          {/* Product List */}
          <Card padding={"200"}>
            {collection.products.length > 0 ? (
              <BlockStack>
                {collection.products.map(({ product }: any) => (
                  <InlineStack key={product.id} gap={"400"} blockAlign="center">
                    <Thumbnail
                      source={product.imageUrl}
                      alt={product.title}
                      size="small"
                    />
                    <Text as="p" variant="bodyMd">
                      {product.title}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            ) : (
              <Text as="p" variant="bodyMd" tone="critical">
                No products in this collection.
              </Text>
            )}
          </Card>
        </BlockStack>

        {/* Close Button */}
        <Box paddingBlockStart="300">
          <Button
            variant="primary"
            tone="critical"
            onClick={() => shopify.modal.hide("collection-details-modal")}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
