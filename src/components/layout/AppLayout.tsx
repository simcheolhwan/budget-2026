import { useCallback, useState } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { SidebarDrawer } from "./SidebarDrawer"
import styles from "./AppLayout.module.css"
import type { ReactNode } from "react"
import { SearchDialog } from "@/components/shared/SearchDialog"
import { ShortcutHelpDialog } from "@/components/shared/ShortcutHelpDialog"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useUIStore } from "@/stores/ui"
import { useAvailableYears } from "@/hooks/useAvailableYears"

interface AppLayoutProps {
  children: ReactNode
}

// 인증 후 레이아웃: Header + Sidebar + Main + 검색
export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  // 연도 이동: 개인/가족 페이지에서만 동작
  const source = pathname === "/family" ? "family" : "personal"
  const canNavigateYear = pathname === "/" || pathname === "/family"
  const year = useUIStore((s) => s.year)
  const setYear = useUIStore((s) => s.setYear)
  const { years } = useAvailableYears(source)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openHelp = useCallback(() => setHelpOpen(true), [])
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const handleNavigate = useCallback((to: string) => navigate({ to }), [navigate])

  const handleYearNavigate = useCallback(
    (direction: -1 | 1) => {
      if (!canNavigateYear) return
      const currentIndex = years.indexOf(year)
      if (currentIndex === -1) return
      const nextIndex = currentIndex + direction
      if (nextIndex < 0 || nextIndex >= years.length) return
      setYear(years[nextIndex])
    },
    [canNavigateYear, years, year, setYear],
  )

  const handleAddExpense = useCallback(() => {
    document.dispatchEvent(new CustomEvent("expense:add"))
  }, [])

  useKeyboardShortcuts({
    onSearch: openSearch,
    onNavigate: handleNavigate,
    onYearNavigate: handleYearNavigate,
    onAddExpense: handleAddExpense,
    onHelp: openHelp,
  })

  return (
    <div className={styles.layout}>
      <Header onOpenSidebar={openSidebar} />

      <div className={styles.body}>
        <div className={styles.sidebarContainer}>
          <Sidebar />
        </div>

        <main className={styles.main}>{children}</main>
      </div>

      <SidebarDrawer open={sidebarOpen} onClose={closeSidebar} />
      <SearchDialog open={searchOpen} onClose={closeSearch} />
      <ShortcutHelpDialog open={helpOpen} onClose={closeHelp} />
    </div>
  )
}
