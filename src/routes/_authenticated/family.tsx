import { createFileRoute } from "@tanstack/react-router"
import { BudgetLayout } from "@/components/shared/BudgetLayout"
import { useUIStore } from "@/stores/ui"

export const Route = createFileRoute("/_authenticated/family")({
  beforeLoad: () => {
    useUIStore.getState().resetYear()
  },
  component: FamilyRoute,
})

function FamilyRoute() {
  return <BudgetLayout source="family" />
}
