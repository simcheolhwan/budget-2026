import { Container, Stack, Tabs, Text } from "@mantine/core"
import { sum } from "ramda"
import { useAnnual } from "../../firebase/read"
import Filter, { useFilterState } from "./Filter"
import ItemError from "./ItemError"
import Year from "./Year"

const Full = () => {
  const [{ year }, setFilter] = useFilterState()
  const annual = useAnnual()
  const years = Object.keys(annual)

  const data = annual[year]
  const income = data ? sum(data.income.map(({ amount }) => amount)) : 0
  const expense = data ? sum(data.expense.map(({ amount }) => amount)) : 0
  const net = income - expense

  return (
    <Container size="sm">
      <Stack gap="xs">
        <Filter />
        <ItemError />

        <Tabs value={year} onChange={(year) => year && setFilter({ year })} orientation="vertical">
          <Tabs.List>
            {years.map((year) => (
              <Tabs.Tab value={year} key={year}>
                {year}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {years.map((year) => (
            <Tabs.Panel value={year} pl="xs" key={year}>
              <Year />
            </Tabs.Panel>
          ))}
        </Tabs>

        <Text ta="right" fz="sm" c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
          {net.toLocaleString()}
        </Text>
      </Stack>
    </Container>
  )
}

export default Full
