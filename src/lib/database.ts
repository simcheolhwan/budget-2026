// Firebase Realtime Database CRUD 헬퍼.
// 배열 연산(addItem/updateItem)은 저장 전 sortByMonth를 호출하여 month 기준 자동 정렬을 보장한다.
// 사용자가 수동 정렬(DnD)할 때는 reorderItems로 정렬 없이 그대로 저장한다.
import { get, ref, set } from "firebase/database"
import { db } from "./firebase"
import { sortByMonth } from "./utils"

// undefined 값을 가진 필드 제거 (Firebase는 undefined를 허용하지 않음)
const stripUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T

// --- 단일 값 연산 ---

export const read = async <T>(path: string): Promise<T | null> => {
  const snapshot = await get(ref(db, path))
  return snapshot.exists() ? (snapshot.val() as T) : null
}

export const write = async <T>(path: string, data: T): Promise<void> => {
  await set(ref(db, path), data)
}

// --- 배열 연산 ---

// 요소 추가 (month 기준 자동 정렬)
export const addItem = async <T extends Record<string, unknown> & { month?: number }>(
  path: string,
  item: T,
): Promise<void> => {
  const current = (await read<Array<T>>(path)) ?? []
  await write(path, sortByMonth([...current, stripUndefined(item)]))
}

// 요소 수정 (month 기준 자동 정렬)
export const updateItem = async <T extends Record<string, unknown> & { month?: number }>(
  path: string,
  index: number,
  item: T,
): Promise<void> => {
  const current = (await read<Array<T>>(path)) ?? []
  const updated = current.map((v, i) => (i === index ? stripUndefined(item) : v))
  await write(path, sortByMonth(updated))
}

// 요소 삭제. 배열이 비면 null을 저장 (Firebase 빈 배열 문제 방지)
export const removeItem = async (path: string, index: number): Promise<void> => {
  const current = (await read<Array<unknown>>(path)) ?? []
  const filtered = current.filter((_, i) => i !== index)
  await write(path, filtered.length > 0 ? filtered : null)
}

// 순서 변경 (DnD용, 정렬 없이 그대로 저장)
export const reorderItems = async <T>(path: string, items: Array<T>): Promise<void> => {
  await write(path, items)
}
