import { Link } from "@remix-run/react";
import {
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  Badge,
  useBreakpoints,
  Card,
} from "@shopify/polaris";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import { useState, useCallback } from "react";

function CollectionTable({ data }: any) {
  const collections = data || [];

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState(["All"]);

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value: string): Promise<boolean> => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
          ],
  }));
  const [selected, setSelected] = useState(0);

  const sortOptions: IndexFiltersProps["sortOptions"] = [];
  const [sortSelected, setSortSelected] = useState(["order asc"]);

  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};
  const [queryValue, setQueryValue] = useState("");

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );

  const collectionData = collections.map((collection: any) => {
    return {
      id: collection.id,
      name: (
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {collection.name}
        </Text>
      ),
      productCount: collection.products.length,

      priority: (
        <Badge
          tone={
            collection.priority === "HIGH"
              ? "critical"
              : collection.priority === "MEDIUM"
                ? "warning"
                : "success"
          }
        >
          {collection.priority}
        </Badge>
      ),
    };
  });

  const resourceName = {
    singular: "Collection",
    plural: "Collections",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(collectionData);

  const rowMarkup = collectionData.map(
    ({ id, name, priority, productCount }: any, index: number) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Link to={`/app/${id}`}>{name}</Link>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {productCount}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{priority}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Card>
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => setQueryValue("")}
        onSort={setSortSelected}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        selected={selected}
        onSelect={setSelected}
        queryPlaceholder="Searching in all"
        tabs={tabs}
        canCreateNewView={false}
        filters={[]}
        appliedFilters={[]}
        onClearAll={() => {}}
        hideFilters
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={collectionData.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Name" },
          { title: "Products" },
          { title: "Priority" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}

export default CollectionTable;
