import { createFileRoute } from "@tanstack/react-router"
import { LoginPage } from "@/components/layout/LoginPage"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})
