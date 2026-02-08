import { useMemo } from "react"
import type { ExpenseItem, Recurring, TransactionItem } from "@/schemas"
import { useUIStore } from "@/stores/ui"
import { useFirebaseData } from "@/contexts/FirebaseDataContext"

interface UseYearDataResult {
  incomeItems: Array<TransactionItem>
  incomeRecurring: Array<Recurring>
  expenseItems: Array<ExpenseItem>
  expenseRecurring: Array<Recurring>
  loading: boolean
  error: Error | null
}

// 개인 또는 가족 연간 데이터 로드.
// 루트 구독에서 연도별 데이터를 파생. 연도 변경 시 새 리스너 등록 없음.
export function useYearData(
  source: "personal" | "family",
  yearOverride?: number,
): UseYearDataResult {
  const storeYear = useUIStore((s) => s.year)
  const year = yearOverride ?? storeYear
  const { data, loading, error } = useFirebaseData()[source]

  return useMemo(() => {
    const yearData = data?.[year]
    return {
      incomeItems: yearData?.incomes?.items ?? [],
      incomeRecurring: yearData?.incomes?.recurring ?? [],
      expenseItems: yearData?.expenses?.items ?? [],
      expenseRecurring: yearData?.expenses?.recurring ?? [],
      loading,
      error,
    }
  }, [data, year, loading, error])
}
