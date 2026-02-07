import { useMemo } from "react"
import { useFirebaseSync } from "./useFirebaseSync"
import type { BalanceItem } from "@/schemas"
import { balancesPath } from "@/lib/paths"

interface UseBalancesResult {
  accounts: Array<BalanceItem>
  receivables: Array<BalanceItem>
  deposits: Array<BalanceItem>
  loading: boolean
  error: Error | null
}

// 계좌/미수금/예수금 로드.
// 3개 경로를 useFirebaseSync로 병렬 구독. Sidebar의 BalanceTable과 useSummary에서 사용.
export function useBalances(): UseBalancesResult {
  const accountsState = useFirebaseSync<Array<BalanceItem>>(balancesPath("accounts"))
  const receivablesState = useFirebaseSync<Array<BalanceItem>>(balancesPath("receivables"))
  const depositsState = useFirebaseSync<Array<BalanceItem>>(balancesPath("deposits"))

  const loading = accountsState.loading || receivablesState.loading || depositsState.loading
  const error = accountsState.error ?? receivablesState.error ?? depositsState.error

  return useMemo(
    () => ({
      accounts: accountsState.data ?? [],
      receivables: receivablesState.data ?? [],
      deposits: depositsState.data ?? [],
      loading,
      error,
    }),
    [accountsState.data, receivablesState.data, depositsState.data, loading, error],
  )
}
