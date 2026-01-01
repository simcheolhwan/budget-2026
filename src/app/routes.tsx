import App from "./App"
import Dashboard from "../pages/dashboard/Dashboard"
import Full from "../pages/full/Full"

export const nav = [
  { path: "/", label: "현황", element: <Dashboard /> },
  { path: "/full", label: "전체", element: <Full /> },
]

const routes = [
  {
    path: "/",
    element: <App />,
    children: nav,
  },
]

export default routes
