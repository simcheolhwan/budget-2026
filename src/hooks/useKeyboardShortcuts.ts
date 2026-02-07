import { useEffect } from "react"

interface KeyboardShortcutHandlers {
  onSearch: () => void
  onNavigate: (to: string) => void
  onYearNavigate?: (direction: -1 | 1) => void
}

// 전역 키보드 단축키 (⌘K, Alt+1/2/3, Alt+←/→)
export function useKeyboardShortcuts({
  onSearch,
  onNavigate,
  onYearNavigate,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K (macOS) 또는 Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onSearch()
        return
      }

      // Alt+키
      if (e.altKey) {
        // Alt+1/2/3 라우트 탐색
        const routes: Record<string, string> = { Digit1: "/", Digit2: "/family", Digit3: "/budget" }
        const to = routes[e.code]
        if (to) {
          e.preventDefault()
          onNavigate(to)
          return
        }

        // Alt+←/→ 연도 이동
        if (onYearNavigate) {
          if (e.code === "ArrowLeft") {
            e.preventDefault()
            onYearNavigate(-1)
            return
          }
          if (e.code === "ArrowRight") {
            e.preventDefault()
            onYearNavigate(1)
            return
          }
        }
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onSearch, onNavigate, onYearNavigate])
}
