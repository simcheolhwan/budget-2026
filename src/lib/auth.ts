// Google 인증 + UID 검증 모듈.
// 모듈 레벨 상태 + useSyncExternalStore로 인증 상태를 React에 동기화.
// authReady 프로미스로 최초 인증 확인 완료를 대기 (_authenticated 라우트에서 사용).
import { signOut as fbSignOut, onAuthStateChanged, signInWithPopup } from "firebase/auth"
import { useSyncExternalStore } from "react"
import { auth, googleProvider } from "./firebase"
import type { User } from "firebase/auth"

// --- 인증 상태 타입 ---

export type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "unauthorized"

export interface AuthState {
  status: AuthStatus
  user: User | null
}

// --- 모듈 레벨 상태 ---
// Zustand가 아닌 모듈 스코프에 상태를 둔다.
// subscribers Set + notify 패턴으로 useSyncExternalStore에 연결.

let currentState: AuthState = { status: "loading", user: null }
const subscribers = new Set<() => void>()

const notify = () => {
  for (const callback of subscribers) callback()
}

// --- authReady: 최초 인증 상태 확인 완료 프로미스 ---

let resolveAuthReady: () => void
export const authReady = new Promise<void>((resolve) => {
  resolveAuthReady = resolve
})

// --- 인증 상태 감시 (앱 시작 시 1회 등록) ---
// VITE_ALLOWED_UID 환경변수가 설정된 경우, 해당 UID만 허용하여 단일 사용자 앱을 보장한다.

const allowedUid = import.meta.env.VITE_ALLOWED_UID

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentState = { status: "unauthenticated", user: null }
    notify()
    resolveAuthReady()
    return
  }

  // UID 검증 (환경변수 미설정 시 제한 없음)
  if (allowedUid && user.uid !== allowedUid) {
    await fbSignOut(auth)
    currentState = { status: "unauthorized", user: null }
    notify()
    resolveAuthReady()
    return
  }

  currentState = { status: "authenticated", user }
  notify()
  resolveAuthReady()
})

// --- 공개 API ---

export const signIn = () => signInWithPopup(auth, googleProvider)

export const signOut = () => fbSignOut(auth)

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (callback) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
    () => currentState,
  )
}
