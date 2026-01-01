import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import routes from "./app/routes"
import Auth from "./firebase/Auth"
import Database from "./firebase/Database"
import theme from "./theme"
import "@mantine/core/styles.css"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ModalsProvider>
        <Auth>
          <Database>
            <RouterProvider router={createBrowserRouter(routes)} />
          </Database>
        </Auth>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
)
