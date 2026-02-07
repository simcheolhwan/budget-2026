import styles from "./Sidebar.module.css"
import { useBalances } from "@/hooks/useBalances"
import { useSummary } from "@/hooks/useSummary"
import { useUIStore } from "@/stores/ui"
import { balancesPath } from "@/lib/paths"
import { formatNumber } from "@/lib/utils"
import { BalanceTable } from "@/components/shared/BalanceTable"

// 사이드바: 오차 표시 + 계좌/미수금/예수금 테이블
export function Sidebar() {
  const sortVisible = useUIStore((s) => s.sortVisible)
  const { accounts, receivables, deposits } = useBalances()
  const { discrepancy, isCurrentYear } = useSummary()

  return (
    <aside className={styles.sidebar}>
      {/* 오차 표시 */}
      <section className={styles.discrepancy}>
        <h3>오차</h3>
        {!isCurrentYear ? (
          <span className={styles.discrepancyNa}>해당 없음</span>
        ) : discrepancy === 0 ? (
          <span className={styles.discrepancyNone}>없음</span>
        ) : (
          <span
            className={styles.discrepancyValue}
            data-positive={discrepancy > 0 || undefined}
            data-negative={discrepancy < 0 || undefined}
          >
            {formatNumber(discrepancy)}
          </span>
        )}
      </section>

      <BalanceTable
        title="계좌"
        items={accounts}
        path={balancesPath("accounts")}
        discrepancy={discrepancy}
        sortVisible={sortVisible}
        autoAdjustSign={-1}
      />

      <BalanceTable
        title="미수금"
        items={receivables}
        path={balancesPath("receivables")}
        discrepancy={discrepancy}
        sortVisible={sortVisible}
        autoAdjustSign={-1}
      />

      <BalanceTable
        title="예수금"
        items={deposits}
        path={balancesPath("deposits")}
        discrepancy={discrepancy}
        sortVisible={sortVisible}
        autoAdjustSign={1}
      />
    </aside>
  )
}
