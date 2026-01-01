import { useDatabase } from "../firebase/data"
import { useSortList } from "./sort"

/* balance */
export const useBalance = () => {
  const { balance } = useDatabase()
  return balance
}

export const useBank = () => {
  const { bank } = useBalance()
  return bank
}

export const useReceivable = () => {
  const { receivable } = useBalance()
  return receivable
}

export const useCustody = () => {
  const { custody } = useBalance()
  return custody
}

/* annual */
export const useAnnual = () => {
  const { annual } = useDatabase()
  return annual
}

export const useYear = (year: number) => {
  const annual = useAnnual()
  return annual[String(year)] || { income: [], expense: [] }
}

export const useList = (listKey: ListKey, { year, month }: { year: number; month?: number }) => {
  const sortList = useSortList()
  const data = useYear(year)
  if (!data) return []

  const { [listKey]: list } = data
  if (month) return sortList(list.filter((item) => item.month === month))
  return sortList(list)
}

/* ui */
export const useUI = () => {
  const { ui } = useDatabase()
  return ui
}
