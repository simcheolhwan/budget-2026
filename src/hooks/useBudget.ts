import { useFirebaseSync } from "./useFirebaseSync"
import type { Budget } from "@/schemas"
import { budgetPath } from "@/lib/paths"

// 예산 로드. BudgetPage에서 소진율 분석에 사용.
export function useBudget() {
  return useFirebaseSync<Budget>(budgetPath())
}
