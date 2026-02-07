import { createFileRoute } from "@tanstack/react-router"
import { BudgetPage } from "@/components/family/BudgetPage"

export const Route = createFileRoute("/_authenticated/budget")({
  component: BudgetPage,
})
