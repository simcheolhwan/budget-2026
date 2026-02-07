import { describe, expect, it } from "vitest"
import { buildSearchIndex, searchItems } from "./search"
import type { SearchResult } from "./search"

describe("buildSearchIndex", () => {
  it("개인/가족 데이터를 평탄화한다", () => {
    const personal = {
      "2026": {
        incomes: { items: [{ amount: 100, name: "급여" }] },
        expenses: { items: [{ amount: 50, name: "식비" }] },
      },
    }
    const family = {
      "2026": {
        incomes: { items: [{ amount: 200, name: "보조금" }] },
        expenses: { items: [] },
      },
    }

    const index = buildSearchIndex(personal, family)
    expect(index).toHaveLength(3)
    expect(index.map((r) => r.name)).toContain("급여")
    expect(index.map((r) => r.name)).toContain("보조금")
  })

  it("프로젝트 하위 항목을 포함한다", () => {
    const personal = {
      "2026": {
        expenses: {
          items: [
            {
              name: "여행",
              items: [
                { amount: 500, name: "항공권" },
                { amount: 300, name: "호텔" },
              ],
            },
          ],
        },
      },
    }

    const index = buildSearchIndex(personal, null)
    expect(index).toHaveLength(2)
    expect(index[0].projectName).toBe("여행")
    expect(index[0].name).toBe("항공권")
  })

  it("null 데이터를 처리한다", () => {
    const index = buildSearchIndex(null, null)
    expect(index).toHaveLength(0)
  })
})

describe("searchItems", () => {
  const index: Array<SearchResult> = [
    { source: "personal", year: 2026, name: "급여", amount: 5000 },
    { source: "personal", year: 2026, name: "식비", memo: "점심", amount: 100 },
    { source: "family", year: 2026, name: "월세", amount: 3000 },
  ]

  it("이름으로 검색한다", () => {
    const results = searchItems("급여", index)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe("급여")
  })

  it("메모로 검색한다", () => {
    const results = searchItems("점심", index)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe("식비")
  })

  it("대소문자를 무시한다", () => {
    const indexEn: Array<SearchResult> = [
      { source: "personal", year: 2026, name: "Netflix", amount: 100 },
    ]
    expect(searchItems("netflix", indexEn)).toHaveLength(1)
  })

  it("빈 검색어는 빈 결과를 반환한다", () => {
    expect(searchItems("", index)).toHaveLength(0)
    expect(searchItems("  ", index)).toHaveLength(0)
  })

  it("매칭되지 않으면 빈 결과를 반환한다", () => {
    expect(searchItems("존재하지않는", index)).toHaveLength(0)
  })
})
