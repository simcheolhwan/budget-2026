import { useCallback, useMemo, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Meter } from "@base-ui/react/meter"
import styles from "./BudgetTracker.module.css"
import type { BudgetGroup, BudgetItem, ExpenseItem, Recurring } from "@/schemas"
import { NumberCell } from "@/components/shared/NumberCell"
import {
  buildSpendingMap,
  calculateBurnRate,
  sumBudgetGroups,
  sumExpenseItems,
  sumRecurring,
} from "@/lib/calculations"
import { write } from "@/lib/database"
import { budgetPath } from "@/lib/paths"
import { getCurrentYear } from "@/lib/utils"
import { useBudget } from "@/hooks/useBudget"
import { useYearData } from "@/hooks/useYearData"

// 소진율 상태 판정
const burnStatus = (rate: number | null) => {
  if (rate === null) return undefined
  const pct = Math.round(rate * 100)
  return pct > 100 ? "over" : pct >= 80 ? "warning" : "safe"
}

// 만원/억원 단위 포맷 (값은 K단위, 10K = 1만원)
const formatMan = (value: number) => {
  const man = Math.round(value / 10)
  if (Math.abs(man) > 9999) {
    const eok = man / 10000
    return `${eok.toFixed(2)}억원`
  }
  return `${man}만원`
}

// 예산 페이지
export function BudgetTracker() {
  const { data: budget } = useBudget()
  const currentYear = getCurrentYear()
  const data = useYearData("family", currentYear)

  if (!budget) return <div data-loading>로딩 중…</div>
  if (data.loading) return <div data-loading>로딩 중…</div>
  if (data.error) return <div data-error>데이터를 불러올 수 없습니다</div>

  return (
    <BudgetContent
      budget={budget}
      expenseItems={data.expenseItems}
      expenseRecurring={data.expenseRecurring}
    />
  )
}

function BudgetContent({
  budget,
  expenseItems,
  expenseRecurring,
}: {
  budget: NonNullable<ReturnType<typeof useBudget>["data"]>
  expenseItems: Array<ExpenseItem>
  expenseRecurring: Array<Recurring>
}) {
  const monthlyBudgetSum = useMemo(() => sumBudgetGroups(budget.monthly), [budget.monthly])
  const annualBudgetSum = useMemo(() => sumBudgetGroups(budget.annual), [budget.annual])
  const totalBudget = monthlyBudgetSum * 12 + annualBudgetSum
  const totalSpent = useMemo(
    () => sumExpenseItems(expenseItems) + sumRecurring(expenseRecurring),
    [expenseItems, expenseRecurring],
  )
  const spendingMap = useMemo(
    () => buildSpendingMap(expenseItems, expenseRecurring),
    [expenseItems, expenseRecurring],
  )

  const handleUpdateBudgetItem = useCallback(
    async (
      section: "monthly" | "annual",
      groupIndex: number,
      itemIndex: number,
      newAmount: number,
    ) => {
      const groups = [...budget[section]]
      const group = { ...groups[groupIndex] }
      const items = [...group.items]
      items[itemIndex] = { ...items[itemIndex], amount: newAmount }
      group.items = items
      groups[groupIndex] = group
      await write(budgetPath(), { ...budget, [section]: groups })
    },
    [budget],
  )

  const totalBurnRate = calculateBurnRate(totalSpent, totalBudget)
  const totalRemaining = totalBudget - totalSpent

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>예산</h2>
          <span className={styles.summary}>
            <span className={styles.headerLabel}>예산</span> {formatMan(totalBudget)}
            <span className={styles.headerSpent}>
              <span className={styles.headerLabel}>지출</span> {formatMan(totalSpent)}
            </span>
            <span className={styles.headerRemaining} data-status={burnStatus(totalBurnRate)}>
              <span className={styles.headerLabel}>잔액</span> {formatMan(totalRemaining)}
            </span>
          </span>
        </div>
        {totalBurnRate !== null && <BurnRateMeter value={totalBurnRate} />}
      </header>

      {budget.monthly.length > 0 && (
        <BudgetTable
          title="월간"
          groups={budget.monthly}
          multiplier={12}
          totalBudget={totalBudget}
          spendingMap={spendingMap}
          onUpdateAmount={(gi, ii, v) => handleUpdateBudgetItem("monthly", gi, ii, v)}
        />
      )}
      {budget.annual.length > 0 && (
        <BudgetTable
          title="연간"
          groups={budget.annual}
          multiplier={1}
          totalBudget={totalBudget}
          spendingMap={spendingMap}
          onUpdateAmount={(gi, ii, v) => handleUpdateBudgetItem("annual", gi, ii, v)}
        />
      )}
    </div>
  )
}

// rowSpan 계산: 동일 category 연속 행 그룹
function computeRowSpans(groups: ReadonlyArray<BudgetGroup>): Map<string, number> {
  const spans = new Map<string, number>()
  for (const [gi, group] of groups.entries()) {
    spans.set(`${gi}-0`, group.items.length)
  }
  return spans
}

