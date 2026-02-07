import { describe, expect, it } from "vitest"
import { extractCategories, extractMonths } from "./grouping"

describe("extractMonths", () => {
  it("존재하는 월 목록을 정렬하여 반환한다", () => {
    const items = [{ month: 3 }, { month: 1 }, { month: 3 }, { month: undefined }]
    expect(extractMonths(items)).toEqual([undefined, 1, 3])
  })
})

describe("extractCategories", () => {
  it("존재하는 분류 목록을 반환한다", () => {
    const items = [
      { category: "식비" },
      { category: "교통" },
      { category: "식비" },
      { category: undefined },
    ]
    const result = extractCategories(items)
    expect(result).toHaveLength(3)
    expect(result).toContain("식비")
    expect(result).toContain("교통")
    expect(result).toContain(undefined)
  })
})
