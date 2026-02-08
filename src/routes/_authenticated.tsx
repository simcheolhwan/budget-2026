import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { authReady } from "@/lib/auth"
import { AppLayout } from "@/components/layout/AppLayout"
import { FirebaseDataProvider } from "@/contexts/FirebaseDataContext"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    await authReady
    const { auth } = await import("@/lib/firebase")
    if (!auth.currentUser) {
      throw redirect({ to: "/login" })
    }
  },
  component: () => (
    <FirebaseDataProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </FirebaseDataProvider>
  ),
})
