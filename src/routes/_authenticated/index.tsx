import { createFileRoute } from "@tanstack/react-router"
import { BudgetLayout } from "@/components/shared/BudgetLayout"
import { useUIStore } from "@/stores/ui"

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    useUIStore.getState().resetYear()
  },
  component: PersonalRoute,
})

function PersonalRoute() {
  return <BudgetLayout source="personal" />
}
