import { useMemo } from "react"
import type { BalanceItem } from "@/schemas"
import { useFirebaseData } from "@/contexts/FirebaseDataContext"

interface UseBalancesResult {
  accounts: Array<BalanceItem>
  receivables: Array<BalanceItem>
  deposits: Array<BalanceItem>
  loading: boolean
  error: Error | null
}

// 계좌/미수금/예수금 로드.
// 루트 구독에서 파생. Sidebar의 BalanceTable과 useSummary에서 사용.
export function useBalances(): UseBalancesResult {
  const { data, loading, error } = useFirebaseData().balances

  return useMemo(
    () => ({
      accounts: data?.accounts ?? [],
      receivables: data?.receivables ?? [],
      deposits: data?.deposits ?? [],
      loading,
      error,
    }),
    [data, loading, error],
  )
}
