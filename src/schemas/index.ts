// 모든 모듈의 타입 출발점. Firebase Realtime Database의 JSON 구조와 1:1 대응한다.
// React Hook Form + Zod resolver로 폼 검증에도 활용된다.
import { z } from "zod"

// --- 기본 타입 ---

export const MonthSchema = z.int().min(1).max(12)
export type Month = z.infer<typeof MonthSchema>

export const AmountSchema = z.int()
export type Amount = z.infer<typeof AmountSchema>

// --- 공통 필드 (TransactionItem / ProjectExpense 공유) ---
// month가 optional인 이유: "월 미지정" 항목은 정렬 시 맨 앞으로 간다 (sortByMonth 참고).

const BaseItemFields = z.object({
  month: MonthSchema.optional(),
  category: z.string().optional(),
  name: z.string().optional(),
  memo: z.string().optional(),
})
export type BaseItem = z.infer<typeof BaseItemFields>

// --- 공통 거래 항목 ---
// 수입 항목과 일반 지출 항목의 기본 단위.

export const TransactionItemSchema = BaseItemFields.extend({
  amount: AmountSchema,
})
export type TransactionItem = z.infer<typeof TransactionItemSchema>

// --- 계좌 / 미수금 / 예수금 ---
// 사이드바의 잔액 테이블에 표시. 순자산 = 계좌 + 미수금 - 예수금.

export const BalanceItemSchema = z.object({
  category: z.string().optional(),
  name: z.string(),
  balance: z.int(),
  color: z.string().optional(),
})
export type BalanceItem = z.infer<typeof BalanceItemSchema>

// --- 반복 ---
// 월별 금액을 Record<월, 금액>으로 저장. RecurringTable에서 12개월 그리드로 표시.

export const RecurringSchema = z.object({
  category: z.string().optional(),
  name: z.string().optional(),
  monthly: z.record(z.string(), z.int()).optional(),
})
export type Recurring = z.infer<typeof RecurringSchema>

// --- 프로젝트 하위 항목 ---

export const ProjectItemSchema = z.object({
  name: z.string().optional(),
  amount: AmountSchema,
})
export type ProjectItem = z.infer<typeof ProjectItemSchema>

// --- 프로젝트 지출 ---
// amount 대신 items 배열을 가진다. 합계는 items의 amount 합으로 계산.

export const ProjectExpenseSchema = BaseItemFields.extend({
  items: z.array(ProjectItemSchema),
})
export type ProjectExpense = z.infer<typeof ProjectExpenseSchema>

// --- 지출 항목 (일반 + 프로젝트 union) ---
// isProjectExpense() 타입 가드로 분기. 계산(sumExpenseItems), 검색(expenseToResults),
// UI(ItemsTable 행 렌더링) 전반에 걸쳐 사용된다.

export const ExpenseItemSchema = z.union([TransactionItemSchema, ProjectExpenseSchema])
export type ExpenseItem = TransactionItem | ProjectExpense

// --- 예산 ---
// BudgetItem.name이 지출 항목의 category와 매칭되어 소진율을 계산한다.

export const BudgetItemSchema = z.object({
  amount: z.int(),
  name: z.string(),
  memo: z.string().optional(),
})
export type BudgetItem = z.infer<typeof BudgetItemSchema>

export const BudgetGroupSchema = z.object({
  category: z.string(),
  items: z.array(BudgetItemSchema),
})
export type BudgetGroup = z.infer<typeof BudgetGroupSchema>

// monthly: 매달 반복되는 예산, annual: 연 1회성 예산
export const BudgetSchema = z.object({
  monthly: z.array(BudgetGroupSchema),
  annual: z.array(BudgetGroupSchema),
})
export type Budget = z.infer<typeof BudgetSchema>

// --- 수입/지출 섹션 ---
// recurring(반복)과 items(개별)를 분리. 둘 다 합산하여 수지를 계산한다.

interface IncomeSection {
  recurring?: Array<Recurring>
  items?: Array<TransactionItem>
}

interface ExpenseSection {
  recurring?: Array<Recurring>
  items?: Array<ExpenseItem>
}

// --- 연간 가계부 ---
// 개인(personal)과 가족(family)이 동일한 구조를 공유한다.
// Firebase 경로: personal/{year} 또는 family/{year}

export interface YearData {
  incomes?: IncomeSection
  expenses?: ExpenseSection
  memo?: string
}

// --- 잔액 현황 ---
// Firebase 경로: balances/{accounts|receivables|deposits}

export interface Balances {
  accounts?: Array<BalanceItem>
  receivables?: Array<BalanceItem>
  deposits?: Array<BalanceItem>
}
