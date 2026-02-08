import { createContext, useContext } from "react"
import type { Balances, YearData } from "@/schemas"
import type { FirebaseState } from "@/hooks/useFirebaseSync"
import { useFirebaseSync } from "@/hooks/useFirebaseSync"

interface FirebaseDataContextValue {
  personal: FirebaseState<Record<string, YearData>>
  family: FirebaseState<Record<string, YearData>>
  balances: FirebaseState<Balances>
}

const FirebaseDataContext = createContext<FirebaseDataContextValue | null>(null)

export function FirebaseDataProvider({ children }: { children: React.ReactNode }) {
  const personal = useFirebaseSync<Record<string, YearData>>("personal")
  const family = useFirebaseSync<Record<string, YearData>>("family")
  const balances = useFirebaseSync<Balances>("balances")

  return (
    <FirebaseDataContext value={{ personal, family, balances }}>{children}</FirebaseDataContext>
  )
}

export function useFirebaseData() {
  const ctx = useContext(FirebaseDataContext)
  if (!ctx) throw new Error("useFirebaseData must be used within FirebaseDataProvider")
  return ctx
}
