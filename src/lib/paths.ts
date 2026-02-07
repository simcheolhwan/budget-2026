// Firebase Realtime Database 경로 헬퍼.
// DB 구조: { personal/{year}/..., family/{year}/..., balances/..., budget/... }

// 잔액 경로 (사이드바 BalanceTable)
export const balancesPath = (type: "accounts" | "receivables" | "deposits") =>
  `balances/${type}` as const

// 개인 가계부 경로. useYearData("personal")에서 4개 조합으로 사용.
export const personalPath = (
  year: number,
  section: "incomes" | "expenses",
  sub: "items" | "recurring",
) => `personal/${year}/${section}/${sub}` as const

// 가족 가계부 경로. useYearData("family")에서 4개 조합으로 사용.
export const familyPath = (
  year: number,
  section: "incomes" | "expenses",
  sub: "items" | "recurring",
) => `family/${year}/${section}/${sub}` as const

// source 기반 통합 경로. BudgetLayout에서 source만으로 경로 계산.
export const sourcePath = (
  source: "personal" | "family",
  year: number,
  section: "incomes" | "expenses",
  sub: "items" | "recurring",
) => (source === "personal" ? personalPath : familyPath)(year, section, sub)

// 예산 경로 (BudgetPage)
export const budgetPath = () => "budget" as const

// 연도 목록 탐색용 루트 경로 (useAvailableYears에서 키 목록을 추출)
export const personalRootPath = () => "personal" as const
export const familyRootPath = () => "family" as const
