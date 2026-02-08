import { useMemo } from "react"
import { useFirebaseData } from "@/contexts/FirebaseDataContext"

// DB에 기록된 모든 연도 목록 추출 (오래된 순).
// YearSelect 드롭다운과 Alt+←/→ 연도 이동의 범위를 결정한다.
export function useAvailableYears(source: "personal" | "family") {
  const firebaseData = useFirebaseData()
  const { data, loading } = firebaseData[source]

  const years = useMemo(() => {
    if (!data) return []
    return Object.keys(data)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b)
  }, [data])

  return { years, loading }
}
