import { useMemo } from "react"
import { useFirebaseSync } from "./useFirebaseSync"
import { familyRootPath, personalRootPath } from "@/lib/paths"

// DB에 기록된 모든 연도 목록 추출 (오래된 순).
// YearSelect 드롭다운과 Alt+←/→ 연도 이동의 범위를 결정한다.
export function useAvailableYears(source: "personal" | "family") {
  const path = source === "personal" ? personalRootPath() : familyRootPath()
  const { data, loading } = useFirebaseSync<Record<string, unknown>>(path)

  const years = useMemo(() => {
    if (!data) return []
    return Object.keys(data)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b)
  }, [data])

  return { years, loading }
}
