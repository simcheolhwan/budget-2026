import { useMemo } from "react"
import { atom, useAtomValue } from "jotai"
import { thisMonth, thisYear } from "../../firebase/data"

export const viewLastMonthState = atom(false)

export const useViewYearMonth = () => {
  const viewLastMonth = useAtomValue(viewLastMonthState)

  const { year, month } = useMemo(() => {
    if (viewLastMonth) {
      const year = thisMonth === 1 ? thisYear - 1 : thisYear
      const month = thisMonth === 1 ? 12 : thisMonth - 1
      return { year, month }
    }

    const year = thisYear
    const month = thisMonth
    return { year, month }
  }, [viewLastMonth])

  return { year, month }
}
