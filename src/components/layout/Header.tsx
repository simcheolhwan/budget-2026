import { useCallback, useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { Toggle } from "@base-ui/react/toggle"
import { IconArrowsSort, IconLogout, IconMenu2 } from "@tabler/icons-react"
import styles from "./Header.module.css"
import type { ViewMode } from "@/stores/ui"
import { useUIStore } from "@/stores/ui"
import { signOut } from "@/lib/auth"
import { useAltKey } from "@/hooks/useAltKey"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

const NAV_ITEMS = [
  { to: "/", label: "나", shortcut: "1" },
  { to: "/family", label: "가족", shortcut: "2" },
  { to: "/budget", label: "예산", shortcut: "3" },
] as const

const VIEW_MODE_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: "raw", label: "원본" },
  { value: "monthly", label: "월별" },
  { value: "category", label: "분류별" },
]

interface HeaderProps {
  onOpenSidebar?: () => void
}

// 헤더: 메뉴(나/가족), 보기 모드, 정렬 토글, 로그아웃
export function Header({ onOpenSidebar }: HeaderProps) {
  const { pathname } = useLocation()
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const sortVisible = useUIStore((s) => s.sortVisible)
  const toggleSort = useUIStore((s) => s.toggleSort)
  const [showLogout, setShowLogout] = useState(false)
  const altPressed = useAltKey()

  const handleLogout = useCallback(async () => {
    await signOut()
  }, [])

  return (
    <header className={styles.header}>
      {sortVisible && (
        <div className={styles.sortBanner} role="status">
          정렬 모드
        </div>
      )}
      {/* 사이드바 토글 (모바일) */}
      {onOpenSidebar && (
        <button
          className={styles.sidebarToggle}
          type="button"
          onClick={onOpenSidebar}
          aria-label="사이드바 열기"
        >
          <IconMenu2 size={18} aria-hidden />
        </button>
      )}

      {/* 좌측: 메뉴 */}
      <nav className={styles.nav} aria-label="메뉴">
        {NAV_ITEMS.map(({ to, label, shortcut }) => (
          <Link
            key={to}
            className={styles.navLink}
            to={to}
            aria-current={pathname === to ? "page" : undefined}
          >
            {label}
            {altPressed && (
              <kbd className={styles.shortcutBadge} aria-hidden>
                {shortcut}
              </kbd>
            )}
          </Link>
        ))}
      </nav>

      {/* 우측: 보기 모드 + 정렬 + 로그아웃 */}
      <div className={styles.actions}>
        {/* 보기 모드 */}
        <ToggleGroup
          className={styles.viewModeGroup}
          value={[viewMode]}
          onValueChange={(values) => {
            const next = values[0] as ViewMode | undefined
            if (next) setViewMode(next)
          }}
          aria-label="보기 모드"
        >
          {VIEW_MODE_OPTIONS.map((opt) => (
            <Toggle
              className={styles.viewModeToggle}
              key={opt.value}
              value={opt.value}
              aria-label={opt.label}
            >
              {opt.label}
            </Toggle>
          ))}
        </ToggleGroup>

        {/* 정렬 토글 */}
        <Toggle
          className={styles.sortToggle}
          pressed={sortVisible}
          onPressedChange={toggleSort}
          aria-label="정렬 모드"
        >
          <IconArrowsSort size={18} aria-hidden />
        </Toggle>

        {/* 로그아웃 */}
        <button
          className={styles.logoutButton}
          type="button"
          onClick={() => setShowLogout(true)}
          aria-label="로그아웃"
        >
          <IconLogout size={18} aria-hidden />
        </button>

        <ConfirmDialog
          open={showLogout}
          onClose={() => setShowLogout(false)}
          onConfirm={handleLogout}
          title="로그아웃"
          description="로그아웃하시겠습니까?"
          confirmLabel="로그아웃"
        />
      </div>
    </header>
  )
}
