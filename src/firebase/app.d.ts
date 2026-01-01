interface Dictionary<A = string> {
  [index: string]: A
}

interface Database {
  balance: Balance
  annual: { [year: string]: List }
  ui: { groups: string[][] }
}

interface Balance {
  bank?: Account[]
  custody?: Account[]
  receivable?: Account[]
}

type BalanceKey = keyof Balance

interface Account {
  amount: number
  name: string
  category?: string
}

interface List {
  income: Item[]
  expense: Item[]
}

type ListKey = keyof List

interface Item {
  amount: number
  month?: number
  category?: string
  name?: string
  memo?: string
}
