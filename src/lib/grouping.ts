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

// 특정 항목 목록에서 분류 수집 (빈도 높은 순).
// 폼의 분류 자동완성 목록에 사용. 전 연도 데이터에서 추출한다.
export const collectCategoriesFromItems = (
  items: ReadonlyArray<{ category?: string }>,
  recurring: ReadonlyArray<{ category?: string }>,
): Array<string> => {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (!item.category) continue
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  }
  for (const item of recurring) {
    if (!item.category) continue
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category)
}
