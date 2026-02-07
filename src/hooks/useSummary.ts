import { useMemo } from "react"
import { useYearData } from "./useYearData"
import { useBalances } from "./useBalances"
import { useUIStore } from "@/stores/ui"
import { getCurrentYear } from "@/lib/utils"
import { calculateBalance, calculateDiscrepancy, calculateNetAssets } from "@/lib/calculations"

interface SummaryResult {
  personalBalance: number
  familyBalance: number
  netAssets: number
  discrepancy: number
  isCurrentYear: boolean
  loading: boolean
}

// 수지/순자산/오차 계산 (사이드바용).
// 오차(discrepancy) = 순자산 - 개인수지 - 가족수지. 이 값이 0이 아니면
// NumberCell의 자동 조정 버튼으로 전파되어 사용자가 잔액을 맞출 수 있다.
// 과거 연도(isCurrentYear=false)에는 오차를 0으로 고정한다.
export function useSummary(): SummaryResult {
  const year = useUIStore((s) => s.year)
  const personal = useYearData("personal")
  const family = useYearData("family")
  const balances = useBalances()

  return useMemo(() => {
    const isCurrentYear = year === getCurrentYear()

    const personalBalance = calculateBalance(
      personal.incomeItems,
      personal.expenseItems,
      personal.incomeRecurring,
      personal.expenseRecurring,
    )

    const familyBalance = calculateBalance(
      family.incomeItems,
      family.expenseItems,
      family.incomeRecurring,
      family.expenseRecurring,
    )

    const netAssets = calculateNetAssets(balances.accounts, balances.receivables, balances.deposits)

    const discrepancy = isCurrentYear
      ? calculateDiscrepancy(netAssets, personalBalance, familyBalance)
      : 0

    return {
      personalBalance,
      familyBalance,
      netAssets,
      discrepancy,
      isCurrentYear,
      loading: personal.loading || family.loading || balances.loading,
    }
  }, [year, personal, family, balances])
}
