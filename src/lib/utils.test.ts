import { describe, expect, it } from "vitest"
import { formatNumber, isProjectExpense, parseOperatorInput, sortByMonth } from "./utils"

describe("formatNumber", () => {
  it("천 단위 구분 기호를 삽입한다", () => {
    expect(formatNumber(1000)).toBe("1,000")
    expect(formatNumber(1234567)).toBe("1,234,567")
  })

  it("음수를 처리한다", () => {
    expect(formatNumber(-500)).toBe("-500")
    expect(formatNumber(-1234)).toBe("-1,234")
  })

  it("0을 처리한다", () => {
    expect(formatNumber(0)).toBe("0")
  })
})

describe("parseOperatorInput", () => {
  it("빈 입력은 null을 반환한다 (취소)", () => {
    expect(parseOperatorInput("", 100)).toBeNull()
    expect(parseOperatorInput("  ", 100)).toBeNull()
  })

  it("+연산자로 현재 값에 가산한다", () => {
    expect(parseOperatorInput("+100", 500)).toBe(600)
    expect(parseOperatorInput("+0", 500)).toBe(500)
  })

  it("-연산자로 현재 값에서 감산한다", () => {
    expect(parseOperatorInput("-100", 500)).toBe(400)
    expect(parseOperatorInput("-600", 500)).toBe(-100)
  })

  it("절대값을 직접 입력한다", () => {
    expect(parseOperatorInput("300", 500)).toBe(300)
    expect(parseOperatorInput("0", 500)).toBe(0)
  })

  it("유효하지 않은 입력은 null을 반환한다", () => {
    expect(parseOperatorInput("abc", 100)).toBeNull()
    expect(parseOperatorInput("+abc", 100)).toBeNull()
  })
})

describe("sortByMonth", () => {
  it("month 오름차순으로 정렬한다", () => {
    const items = [{ month: 3 }, { month: 1 }, { month: 2 }]
    expect(sortByMonth(items)).toEqual([{ month: 1 }, { month: 2 }, { month: 3 }])
  })

  it("month가 없는 항목을 맨 앞에 배치한다", () => {
    const items = [{ month: 2 }, { month: undefined }, { month: 1 }]
    expect(sortByMonth(items)).toEqual([{ month: undefined }, { month: 1 }, { month: 2 }])
  })

  it("원본 배열을 변경하지 않는다", () => {
    const items = [{ month: 3 }, { month: 1 }]
    const sorted = sortByMonth(items)
    expect(sorted).not.toBe(items)
    expect(items[0].month).toBe(3)
  })
})

describe("isProjectExpense", () => {
  it("items 속성이 있으면 프로젝트 지출이다", () => {
    const project = { name: "여행", items: [{ amount: 100 }] }
    expect(isProjectExpense(project)).toBe(true)
  })

  it("items 속성이 없으면 일반 거래다", () => {
    const regular = { amount: 100, name: "식비" }
    expect(isProjectExpense(regular)).toBe(false)
  })
})
