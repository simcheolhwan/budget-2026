import { describe, expect, it } from "vitest"
import {
  AmountSchema,
  BalanceItemSchema,
  BudgetItemSchema,
  ProjectExpenseSchema,
  RecurringSchema,
  TransactionItemSchema,
} from "./index"

describe("AmountSchema", () => {
  it("정수를 허용한다", () => {
    expect(AmountSchema.parse(100)).toBe(100)
    expect(AmountSchema.parse(-500)).toBe(-500)
    expect(AmountSchema.parse(0)).toBe(0)
  })

  it("NaN을 거부한다", () => {
    expect(() => AmountSchema.parse(NaN)).toThrow()
  })

  it("Infinity를 거부한다", () => {
    expect(() => AmountSchema.parse(Infinity)).toThrow()
    expect(() => AmountSchema.parse(-Infinity)).toThrow()
  })

  it("소수점을 거부한다", () => {
    expect(() => AmountSchema.parse(1.5)).toThrow()
    expect(() => AmountSchema.parse(-0.1)).toThrow()
  })
})

describe("BalanceItemSchema", () => {
  it("정수 balance를 허용한다", () => {
    const result = BalanceItemSchema.parse({ name: "계좌", balance: 1000 })
    expect(result.balance).toBe(1000)
  })

  it("소수점 balance를 거부한다", () => {
    expect(() => BalanceItemSchema.parse({ name: "계좌", balance: 1.5 })).toThrow()
  })
})

describe("RecurringSchema", () => {
  it("정수 monthly 값을 허용한다", () => {
    const result = RecurringSchema.parse({ monthly: { "1": 100, "2": 200 } })
    expect(result.monthly["1"]).toBe(100)
  })

  it("소수점 monthly 값을 거부한다", () => {
    expect(() => RecurringSchema.parse({ monthly: { "1": 1.5 } })).toThrow()
  })
})

describe("BudgetItemSchema", () => {
  it("정수 amount를 허용한다", () => {
    const result = BudgetItemSchema.parse({ name: "식비", amount: 500 })
    expect(result.amount).toBe(500)
  })

  it("NaN을 거부한다", () => {
    expect(() => BudgetItemSchema.parse({ name: "식비", amount: NaN })).toThrow()
  })
})

describe("TransactionItemSchema", () => {
  it("BaseItem 필드를 포함한다", () => {
    const result = TransactionItemSchema.parse({
      category: "급여",
      month: 3,
      name: "월급",
      memo: "메모",
      amount: 1000,
    })
    expect(result.category).toBe("급여")
    expect(result.month).toBe(3)
    expect(result.name).toBe("월급")
    expect(result.memo).toBe("메모")
    expect(result.amount).toBe(1000)
  })
})

describe("ProjectExpenseSchema", () => {
  it("BaseItem 필드를 포함한다", () => {
    const result = ProjectExpenseSchema.parse({
      category: "프로젝트",
      month: 5,
      name: "리모델링",
      items: [{ name: "자재", amount: 100 }],
    })
    expect(result.category).toBe("프로젝트")
    expect(result.month).toBe(5)
    expect(result.name).toBe("리모델링")
    expect(result.items).toHaveLength(1)
  })
})
