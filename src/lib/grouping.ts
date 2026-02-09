// 데이터 그루핑 유틸리티. useSubTabs에서 월별/분류별 탭 목록 생성에 사용.

// 데이터에서 존재하는 월 목록 추출 (정렬됨, undefined 맨 앞).
// viewMode가 "monthly"일 때 서브탭 목록을 구성한다.
export const extractMonths = <T extends { month?: number }>(
  items: ReadonlyArray<T>,
): Array<number | undefined> => {
  const months = new Set<number>()
  let hasUndefined = false
  for (const item of items) {
    if (item.month === undefined) {
      hasUndefined = true
    } else {
      months.add(item.month)
    }
  }
  const sorted = [...months].sort((a, b) => a - b)
  return hasUndefined ? [undefined, ...sorted] : sorted
}

// 데이터에서 존재하는 분류 목록 추출 (총금액 내림차순, undefined 맨 앞).
// viewMode가 "category"일 때 서브탭 목록을 구성한다.
export const extractCategories = <T extends { category?: string }>(
  items: ReadonlyArray<T>,
  getAmount: (item: T) => number,
): Array<string | undefined> => {
  const totals = new Map<string | undefined, number>()
  for (const item of items) {
    const key = item.category
    totals.set(key, (totals.get(key) ?? 0) + getAmount(item))
  }

  let hasUndefined = false
  const entries: Array<[string, number]> = []
  for (const [key, total] of totals) {
    if (key === undefined) {
      hasUndefined = true
    } else {
      entries.push([key, total])
    }
  }

  const sorted = entries.sort((a, b) => b[1] - a[1]).map(([key]) => key)
  return hasUndefined ? [undefined, ...sorted] : sorted
}

// 지난 12개월간 사용된 분류 수집 (빈도 높은 순).
// 폼의 분류 자동완성 목록에 사용.
// 올해 items 중 currentMonth 이하 + 작년 items 중 currentMonth 초과를 합산.
// recurring 호출 시 currentMonth=12로 전달하면 양쪽 모두 포함.
export const collectCategoriesFromItems = (
  currentItems: ReadonlyArray<{ month?: number; category?: string }>,
  prevItems: ReadonlyArray<{ month?: number; category?: string }>,
  currentMonth: number,
): Array<string> => {
  const counts = new Map<string, number>()
  const count = (category: string | undefined) => {
    if (!category) return
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  for (const item of currentItems) {
    if (item.month === undefined || item.month <= currentMonth) count(item.category)
  }
  for (const item of prevItems) {
    if (item.month === undefined || item.month > currentMonth) count(item.category)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category)
}
