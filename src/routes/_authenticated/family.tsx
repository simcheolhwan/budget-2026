import { createFileRoute } from "@tanstack/react-router"
import { BudgetLayout } from "@/components/shared/BudgetLayout"
import { useUIStore } from "@/stores/ui"

export const Route = createFileRoute("/_authenticated/family")({
  component: FamilyRoute,
})

function FamilyRoute() {
  // 라우트 변경 시 연도 초기화
  useUIStore.getState().resetYear()
  return <BudgetLayout source="family" />
}
