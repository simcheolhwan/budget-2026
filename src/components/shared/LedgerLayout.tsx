import { useCallback, useMemo } from "react"
import { RecurringTable } from "./RecurringTable"
import { ItemsTable } from "./ItemsTable"
import { SubTabs } from "./SubTabs"
import { YearSelect } from "./YearSelect"
import styles from "./LedgerLayout.module.css"
import type { ExpenseItem, ProjectExpense, Recurring, TransactionItem } from "@/schemas"
import { useUIStore } from "@/stores/ui"
import { useSubTabs } from "@/hooks/useSubTabs"
import { useAvailableYears } from "@/hooks/useAvailableYears"
import { useSummary } from "@/hooks/useSummary"
import { useYearData } from "@/hooks/useYearData"
import { collectCategoriesFromItems } from "@/lib/grouping"
import { calculateBalance } from "@/lib/calculations"
import { updateSortedItem, write } from "@/lib/database"
import { getProjectItems, isProjectExpense } from "@/lib/utils"
import { sourcePath } from "@/lib/paths"

async function autoAdjustRecurringMonth(
  items: Array<Recurring>,
  path: string,
  discrepancy: number,
  index: number,
  month: number,
  sign: 1 | -1,
) {
  const updated = [...items]
  const current = updated[index].monthly?.[String(month)] ?? 0
  const newValue = current + sign * discrepancy
  const { [String(month)]: _, ...rest } = updated[index].monthly ?? {}
  updated[index] = {
    ...updated[index],
    monthly: newValue === 0 ? rest : { ...updated[index].monthly, [String(month)]: newValue },
  }
  await write(path, updated)
}

async function autoAdjustItemAmount(
  items: ReadonlyArray<TransactionItem | ExpenseItem>,
  path: string,
  discrepancy: number,
  index: number,
  sign: 1 | -1,
) {
  const item = items[index]
  if (isProjectExpense(item)) return
  await updateSortedItem(path, items as Array<TransactionItem | ExpenseItem>, index, {
    ...item,
    amount: item.amount + sign * discrepancy,
  })
}

interface LedgerLayoutProps {
  source: "personal" | "family"
}

