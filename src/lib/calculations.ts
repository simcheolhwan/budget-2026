// 순수 계산 함수. 외부 의존성 없이 스키마 타입만 사용한다.
// 수지(calculateBalance), 순자산(calculateNetAssets), 오차(calculateDiscrepancy) 세 함수가
// useSummary 훅에서 조합되어 사이드바의 오차 표시 및 NumberCell의 자동 조정에 사용된다.
import { isProjectExpense } from "./utils"
import type { BalanceItem, BudgetGroup, ExpenseItem, Recurring, TransactionItem } from "@/schemas"

// 금액 합계 (amount 필드를 가진 모든 항목)
export const sumAmounts = <T extends { amount: number }>(items: ReadonlyArray<T>): number =>
  items.reduce((sum, item) => sum + item.amount, 0)

// 지출 항목 합계 (일반 + 프로젝트 union 분기)
export const sumExpenseItems = (items: ReadonlyArray<ExpenseItem>): number =>
  items.reduce((sum, item) => {
    if (isProjectExpense(item)) {
      return sum + item.items.reduce((s, sub) => s + sub.amount, 0)
    }
    return sum + item.amount
  }, 0)

// 반복 항목 합계 (모든 월 금액 합산)
export const sumRecurring = (recurring: ReadonlyArray<Recurring>): number =>
  recurring.reduce((sum, r) => sum + Object.values(r.monthly).reduce((s, v) => s + v, 0), 0)

// 특정 월의 반복 합계
export const sumRecurringByMonth = (recurring: ReadonlyArray<Recurring>, month: number): number =>
  recurring.reduce((sum, r) => sum + (r.monthly[String(month)] ?? 0), 0)

// 잔액 항목 합계
export const sumBalanceItems = (items: ReadonlyArray<BalanceItem>): number =>
  items.reduce((sum, item) => sum + item.balance, 0)

// 수지 계산 (수입 - 지출, 반복 포함)
export const calculateBalance = (
  incomeItems: ReadonlyArray<TransactionItem>,
  expenseItems: ReadonlyArray<ExpenseItem>,
  recurringIncomes: ReadonlyArray<Recurring>,
  recurringExpenses: ReadonlyArray<Recurring>,
): number =>
  sumAmounts(incomeItems) +
  sumRecurring(recurringIncomes) -
  sumExpenseItems(expenseItems) -
  sumRecurring(recurringExpenses)

// 순자산 (계좌 + 미수금 - 예수금)
export const calculateNetAssets = (
  accounts: ReadonlyArray<BalanceItem>,
  receivables: ReadonlyArray<BalanceItem>,
  deposits: ReadonlyArray<BalanceItem>,
): number => sumBalanceItems(accounts) + sumBalanceItems(receivables) - sumBalanceItems(deposits)

// 오차 (순자산 - 개인수지 - 가족수지).
// 이 값이 0이 아니면 NumberCell에 자동 조정 버튼이 표시된다.
// 수입은 +discrepancy, 지출은 -discrepancy, 계좌/미수금은 -discrepancy, 예수금은 +discrepancy.
export const calculateDiscrepancy = (
  netAssets: number,
  personalBalance: number,
  familyBalance: number,
): number => netAssets - personalBalance - familyBalance

// 예산 그룹 합계 (모든 항목 금액 합산)
export const sumBudgetGroups = (groups: ReadonlyArray<BudgetGroup>): number =>
  groups.reduce((sum, group) => sum + group.items.reduce((s, item) => s + item.amount, 0), 0)

// 예산 항목명 기준 지출 계산.
// 지출의 category와 예산 항목의 name을 매칭. 일반 지출 + 반복 지출 모두 합산.
export function getItemSpending(
  budgetItemName: string,
  expenseItems: ReadonlyArray<ExpenseItem>,
  expenseRecurring: ReadonlyArray<Recurring>,
): number {
  const itemSpending = expenseItems
    .filter((item) => item.category === budgetItemName)
    .reduce((sum, item) => {
      if (isProjectExpense(item)) {
        return sum + item.items.reduce((s, sub) => s + sub.amount, 0)
      }
      return sum + item.amount
    }, 0)

  const recurringSpending = expenseRecurring
    .filter((r) => r.name === budgetItemName)
    .reduce((sum, r) => sum + Object.values(r.monthly).reduce((s, v) => s + v, 0), 0)

  return itemSpending + recurringSpending
}

// 예산 항목명 기준 지출 맵 (카테고리별 사전 계산).
// BudgetPage에서 사용. 매 항목마다 getItemSpending을 호출하는 대신 O(n)으로 한 번에 집계.
export function buildSpendingMap(
  expenseItems: ReadonlyArray<ExpenseItem>,
  expenseRecurring: ReadonlyArray<Recurring>,
): Map<string, number> {
  const map = new Map<string, number>()

  for (const item of expenseItems) {
    const key = item.category
    if (!key) continue
    const amount = isProjectExpense(item)
      ? item.items.reduce((s, sub) => s + sub.amount, 0)
      : item.amount
    map.set(key, (map.get(key) ?? 0) + amount)
  }

  for (const r of expenseRecurring) {
    const key = r.name
    if (!key) continue
    const amount = Object.values(r.monthly).reduce((s, v) => s + v, 0)
    map.set(key, (map.get(key) ?? 0) + amount)
  }

  return map
}

// 소진율 (지출 / 예산). 예산이 0 이하이면 null.
export const calculateBurnRate = (spent: number, budget: number): number | null =>
  budget > 0 ? spent / budget : null
