import { createFileRoute } from "@tanstack/react-router"
import { LedgerLayout } from "@/components/shared/LedgerLayout"
import { useUIStore } from "@/stores/ui"

export const Route = createFileRoute("/_authenticated/family")({
  beforeLoad: () => {
    useUIStore.getState().resetYear()
  },
  component: FamilyRoute,
})

function FamilyRoute() {
  return <LedgerLayout source="family" />
}
