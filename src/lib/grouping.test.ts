import { describe, expect, it } from "vitest"
import { extractCategories, extractMonths } from "./grouping"

describe("extractMonths", () => {
  it("존재하는 월 목록을 정렬하여 반환한다", () => {
    const items = [{ month: 3 }, { month: 1 }, { month: 3 }, { month: undefined }]
    expect(extractMonths(items)).toEqual([undefined, 1, 3])
  })
})

describe("extractCategories", () => {
  it("총금액 내림차순으로 분류를 반환한다", () => {
    const items = [
      { category: "교통", amount: 100 },
      { category: "식비", amount: 500 },
      { category: "교통", amount: 200 },
      { category: "의류", amount: 400 },
    ]
    expect(extractCategories(items, (i) => i.amount)).toEqual(["식비", "의류", "교통"])
  })

  it("undefined 분류는 맨 앞에 배치한다", () => {
    const items = [
      { category: "식비", amount: 500 },
      { category: undefined, amount: 100 },
      { category: "교통", amount: 200 },
    ]
    expect(extractCategories(items, (i) => i.amount)).toEqual([undefined, "식비", "교통"])
  })

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(extractCategories([], () => 0)).toEqual([])
  })
})
