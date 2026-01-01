import { PropsWithChildren, useEffect } from "react"
import { useAtom } from "jotai"
import { onValue, ref } from "firebase/database"
import { db } from "./config"
import { databaseState } from "./data"

const Database = ({ children }: PropsWithChildren) => {
  const [database, setDatabase] = useAtom(databaseState)

  useEffect(() => {
    onValue(ref(db), (snapshot) => setDatabase(snapshot.val()))
  }, [setDatabase])

  if (!database) return null
  return <>{children}</>
}

export default Database
