// 추가/수정/삭제 다이얼로그 상태 패턴 추출.
// ItemsTable, RecurringTable, BalanceTable, ProjectDetailDialog가 공통으로 사용.
// closeDelete는 삭제 확인 후 편집 다이얼로그도 함께 닫는다.
import { useCallback, useState } from "react"

export function useCrudDialogs() {
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const openAdd = useCallback(() => setShowAdd(true), [])
  const closeAdd = useCallback(() => setShowAdd(false), [])
  const openEdit = useCallback((index: number) => setEditIndex(index), [])

  const closeEdit = useCallback(() => setEditIndex(null), [])

  const requestDelete = useCallback((index: number) => setDeleteIndex(index), [])

  const closeDelete = useCallback(() => {
    setDeleteIndex(null)
    setEditIndex(null)
  }, [])

  return {
    editIndex,
    showAdd,
    deleteIndex,
    openAdd,
    closeAdd,
    openEdit,
    closeEdit,
    requestDelete,
    closeDelete,
  }
}
