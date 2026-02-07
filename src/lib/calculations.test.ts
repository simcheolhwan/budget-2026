import { describe, expect, it } from "vitest"
import {
  calculateBalance,
  calculateBurnRate,
  calculateDiscrepancy,
  calculateNetAssets,
  getItemSpending,
  sumAmounts,
  sumBalanceItems,
  sumBudgetGroups,
  sumExpenseItems,
  sumRecurring,
  sumRecurringByMonth,
} from "./calculations"
import type { BalanceItem, BudgetGroup, ExpenseItem, Recurring, TransactionItem } from "@/schemas"

describe("sumAmounts", () => {
  it("금액을 합산한다", () => {
    const items: Array<TransactionItem> = [
      { amount: 100, name: "A" },
      { amount: 200, name: "B" },
      { amount: -50, name: "C" },
    ]
    expect(sumAmounts(items)).toBe(250)
  })

  it("빈 배열은 0을 반환한다", () => {
    expect(sumAmounts([])).toBe(0)
  })
})

describe("sumExpenseItems", () => {
  it("일반 항목과 프로젝트 항목을 모두 합산한다", () => {
    const items: Array<ExpenseItem> = [
      { amount: 100, name: "일반" },
      { name: "프로젝트", items: [{ amount: 200 }, { amount: 300 }] },
    ]
    expect(sumExpenseItems(items)).toBe(600)
  })
})

describe("sumRecurring", () => {
  it("모든 월 금액을 합산한다", () => {
    const recurring: Array<Recurring> = [
      { name: "월세", monthly: { "1": 1000, "2": 1000, "3": 1000 } },
      { name: "구독", monthly: { "1": 100, "2": 100 } },
    ]
    expect(sumRecurring(recurring)).toBe(3200)
  })

  it("빈 배열은 0을 반환한다", () => {
    expect(sumRecurring([])).toBe(0)
  })
})

describe("sumRecurringByMonth", () => {
  it("특정 월의 금액을 합산한다", () => {
    const recurring: Array<Recurring> = [
      { name: "월세", monthly: { "1": 1000, "2": 1200 } },
      { name: "구독", monthly: { "1": 100 } },
    ]
    expect(sumRecurringByMonth(recurring, 1)).toBe(1100)
    expect(sumRecurringByMonth(recurring, 2)).toBe(1200)
    expect(sumRecurringByMonth(recurring, 3)).toBe(0)
  })
})

describe("sumBalanceItems", () => {
  it("잔액을 합산한다", () => {
    const items: Array<BalanceItem> = [
      { name: "계좌A", balance: 5000 },
      { name: "계좌B", balance: 3000 },
    ]
    expect(sumBalanceItems(items)).toBe(8000)
  })
})

describe("calculateBalance", () => {
  it("수지를 계산한다 (수입 - 지출)", () => {
    const incomes: Array<TransactionItem> = [{ amount: 5000 }]
    const expenses: Array<ExpenseItem> = [{ amount: 3000 }]
    const recurringIncomes: Array<Recurring> = [{ name: "급여", monthly: { "1": 1000 } }]
    const recurringExpenses: Array<Recurring> = [{ name: "월세", monthly: { "1": 500 } }]

    expect(calculateBalance(incomes, expenses, recurringIncomes, recurringExpenses)).toBe(2500)
  })
})

describe("calculateNetAssets", () => {
  it("순자산을 계산한다 (계좌 + 미수금 - 예수금)", () => {
    const accounts: Array<BalanceItem> = [{ name: "은행", balance: 10000 }]
    const receivables: Array<BalanceItem> = [{ name: "미수", balance: 2000 }]
    const deposits: Array<BalanceItem> = [{ name: "예수", balance: 1000 }]

    expect(calculateNetAssets(accounts, receivables, deposits)).toBe(11000)
  })
})

describe("calculateDiscrepancy", () => {
  it("오차가 0이면 정합성이 맞다", () => {
    expect(calculateDiscrepancy(10000, 6000, 4000)).toBe(0)
  })

  it("오차가 0이 아니면 불일치가 있다", () => {
    expect(calculateDiscrepancy(10000, 5000, 4000)).toBe(1000)
    expect(calculateDiscrepancy(10000, 7000, 4000)).toBe(-1000)
  })
})

describe("sumBudgetGroups", () => {
  it("모든 그룹의 항목 금액을 합산한다", () => {
    const groups: Array<BudgetGroup> = [
      {
        category: "식비",
        items: [
          { name: "외식", amount: 50000 },
          { name: "식료품", amount: 100000 },
        ],
      },
      { category: "교통", items: [{ name: "대중교통", amount: 30000 }] },
    ]
    expect(sumBudgetGroups(groups)).toBe(180000)
  })

  it("빈 배열은 0을 반환한다", () => {
    expect(sumBudgetGroups([])).toBe(0)
  })

  it("항목이 없는 그룹은 0으로 처리한다", () => {
    const groups: Array<BudgetGroup> = [{ category: "기타", items: [] }]
    expect(sumBudgetGroups(groups)).toBe(0)
  })
})

describe("getItemSpending", () => {
  it("카테고리 일치하는 일반 지출을 합산한다", () => {
    const expenses: Array<ExpenseItem> = [
      { category: "식비", amount: 5000 },
      { category: "교통", amount: 3000 },
      { category: "식비", amount: 2000 },
    ]
    expect(getItemSpending("식비", expenses, [])).toBe(7000)
  })

  it("카테고리 일치하는 프로젝트 지출을 합산한다", () => {
    const expenses: Array<ExpenseItem> = [
      { category: "인테리어", items: [{ amount: 100000 }, { amount: 50000 }] },
    ]
    expect(getItemSpending("인테리어", expenses, [])).toBe(150000)
  })

  it("이름 일치하는 반복 지출을 합산한다", () => {
    const recurring: Array<Recurring> = [
      { name: "월세", monthly: { "1": 1000, "2": 1000, "3": 1000 } },
      { name: "구독", monthly: { "1": 100 } },
    ]
    expect(getItemSpending("월세", [], recurring)).toBe(3000)
  })

  it("일반 지출과 반복 지출을 모두 합산한다", () => {
    const expenses: Array<ExpenseItem> = [{ category: "식비", amount: 5000 }]
    const recurring: Array<Recurring> = [{ name: "식비", monthly: { "1": 1000, "2": 1000 } }]
    expect(getItemSpending("식비", expenses, recurring)).toBe(7000)
  })

  it("일치 항목이 없으면 0을 반환한다", () => {
    const expenses: Array<ExpenseItem> = [{ category: "교통", amount: 3000 }]
    const recurring: Array<Recurring> = [{ name: "구독", monthly: { "1": 100 } }]
    expect(getItemSpending("식비", expenses, recurring)).toBe(0)
  })
})

describe("calculateBurnRate", () => {
  it("정상 소진율을 계산한다", () => {
    expect(calculateBurnRate(500, 1000)).toBe(0.5)
  })

  it("지출 0이면 0을 반환한다", () => {
    expect(calculateBurnRate(0, 1000)).toBe(0)
  })

  it("전액 소진이면 1을 반환한다", () => {
    expect(calculateBurnRate(1000, 1000)).toBe(1)
  })

  it("초과 지출이면 1을 초과한다", () => {
    expect(calculateBurnRate(1500, 1000)).toBe(1.5)
  })

  it("예산 0이면 null을 반환한다", () => {
    expect(calculateBurnRate(500, 0)).toBeNull()
  })

  it("예산 음수이면 null을 반환한다", () => {
    expect(calculateBurnRate(500, -100)).toBeNull()
  })
})
