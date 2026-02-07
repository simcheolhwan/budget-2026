// 전체 검색 기능 (⌘K SearchDialog에서 사용).
// buildSearchIndex로 모든 연도/유형의 데이터를 평탄화한 뒤, searchItems로 실시간 필터링.
// 프로젝트 지출의 경우 하위 항목 각각이 별도의 검색 결과로 노출된다.
import { getProjectItems, isProjectExpense } from "./utils"
import type { ExpenseItem, TransactionItem, YearData } from "@/schemas"

export interface SearchResult {
  source: "personal" | "family"
  year: number
  month?: number
  name?: string
  memo?: string
  amount: number
  category?: string
  /** 프로젝트 하위 항목인 경우 상위 프로젝트 이름 */
  projectName?: string
}

// 거래 항목을 검색 결과로 변환
const transactionToResult = (
  item: TransactionItem,
  source: "personal" | "family",
  year: number,
  projectName?: string,
): SearchResult => ({
  source,
  year,
  month: item.month,
  name: item.name,
  memo: item.memo,
  amount: item.amount,
  category: item.category,
  projectName,
})

// 지출 항목을 검색 결과로 변환 (프로젝트 하위 항목 포함)
const expenseToResults = (
  item: ExpenseItem,
  source: "personal" | "family",
  year: number,
): Array<SearchResult> => {
  if (!isProjectExpense(item)) {
    return [transactionToResult(item, source, year)]
  }

  // 프로젝트 하위 항목
  return getProjectItems(item).map((sub) => transactionToResult(sub, source, year, item.name))
}

// 검색 인덱스 구축. 개인/가족의 모든 연도/수입/지출을 평탄화하여 단일 배열로 만든다.
// 반복(recurring) 항목은 포함하지 않는다. 결과는 연도 내림차순 정렬.
export const buildSearchIndex = (
  personalData: Record<string, YearData> | null,
  familyData: Record<string, YearData> | null,
): Array<SearchResult> => {
  const results: Array<SearchResult> = []

  const processYear = (data: Record<string, YearData> | null, source: "personal" | "family") => {
    if (!data) return

    for (const [yearStr, yearData] of Object.entries(data)) {
      const year = Number(yearStr)

      // 수입 (일반)
      for (const item of yearData.incomes?.items ?? []) {
        results.push(transactionToResult(item, source, year))
      }

      // 지출 (일반 + 프로젝트)
      for (const item of yearData.expenses?.items ?? []) {
        results.push(...expenseToResults(item, source, year))
      }
    }
  }

  processYear(personalData, "personal")
  processYear(familyData, "family")

  return results.sort((a, b) => b.year - a.year)
}

// 검색 실행. name, memo 필드에 대해 대소문자 무시 부분 일치.
export const searchItems = (
  query: string,
  index: ReadonlyArray<SearchResult>,
): Array<SearchResult> => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return index.filter((item) => {
    const name = item.name?.toLowerCase() ?? ""
    const memo = item.memo?.toLowerCase() ?? ""
    const projectName = item.projectName?.toLowerCase() ?? ""
    return (
      name.includes(normalized) || memo.includes(normalized) || projectName.includes(normalized)
    )
  })
}
