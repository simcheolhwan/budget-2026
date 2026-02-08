import { useCallback, useMemo } from "react"
import { IconQuestionMark } from "@tabler/icons-react"
import { SortableWrapper } from "./SortableWrapper"
import { NumberCell } from "./NumberCell"
import { RecurringFormDialog } from "./RecurringFormDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { AddButton } from "./AddButton"
import { SortableRow } from "./SortableRow"
import styles from "./RecurringTable.module.css"
import type { Recurring } from "@/schemas"
import { useUIStore } from "@/stores/ui"
import { addItem, removeItem, reorderItems, updateItem } from "@/lib/database"
import { sumRecurring, sumRecurringByMonth } from "@/lib/calculations"
import { formatNumber } from "@/lib/utils"
import { useSortableList } from "@/hooks/useSortableList"
import { useCrudDialogs } from "@/hooks/useCrudDialogs"

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface RecurringTableProps {
  items: Array<Recurring>
  path: string
  type: "income" | "expense"
  discrepancy: number
  categories: Array<string>
  onAutoAdjust?: (index: number, month: number) => Promise<void>
}

// 반복 항목의 행 합계
const rowTotal = (r: Recurring) => Object.values(r.monthly ?? {}).reduce((sum, v) => sum + v, 0)

// rowSpan 계산: 동일 category 연속 행 그룹
function computeRowSpans(items: Array<Recurring>): Map<number, number> {
  const spans = new Map<number, number>()
  let i = 0
  while (i < items.length) {
    const cat = items[i].category
    let j = i + 1
    while (j < items.length && items[j].category === cat) j++
    spans.set(i, j - i)
    i = j
  }
  return spans
}

// category 기준 정렬
function sortByCategory(items: Array<Recurring>): Array<Recurring> {
  return [...items].sort((a, b) => (a.category ?? "").localeCompare(b.category ?? ""))
}

