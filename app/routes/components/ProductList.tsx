import {
  Button,
  ResourceList,
  ResourceItem,
  Text,
  InlineStack,
  Filters,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

interface ProductListProps {
  items: { id: number; title: string; imageUrl: string | undefined }[];
  setItems: (
    items: { id: number; title: string; imageUrl: string | undefined }[],
  ) => void;
}

function ProductList({ items, setItems }: ProductListProps) {
  return (
    <ResourceList
      items={items}
      renderItem={renderItem}
      filterControl={
        <Filters
          disabled={!items.length}
          queryValue=""
          filters={[]}
          appliedFilters={[]}
          onClearAll={() => undefined}
          onQueryChange={() => undefined}
          onQueryClear={() => undefined}
          queryPlaceholder="Search products..."
        >
          <Button
            onClick={async () => {
              const selected = await shopify.resourcePicker({
                type: "product",
                multiple: true,
                selectionIds: items.map((item) => {
                  return { id: item.id.toString(), variants: [] };
                }),
              });
              if (!selected) return;
              const selectedProductInfo = selected?.map((item: any) => {
                return {
                  id: item.id,
                  title: item.title,
                  imageUrl: item?.images[0]?.originalSrc,
                };
              });
              setItems(selectedProductInfo || []);
            }}
          >
            Browser
          </Button>
        </Filters>
      }
      showHeader={true}
    />
  );

  function renderItem(item: (typeof items)[number]) {
    const { id, imageUrl, title } = item;
    return (
      <ResourceItem
        id={id.toString()}
        onClick={() => {}}
        media={
          <img
            alt=""
            width="30"
            height="30"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={imageUrl}
          />
        }
      >
        <InlineStack align="space-between">
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {title}
          </Text>
          <Button
            icon={PlusIcon}
            accessibilityLabel="Add theme"
            tone="critical"
            variant="primary"
            onClick={() => {
              const newItems = items.filter((item) => item.id !== id);
              setItems(newItems);
            }}
          />
        </InlineStack>
      </ResourceItem>
    );
  }
}

export default ProductList;
