import { useSyncExternalStore } from "react"

let altKey = false
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((l) => l())

document.addEventListener("keydown", (e) => {
  altKey = e.altKey
  notify()
})
document.addEventListener("keyup", (e) => {
  altKey = e.altKey
  notify()
})
window.addEventListener("blur", () => {
  altKey = false
  notify()
})

// Alt 키 눌림 상태 (이벤트 리스너 공유)
export function useAltKey() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => altKey,
  )
}
