// 이 앱의 데이터 동기화 핵심 훅.
// Firebase onValue 리스너를 useSyncExternalStore에 연결하여 실시간 업데이트를 React 상태로 전환.
// path가 변경되면 리스너가 재등록되고, path가 null이면 빈 상태를 반환한다 (조건부 로딩).
import { useCallback, useRef, useSyncExternalStore } from "react"
import { onValue, ref } from "firebase/database"
import { db } from "@/lib/firebase"

export interface FirebaseState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

// path가 null이면 빈 상태 반환 (조건부 로딩)
const EMPTY_STATE: FirebaseState<never> = { data: null, loading: false, error: null }
const emptySubscribe = () => () => {}
const emptyGetSnapshot = () => EMPTY_STATE

export function useFirebaseSync<T>(path: string | null): FirebaseState<T> {
  const stateRef = useRef<FirebaseState<T>>({ data: null, loading: true, error: null })

  const subscribe = useCallback(
    (callback: () => void) => {
      stateRef.current = { data: null, loading: true, error: null }
      const dbRef = ref(db, path!)
      return onValue(
        dbRef,
        (snapshot) => {
          stateRef.current = {
            data: snapshot.exists() ? snapshot.val() : null,
            loading: false,
            error: null,
          }
          callback()
        },
        (error) => {
          stateRef.current = { data: stateRef.current.data, error, loading: false }
          callback()
        },
      )
    },
    [path],
  )

  const getSnapshot = useCallback(() => stateRef.current, [])

  return useSyncExternalStore(
    path ? subscribe : emptySubscribe,
    path ? getSnapshot : emptyGetSnapshot,
  )
}
