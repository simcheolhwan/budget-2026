// 공통 유틸리티 함수. 외부 의존성 없는 순수 함수.
import type { ExpenseItem, ProjectExpense } from "@/schemas"

// 숫자 포맷팅 (천 단위 구분, 한국어 로케일)
const numberFormat = new Intl.NumberFormat("ko-KR")
export const formatNumber = (n: number): string => numberFormat.format(n)

// 연산자 입력 파싱. NumberCell에서 사용.
// "+100"/"-50" → 현재 값에 가감, 숫자만 → 절대값으로 교체, 빈 입력 → null.
export const parseOperatorInput = (input: string, current: number): number | null => {
  const trimmed = input.trim()
  if (trimmed === "") return null

  if (trimmed.startsWith("+") || trimmed.startsWith("-")) {
    const delta = Number(trimmed)
    return Number.isNaN(delta) ? null : current + delta
  }

  const value = Number(trimmed)
  return Number.isNaN(value) ? null : value
}

// month 기준 오름차순 정렬 (month 없는 항목 맨 앞).
// database.ts의 addItem/updateItem이 저장 전 호출하여 자동 정렬을 보장한다.
export const sortByMonth = <T extends { month?: number }>(items: Array<T>): Array<T> =>
  [...items].sort((a, b) => (a.month ?? 0) - (b.month ?? 0))

// 현재 연도
export const getCurrentYear = (): number => new Date().getFullYear()

// 현재 월
export const getCurrentMonth = (): number => new Date().getMonth() + 1

// ExpenseItem union을 분기하는 타입 가드.
// 계산(sumExpenseItems), 검색(expenseToResults), UI(ItemsTable) 전반에서 사용.
export const isProjectExpense = (item: ExpenseItem): item is ProjectExpense =>
  "items" in item && Array.isArray(item.items)
