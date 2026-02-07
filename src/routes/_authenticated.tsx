import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { authReady } from "@/lib/auth"
import { AppLayout } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    await authReady
    const { auth } = await import("@/lib/firebase")
    if (!auth.currentUser) {
      throw redirect({ to: "/login" })
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
