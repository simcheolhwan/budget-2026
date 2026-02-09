import { useEffect } from "react"

interface KeyboardShortcutHandlers {
  onSearch: () => void
  onNavigate: (to: string) => void
  onYearNavigate?: (direction: -1 | 1) => void
  onAddExpense?: () => void
  onHelp?: () => void
}

// 전역 키보드 단축키 (⌘K, Alt+1/2/3, Alt+←/→, Alt+N)
export function useKeyboardShortcuts({
  onSearch,
  onNavigate,
  onYearNavigate,
  onAddExpense,
  onHelp,
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
        // Alt+1/2/3 라우트 탐색 + Alt+P
        const routes: Record<string, string> = {
          Digit1: "/",
          Digit2: "/family",
          Digit3: "/budget",
          KeyP: "/projects",
        }
        const to = routes[e.code]
        if (to) {
          e.preventDefault()
          onNavigate(to)
          return
        }

        // Alt+N 지출 추가
        if (e.code === "KeyN" && onAddExpense) {
          e.preventDefault()
          onAddExpense()
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

      // ? 도움말 (modifier 없이, 입력 필드 외부에서만)
      if (e.key === "?" && !e.altKey && !e.metaKey && !e.ctrlKey && onHelp) {
        const tag = (e.target as HTMLElement).tagName
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault()
          onHelp()
        }
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onSearch, onNavigate, onYearNavigate, onAddExpense, onHelp])
}
