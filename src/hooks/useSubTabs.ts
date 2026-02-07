import { useEffect, useState } from "react"
import { useLocation } from "@tanstack/react-router"
import type { ViewMode } from "@/stores/ui"
import { useUIStore } from "@/stores/ui"
import { extractCategories, extractMonths } from "@/lib/grouping"

interface SubTabsResult {
  // 선택 가능한 탭 값 목록 (undefined = 지정되지 않은 항목)
  tabs: Array<number | string | undefined>
  // 현재 선택된 탭 (null = "모두")
  activeTab: number | string | undefined | null
  setActiveTab: (value: number | string | undefined | null) => void
  viewMode: ViewMode
}

// 서브탭 로컬 상태 관리.
// viewMode에 따라 extractMonths(월별) 또는 extractCategories(분류별) 탭 목록을 생성.
// route, viewMode, year 변경 시 activeTab을 "모두"(null)로 리셋.
export function useSubTabs<T extends { month?: number; category?: string }>(
  items: ReadonlyArray<T>,
  getAmount: (item: T) => number,
): SubTabsResult {
  const viewMode = useUIStore((s) => s.viewMode)
  const year = useUIStore((s) => s.year)
  const { pathname } = useLocation()
  const [activeTab, setActiveTab] = useState<number | string | undefined | null>(null)

  // route/viewMode/year 변경 시 "모두"로 리셋
  useEffect(() => {
    setActiveTab(null)
  }, [pathname, viewMode, year])

  const tabs: Array<number | string | undefined> =
    viewMode === "monthly"
      ? extractMonths(items)
      : viewMode === "category"
        ? extractCategories(items, getAmount)
        : []

  return { tabs, activeTab, setActiveTab, viewMode }
}
