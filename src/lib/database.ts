// Firebase Realtime Database CRUD 헬퍼.
// 배열 연산은 호출부에서 items를 인자로 받아 서버 조회 없이 동작한다.
// 정렬이 필요한 경우 sortFn을 전달하며, DnD는 reorderItems로 정렬 없이 그대로 저장한다.
import { ref, set } from "firebase/database"
import { db } from "./firebase"
import { sortByMonth } from "./utils"

// Firebase RTDB 저장 전 정규화:
// - 문자열 trim, 빈 문자열 → undefined 변환, undefined 키 제거
// - 배열 내 객체 재귀 처리 (e.g. ProjectExpense.items)
const cleanForFirebase = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]): [string, unknown] => {
        if (typeof v === "string") {
          const trimmed = v.trim()
          return [k, trimmed || undefined]
        }
        if (Array.isArray(v)) {
          return [
            k,
            v.map((item) =>
              item !== null && typeof item === "object" && !Array.isArray(item)
                ? cleanForFirebase(item as Record<string, unknown>)
                : item,
            ),
          ]
        }
        return [k, v]
      })
      .filter(([, v]) => v !== undefined),
  ) as T

// --- 단일 값 연산 ---

export const write = async <T>(path: string, data: T): Promise<void> => {
  await set(ref(db, path), data)
}

// --- 배열 연산 ---

// 요소 추가
export const addItem = async <T extends Record<string, unknown>>(
  path: string,
  items: Array<T>,
  item: T,
  sortFn?: (items: Array<T>) => Array<T>,
): Promise<void> => {
  const next = [...items, cleanForFirebase(item)]
  await write(path, sortFn ? sortFn(next) : next)
}

// 요소 수정
export const updateItem = async <T extends Record<string, unknown>>(
  path: string,
  items: Array<T>,
  index: number,
  item: T,
  sortFn?: (items: Array<T>) => Array<T>,
): Promise<void> => {
  const next = items.map((v, i) => (i === index ? cleanForFirebase(item) : v))
  await write(path, sortFn ? sortFn(next) : next)
}

// 요소 삭제. 배열이 비면 null을 저장 (Firebase 빈 배열 문제 방지)
export const removeItem = async <T>(
  path: string,
  items: Array<T>,
  index: number,
): Promise<void> => {
  const filtered = items.filter((_, i) => i !== index)
  await write(path, filtered.length > 0 ? filtered : null)
}

// 요소 추가 (month 기준 자동 정렬)
export const addSortedItem = async <T extends Record<string, unknown> & { month?: number }>(
  path: string,
  items: Array<T>,
  item: T,
): Promise<void> => addItem(path, items, item, sortByMonth)

// 요소 수정 (month 기준 자동 정렬)
export const updateSortedItem = async <T extends Record<string, unknown> & { month?: number }>(
  path: string,
  items: Array<T>,
  index: number,
  item: T,
): Promise<void> => updateItem(path, items, index, item, sortByMonth)

// 순서 변경 (DnD용, 정렬 없이 그대로 저장)
export const reorderItems = async <T>(path: string, items: Array<T>): Promise<void> => {
  await write(path, items)
}