// 공통 가계부 레이아웃 (반복 테이블 상단 + 수입/지출 좌우)
export function LedgerLayout({ source }: LedgerLayoutProps) {
  const viewMode = useUIStore((s) => s.viewMode)
  const year = useUIStore((s) => s.year)
  const setYear = useUIStore((s) => s.setYear)

  const data = useYearData(source)
  const { incomeItems, expenseItems, incomeRecurring, expenseRecurring } = data

  const { years } = useAvailableYears(source)
  const { discrepancy } = useSummary()

  // 전 연도 데이터 로드 (분류 수집용)
  const prevData = useYearData(source, year - 1)

  // 경로 계산
  const incomePath = sourcePath(source, year, "incomes", "items")
  const expensePath = sourcePath(source, year, "expenses", "items")
  const incomeRecurringPath = sourcePath(source, year, "incomes", "recurring")
  const expenseRecurringPath = sourcePath(source, year, "expenses", "recurring")

  // 수지 계산
  const balance = useMemo(
    () => calculateBalance(incomeItems, expenseItems, incomeRecurring, expenseRecurring),
    [incomeItems, expenseItems, incomeRecurring, expenseRecurring],
  )

  // 분류 목록 (전 연도 기반, 영역별)
  const incomeItemCategories = useMemo(
    () => collectCategoriesFromItems(prevData.incomeItems, []),
    [prevData.incomeItems],
  )
  const incomeRecurringCategories = useMemo(
    () => collectCategoriesFromItems([], prevData.incomeRecurring),
    [prevData.incomeRecurring],
  )
  const expenseItemCategories = useMemo(
    () => collectCategoriesFromItems(prevData.expenseItems, []),
    [prevData.expenseItems],
  )
  const expenseRecurringCategories = useMemo(
    () => collectCategoriesFromItems([], prevData.expenseRecurring),
    [prevData.expenseRecurring],
  )

  // 반복 수입 자동 조정: value + discrepancy
  const handleAutoAdjustIncomeRecurring = useCallback(
    (index: number, month: number) =>
      autoAdjustRecurringMonth(incomeRecurring, incomeRecurringPath, discrepancy, index, month, 1),
    [incomeRecurring, incomeRecurringPath, discrepancy],
  )

  // 반복 지출 자동 조정: value - discrepancy
  const handleAutoAdjustExpenseRecurring = useCallback(
    (index: number, month: number) =>
      autoAdjustRecurringMonth(
        expenseRecurring,
        expenseRecurringPath,
        discrepancy,
        index,
        month,
        -1,
      ),
    [expenseRecurring, expenseRecurringPath, discrepancy],
  )

  // 일반 수입 자동 조정: value + discrepancy
  const handleAutoAdjustIncomeItem = useCallback(
    (originalIndex: number) =>
      autoAdjustItemAmount(incomeItems, incomePath, discrepancy, originalIndex, 1),
    [incomeItems, incomePath, discrepancy],
  )

  // 일반 지출 자동 조정: value - discrepancy
  const handleAutoAdjustExpenseItem = useCallback(
    (originalIndex: number) =>
      autoAdjustItemAmount(expenseItems, expensePath, discrepancy, originalIndex, -1),
    [expenseItems, expensePath, discrepancy],
  )

  // 서브탭 (수입/지출 독립)
  const incomeSubTabs = useSubTabs(incomeItems, (item) => item.amount)
  const expenseSubTabs = useSubTabs(
    expenseItems as Array<ExpenseItem & { month?: number; category?: string }>,
    (item) =>
      isProjectExpense(item as ExpenseItem)
        ? getProjectItems(item as ProjectExpense).reduce((s, sub) => s + sub.amount, 0)
        : (item as TransactionItem).amount,
  )

  // 로딩/에러 상태
  if (data.loading) return <div data-loading>로딩 중…</div>
  if (data.error) return <div data-error>데이터를 불러올 수 없습니다</div>

  return (
    <div className={styles.layout}>
      {/* 연도 선택 */}
      <YearSelect years={years} currentYear={year} balance={balance} onYearChange={setYear} />

      {/* 반복 테이블 */}
      <div className={styles.recurringSection}>
        {source !== "family" && (
          <RecurringTable
            items={incomeRecurring}
            path={incomeRecurringPath}
            type="income"
            discrepancy={discrepancy}
            categories={incomeRecurringCategories}
            onAutoAdjust={handleAutoAdjustIncomeRecurring}
          />
        )}
        <RecurringTable
          items={expenseRecurring}
          path={expenseRecurringPath}
          type="expense"
          discrepancy={discrepancy}
          categories={expenseRecurringCategories}
          onAutoAdjust={handleAutoAdjustExpenseRecurring}
        />
      </div>

      {/* 수입/지출 테이블 */}
      <div className={styles.itemsSection}>
        {/* 수입 */}
        <div className={styles.incomeColumn}>
          <ItemsTable
            items={incomeItems}
            path={incomePath}
            type="income"
            categories={incomeItemCategories}
            activeTab={incomeSubTabs.activeTab}
            discrepancy={discrepancy}
            onAutoAdjust={handleAutoAdjustIncomeItem}
            tabs={
              <SubTabs
                tabs={viewMode !== "raw" ? incomeSubTabs.tabs : []}
                activeTab={incomeSubTabs.activeTab}
                onTabChange={incomeSubTabs.setActiveTab}
                labelFn={
                  viewMode === "monthly"
                    ? (t) => (typeof t === "number" ? `${t}월` : "미지정")
                    : undefined
                }
              />
            }
          />
        </div>

        {/* 지출 */}
        <div className={styles.expenseColumn}>
          <ItemsTable
            items={expenseItems}
            path={expensePath}
            type="expense"
            categories={expenseItemCategories}
            activeTab={expenseSubTabs.activeTab}
            discrepancy={discrepancy}
            onAutoAdjust={handleAutoAdjustExpenseItem}
            tabs={
              <SubTabs
                tabs={viewMode !== "raw" ? expenseSubTabs.tabs : []}
                activeTab={expenseSubTabs.activeTab}
                onTabChange={expenseSubTabs.setActiveTab}
                labelFn={
                  viewMode === "monthly"
                    ? (t) => (typeof t === "number" ? `${t}월` : "미지정")
                    : undefined
                }
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
