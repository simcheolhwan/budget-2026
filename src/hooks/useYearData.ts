import { useMemo } from "react"
import { useFirebaseSync } from "./useFirebaseSync"
import type { ExpenseItem, Recurring, TransactionItem } from "@/schemas"
import { useUIStore } from "@/stores/ui"
import { familyPath, personalPath } from "@/lib/paths"

interface UseYearDataResult {
  incomeItems: Array<TransactionItem>
  incomeRecurring: Array<Recurring>
  expenseItems: Array<ExpenseItem>
  expenseRecurring: Array<Recurring>
  loading: boolean
  error: Error | null
}

// 개인 또는 가족 연간 데이터 로드.
// 4개 경로(수입 items/recurring, 지출 items/recurring)를 useFirebaseSync로 병렬 구독.
// BudgetLayout, useSummary에서 사용.
export function useYearData(
  source: "personal" | "family",
  yearOverride?: number,
): UseYearDataResult {
  const storeYear = useUIStore((s) => s.year)
  const year = yearOverride ?? storeYear
  const pathFn = source === "personal" ? personalPath : familyPath

  const incomeItemsState = useFirebaseSync<Array<TransactionItem>>(pathFn(year, "incomes", "items"))
  const incomeRecurringState = useFirebaseSync<Array<Recurring>>(
    pathFn(year, "incomes", "recurring"),
  )
  const expenseItemsState = useFirebaseSync<Array<ExpenseItem>>(pathFn(year, "expenses", "items"))
  const expenseRecurringState = useFirebaseSync<Array<Recurring>>(
    pathFn(year, "expenses", "recurring"),
  )

  const loading =
    incomeItemsState.loading ||
    incomeRecurringState.loading ||
    expenseItemsState.loading ||
    expenseRecurringState.loading

  const error =
    incomeItemsState.error ??
    incomeRecurringState.error ??
    expenseItemsState.error ??
    expenseRecurringState.error

  return useMemo(
    () => ({
      incomeItems: incomeItemsState.data ?? [],
      incomeRecurring: incomeRecurringState.data ?? [],
      expenseItems: expenseItemsState.data ?? [],
      expenseRecurring: expenseRecurringState.data ?? [],
      loading,
      error,
    }),
    [
      incomeItemsState.data,
      incomeRecurringState.data,
      expenseItemsState.data,
      expenseRecurringState.data,
      loading,
      error,
    ],
  )
}