// 월간/연간 예산 표
function BudgetTable({
  title,
  groups,
  multiplier,
  totalBudget,
  spendingMap,
  onUpdateAmount,
}: {
  title: string
  groups: ReadonlyArray<BudgetGroup>
  multiplier: number
  totalBudget: number
  spendingMap: Map<string, number>
  onUpdateAmount: (groupIndex: number, itemIndex: number, value: number) => Promise<void>
}) {
  const isMonthly = multiplier > 1

  // 합계 계산
  const totals = useMemo(() => {
    let budget = 0
    let annualized = 0
    let spent = 0

    for (const group of groups) {
      for (const item of group.items) {
        budget += item.amount
        annualized += item.amount * multiplier
        spent += spendingMap.get(item.name) ?? 0
      }
    }

    return {
      budget,
      annualized,
      spent,
      remaining: annualized - spent,
      burnRate: calculateBurnRate(spent, annualized),
    }
  }, [groups, multiplier, spendingMap])

  const rowSpans = useMemo(() => computeRowSpans(groups), [groups])

  // 분류별 연환산 합계
  const categoryAnnualized = useMemo(
    () => groups.map((g) => g.items.reduce((sum, item) => sum + item.amount * multiplier, 0)),
    [groups, multiplier],
  )

  const pct = (v: number) => (totalBudget > 0 ? Math.round((v / totalBudget) * 100) : 0)

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.colCategory} />
          <col />
          <col className={styles.colBudget} />
          <col className={styles.colAmount} />
          <col className={styles.colAmount} />
          <col className={styles.colMeter} />
        </colgroup>
        <thead>
          <tr>
            <th>분류</th>
            <th>항목</th>
            <th className={styles.numCol}>예산</th>
            <th className={styles.numCol}>지출</th>
            <th className={styles.numCol}>남은 금액</th>
            <th>소진율</th>
          </tr>
          <tr className={styles.totalRow}>
            <td colSpan={2}>합계</td>
            <td className={styles.numCol}>
              {formatMan(totals.budget)}
              <span className={styles.annualized}>
                {isMonthly
                  ? ` × 12 = ${formatMan(totals.annualized)}`
                  : ` = ${formatMan(totals.annualized)}`}
              </span>
            </td>
            <td className={styles.numCol}>{formatMan(totals.spent)}</td>
            <td className={styles.numCol} data-status={burnStatus(totals.burnRate)}>
              {formatMan(totals.remaining)}
            </td>
            <td>{totals.burnRate !== null && <BurnRateMeter value={totals.burnRate} />}</td>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) =>
            group.items.map((item, ii) => {
              const spent = spendingMap.get(item.name) ?? 0
              const annualized = item.amount * multiplier
              const remaining = annualized - spent
              const burnRate = calculateBurnRate(spent, annualized)
              const span = rowSpans.get(`${gi}-${ii}`)

              return (
                <tr key={`${gi}-${ii}`}>
                  {span !== undefined && (
                    <td rowSpan={span}>
                      {group.category}
                      <span className={styles.pct}>{pct(categoryAnnualized[gi])}%</span>
                    </td>
                  )}
                  <td>
                    <CardName item={item} />
                    <span className={styles.pctInline}>{pct(annualized)}%</span>
                  </td>
                  <td className={styles.numCol}>
                    <NumberCell
                      value={item.amount}
                      discrepancy={0}
                      onUpdate={(v) => onUpdateAmount(gi, ii, v)}
                    />
                    <span className={styles.annualized}>
                      {isMonthly
                        ? ` × 12 = ${formatMan(annualized)}`
                        : ` = ${formatMan(annualized)}`}
                    </span>
                  </td>
                  <td className={styles.numCol}>{formatMan(spent)}</td>
                  <td className={styles.numCol} data-status={burnStatus(burnRate)}>
                    {formatMan(remaining)}
                  </td>
                  <td>{burnRate !== null && <BurnRateMeter value={burnRate} />}</td>
                </tr>
              )
            }),
          )}
        </tbody>
      </table>
    </section>
  )
}

// 소진율 미터
function BurnRateMeter({ value }: { value: number }) {
  const percent = Math.round(value * 100)
  // 미터 표시용: 0~100 범위로 클램프 (초과분은 색상으로 표현)
  const clampedPercent = Math.min(percent, 100)
  const status = percent > 100 ? "over" : percent >= 80 ? "warning" : "safe"

  return (
    <Meter.Root
      value={clampedPercent}
      className={styles.meter}
      data-status={status}
      aria-label="소진율"
      getAriaValueText={() => `${percent}% 소진`}
    >
      <Meter.Track className={styles.meterTrack}>
        <Meter.Indicator className={styles.meterIndicator} />
      </Meter.Track>
    </Meter.Root>
  )
}

// 항목 이름 + 메모 다이얼로그
function CardName({ item }: { item: BudgetItem }) {
  const [open, setOpen] = useState(false)

  if (!item.memo) {
    return <span className={styles.itemName}>{item.name}</span>
  }

  return (
    <span className={styles.itemName}>
      {item.name}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={styles.memoIndicator}>
          <span aria-hidden>i</span>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.memoBackdrop} />
          <Dialog.Popup className={styles.memoPopup}>
            <Dialog.Title className={styles.memoTitle}>{item.name}</Dialog.Title>
            <p className={styles.memoContent}>{item.memo}</p>
            <footer className={styles.memoFooter}>
              <Dialog.Close className={styles.memoClose}>닫기</Dialog.Close>
            </footer>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </span>
  )
}
