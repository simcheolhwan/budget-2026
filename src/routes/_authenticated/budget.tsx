import { createFileRoute } from "@tanstack/react-router"
import { BudgetTracker } from "@/components/budget/BudgetTracker"

export const Route = createFileRoute("/_authenticated/budget")({
  component: BudgetTracker,
})
