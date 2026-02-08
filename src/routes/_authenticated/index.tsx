import { createFileRoute } from "@tanstack/react-router"
import { LedgerLayout } from "@/components/shared/LedgerLayout"
import { useUIStore } from "@/stores/ui"

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    useUIStore.getState().resetYear()
  },
  component: PersonalRoute,
})

function PersonalRoute() {
  return <LedgerLayout source="personal" />
}
