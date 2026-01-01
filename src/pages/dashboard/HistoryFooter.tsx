import { useAtom } from "jotai"
import { Group, Text, UnstyledButton } from "@mantine/core"
import { useYearBalance } from "../../firebase/calc"
import { viewLastMonthState } from "./viewMonth"

const HistoryFooter = () => {
  const [viewLastMonth, setViewLastMonth] = useAtom(viewLastMonthState)
  const yearBalance = useYearBalance()

  return (
    <Group justify="space-between">
      {viewLastMonth ? (
        <UnstyledButton onClick={() => setViewLastMonth(false)} c="dimmed" fz="xs">
          이번 달 보기
        </UnstyledButton>
      ) : (
        <UnstyledButton onClick={() => setViewLastMonth(true)} c="dimmed" fz="xs">
          지난 달 보기
        </UnstyledButton>
      )}

      <Text c="dimmed" fz="xs" ta="right">
        잔고 {yearBalance.toLocaleString()}
      </Text>
    </Group>
  )
}

export default HistoryFooter
