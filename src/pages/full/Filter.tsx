import { Button, Group, SegmentedControl } from "@mantine/core"
import { modals } from "@mantine/modals"
import { atom, useAtomValue, useSetAtom } from "jotai"
import { thisYear } from "../../firebase/data"
import { useAnnual } from "../../firebase/read"
import EditList from "./EditList"

interface FilterState {
  year: string
  listKey: ListKey
  groupKey?: GroupKey
}

type GroupKey = "" | "month" | "category"

export const filterState = atom<FilterState>({
  year: String(thisYear),
  listKey: "expense",
  groupKey: "category",
})

export const useFilter = () => {
  return useAtomValue(filterState)
}

export const useFilteredList = () => {
  const { year, listKey } = useFilter()
  const annual = useAnnual()
  return annual[year]?.[listKey] || []
}

export const useSetFilter = () => {
  const setFilter = useSetAtom(filterState)
  return (filter: Partial<FilterState>) => setFilter((prev) => ({ ...prev, ...filter }))
}

export const useFilterState = () => {
  const filter = useFilter()
  const setFilter = useSetFilter()
  return [filter, setFilter] as const
}

const Filter = () => {
  const [{ listKey, groupKey }, setFilter] = useFilterState()
  return (
    <Group justify="space-between">
      <Group>
        <SegmentedControl
          value={listKey}
          onChange={(listKey) => setFilter({ listKey: listKey as ListKey })}
          data={[
            { label: "수입", value: "income" },
            { label: "지출", value: "expense" },
          ]}
          transitionDuration={0}
        />

        <SegmentedControl
          value={groupKey}
          onChange={(groupKey) => setFilter({ groupKey: groupKey as GroupKey })}
          data={[
            { label: "원본", value: "" },
            { label: "월", value: "month" },
            { label: "카테고리", value: "category" },
          ]}
          transitionDuration={0}
        />
      </Group>

      <Button onClick={() => modals.open({ children: <EditList /> })} variant="subtle" size="sm" color="gray">
        편집
      </Button>
    </Group>
  )
}

export default Filter
