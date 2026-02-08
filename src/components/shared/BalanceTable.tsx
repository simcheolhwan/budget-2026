import { useCallback, useMemo } from "react"
import { SortableWrapper } from "./SortableWrapper"
import { NumberCell } from "./NumberCell"
import { BalanceFormDialog } from "./BalanceFormDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { AddButton } from "./AddButton"
import { SortableRow } from "./SortableRow"
import styles from "./BalanceTable.module.css"
import type { BalanceItem } from "@/schemas"
import { write } from "@/lib/database"
import { sumBalanceItems } from "@/lib/calculations"
import { formatNumber } from "@/lib/utils"
import { useSortableList } from "@/hooks/useSortableList"
import { useCrudDialogs } from "@/hooks/useCrudDialogs"

interface BalanceTableProps {
  title: string
  items: Array<BalanceItem>
  path: string
  discrepancy: number
  sortVisible: boolean
  autoAdjustSign?: 1 | -1
}

// 사이드바 잔액 테이블 (계좌/미수금/예수금)
export function BalanceTable({
  title,
  items,
  path,
  discrepancy,
  sortVisible,
  autoAdjustSign,
}: BalanceTableProps) {
  const {
    editIndex,
    showAdd,
    deleteIndex,
    openAdd,
    closeAdd,
    openEdit,
    closeEdit,
    requestDelete,
    closeDelete,
  } = useCrudDialogs()

  const total = useMemo(() => sumBalanceItems(items), [items])

  // 기존 분류 목록
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      if (item.category) set.add(item.category)
    }
    return [...set]
  }, [items])

  // 잔액 업데이트
  const handleUpdateBalance = useCallback(
    async (index: number, value: number) => {
      const updated = [...items]
      updated[index] = { ...updated[index], balance: value }
      await write(path, updated)
    },
    [items, path],
  )

  // 오차 자동 반영
  const handleAutoAdjust = useCallback(
    async (index: number) => {
      if (autoAdjustSign == null) return
      const updated = [...items]
      updated[index] = {
        ...updated[index],
        balance: updated[index].balance + autoAdjustSign * discrepancy,
      }
      await write(path, updated)
    },
    [items, path, discrepancy, autoAdjustSign],
  )

  // 항목 추가
  const handleAdd = useCallback(
    async (item: BalanceItem) => {
      await write(path, [...items, item])
    },
    [items, path],
  )

  // 항목 수정
  const handleEdit = useCallback(
    async (item: BalanceItem) => {
      if (editIndex === null) return
      const updated = [...items]
      updated[editIndex] = item
      await write(path, updated)
    },
    [items, path, editIndex],
  )

  // 항목 삭제
  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    const filtered = items.filter((_, i) => i !== deleteIndex)
    await write(path, filtered.length > 0 ? filtered : null)
    closeDelete()
  }, [items, path, deleteIndex, closeDelete])

  // DnD
  const handleReorder = useCallback(
    async (reordered: Array<BalanceItem>) => {
      await write(path, reordered)
    },
    [path],
  )
  const { sensors, keys, handleDragEnd } = useSortableList(items, handleReorder)

  const renderRows = () =>
    items.map((item, index) => {
      const cells = (
        <>
          <td>{item.category}</td>
          <td data-truncate>
            {item.name}
            {item.color && (
              <span className={styles.colorChip} style={{ backgroundColor: item.color }} />
            )}
          </td>
          <td>
            <NumberCell
              value={item.balance}
              discrepancy={discrepancy}
              onUpdate={(v) => handleUpdateBalance(index, v)}
              onAutoAdjust={autoAdjustSign != null ? () => handleAutoAdjust(index) : undefined}
              autoAdjustResult={
                autoAdjustSign != null ? item.balance + autoAdjustSign * discrepancy : undefined
              }
            />
          </td>
        </>
      )

      if (sortVisible) {
        return (
          <SortableRow key={index} id={keys[index]}>
            {cells}
          </SortableRow>
        )
      }

      return (
        <tr key={index} onClick={() => openEdit(index)} data-clickable>
          {cells}
        </tr>
      )
    })

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h3>
          {title}
          <span className={styles.sectionTotal}>{formatNumber(total)}</span>
        </h3>
        <AddButton onClick={openAdd} label={`${title} 추가`} />
      </header>

      {items.length === 0 ? (
        <p data-empty>항목 없음</p>
      ) : (
        <SortableWrapper
          active={sortVisible && items.length > 1}
          sensors={sensors}
          keys={keys}
          onDragEnd={handleDragEnd}
        >
          <table>
            <tbody>{renderRows()}</tbody>
          </table>
        </SortableWrapper>
      )}

      <BalanceFormDialog
        open={showAdd}
        onClose={closeAdd}
        mode="create"
        categories={categories}
        onSubmit={handleAdd}
      />

      <BalanceFormDialog
        open={editIndex !== null}
        onClose={closeEdit}
        mode="edit"
        defaultValues={editIndex !== null ? items[editIndex] : undefined}
        categories={categories}
        onSubmit={handleEdit}
        onDelete={() => {
          if (editIndex !== null) requestDelete(editIndex)
        }}
      />

      <ConfirmDialog
        open={deleteIndex !== null}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="항목 삭제"
        description="이 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
      />
    </section>
  )
}