// 반복 수입/지출 테이블
export function RecurringTable({
  items,
  path,
  type,
  discrepancy,
  categories,
  onAutoAdjust,
}: RecurringTableProps) {
  const sortVisible = useUIStore((s) => s.sortVisible)
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

  // 정렬된 인덱스 → 원본 인덱스 매핑
  const sortedIndexMap = useMemo(() => {
    const indices = items.map((_, i) => i)
    return indices.sort((a, b) => (items[a].category ?? "").localeCompare(items[b].category ?? ""))
  }, [items])
  const sorted = useMemo(() => sortedIndexMap.map((i) => items[i]), [items, sortedIndexMap])
  const rowSpans = useMemo(() => computeRowSpans(sorted), [sorted])
  const total = useMemo(() => sumRecurring(items), [items])

  // 월별 셀 값 업데이트
  const handleUpdateMonthly = useCallback(
    async (index: number, month: number, value: number) => {
      const { [String(month)]: _, ...rest } = items[index].monthly ?? {}
      const updatedItem = {
        ...items[index],
        monthly: value === 0 ? rest : { ...items[index].monthly, [String(month)]: value },
      }
      await updateItem(path, items, index, updatedItem)
    },
    [items, path],
  )

  // 항목 추가
  const handleAdd = useCallback(
    async (item: Recurring) => {
      await addItem(path, items, item, sortByCategory)
    },
    [items, path],
  )

  // 항목 수정
  const handleEdit = useCallback(
    async (item: Recurring) => {
      if (editIndex === null) return
      const mergedItem = { ...items[editIndex], ...item, monthly: items[editIndex].monthly ?? {} }
      await updateItem(path, items, editIndex, mergedItem, sortByCategory)
    },
    [items, path, editIndex],
  )

  // 항목 삭제
  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    await removeItem(path, items, deleteIndex)
    closeDelete()
  }, [items, path, deleteIndex, closeDelete])

  // DnD
  const handleReorder = useCallback(
    async (reordered: Array<Recurring>) => {
      await reorderItems(path, reordered)
    },
    [path],
  )
  const { sensors, keys, handleDragEnd } = useSortableList(items, handleReorder)

  const label = type === "income" ? "반복 수입" : "반복 지출"

  if (items.length === 0 && !showAdd) {
    return (
      <section className={styles.section} data-recurring data-type={type}>
        <header className={styles.header}>
          <h3>{label}</h3>
          <AddButton onClick={openAdd} label={`${label} 추가`} />
        </header>
        <p data-empty>항목 없음</p>
        <RecurringFormDialog
          open={showAdd}
          onClose={closeAdd}
          mode="create"
          categories={categories}
          onSubmit={handleAdd}
        />
      </section>
    )
  }

  const showTotalRow = items.length > 1

  const renderTotalRow = () => (
    <tr className={styles.totalRow}>
      <td colSpan={2}>합계</td>
      {MONTHS.map((m) => (
        <td key={m} className={styles.numCol}>
          {formatNumber(sumRecurringByMonth(items, m))}
        </td>
      ))}
      <td className={styles.numCol}>{formatNumber(total)}</td>
    </tr>
  )

  const renderRows = () => {
    const displayItems = sortVisible ? items : sorted
    const displayRowSpans = sortVisible ? new Map<number, number>() : rowSpans

    return displayItems.map((item, index) => {
      const originalIndex = sortVisible ? index : sortedIndexMap[index]
      const span = displayRowSpans.get(index)

      const cells = (
        <>
          {!sortVisible && span !== undefined && (
            <td
              rowSpan={span}
              className={styles.catCol}
              data-placeholder={!item.category || undefined}
            >
              {item.category || <IconQuestionMark size={14} />}
            </td>
          )}
          {sortVisible && (
            <td className={styles.catCol} data-placeholder={!item.category || undefined}>
              {item.category || <IconQuestionMark size={14} />}
            </td>
          )}
          <td className={styles.nameCol}>{item.name}</td>
          {MONTHS.map((m) => {
            const monthly = item.monthly?.[String(m)] ?? null
            return (
              <td key={m} className={styles.numCol}>
                <NumberCell
                  value={monthly}
                  discrepancy={discrepancy}
                  onUpdate={(v) => handleUpdateMonthly(originalIndex, m, v)}
                  onAutoAdjust={onAutoAdjust ? () => onAutoAdjust(originalIndex, m) : undefined}
                  autoAdjustResult={
                    (monthly ?? 0) + (type === "income" ? discrepancy : -discrepancy)
                  }
                />
              </td>
            )
          })}
          <td className={styles.numCol}>{formatNumber(rowTotal(item))}</td>
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
        <tr key={originalIndex} onClick={() => openEdit(originalIndex)} data-clickable>
          {cells}
        </tr>
      )
    })
  }

  return (
    <section className={styles.section} data-recurring data-type={type}>
      <header className={styles.header}>
        <h3>{label}</h3>
        <AddButton onClick={openAdd} label={`${label} 추가`} />
      </header>

      <SortableWrapper active={sortVisible} sensors={sensors} keys={keys} onDragEnd={handleDragEnd}>
        <table>
          <thead>
            <tr>
              <th className={styles.catCol}>분류</th>
              <th className={styles.nameCol}>항목</th>
              {MONTHS.map((m) => (
                <th key={m} className={styles.numCol}>
                  {m}월
                </th>
              ))}
              <th className={styles.numCol}>{formatNumber(total)}</th>
            </tr>
          </thead>
          <tbody>
            {showTotalRow && renderTotalRow()}
            {renderRows()}
          </tbody>
        </table>
      </SortableWrapper>

      <RecurringFormDialog
        open={showAdd}
        onClose={closeAdd}
        mode="create"
        categories={categories}
        onSubmit={handleAdd}
      />

      <RecurringFormDialog
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
        title="반복 항목 삭제"
        description="이 반복 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
      />
    </section>
  )
}
