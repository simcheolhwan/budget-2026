import { useCallback, useMemo, useState } from "react"
import { IconQuestionMark } from "@tabler/icons-react"
import { SortableWrapper } from "./SortableWrapper"
import { ItemFormDialog } from "./ItemFormDialog"
import { ExpenseFormDialog } from "./ExpenseFormDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { NumberCell } from "./NumberCell"
import { ProjectBadge } from "./ProjectBadge"
import { ProjectDetailDialog } from "./ProjectDetailDialog"
import { AddButton } from "./AddButton"
import { SortableRow } from "./SortableRow"
import styles from "./ItemsTable.module.css"
import type { ReactNode } from "react"
import type { BaseItem, ExpenseItem, ProjectExpense, ProjectItem, TransactionItem } from "@/schemas"
import type { ViewMode } from "@/stores/ui"
import { useUIStore } from "@/stores/ui"
import { addSortedItem, removeItem, reorderItems, updateSortedItem } from "@/lib/database"
import { sumAmounts, sumExpenseItems } from "@/lib/calculations"
import { formatNumber, isProjectExpense } from "@/lib/utils"
import { useSortableList } from "@/hooks/useSortableList"
import { useCrudDialogs } from "@/hooks/useCrudDialogs"

interface ItemsTableProps {
  items: Array<TransactionItem> | Array<ExpenseItem>
  path: string
  type: "income" | "expense"
  categories: Array<string>
  activeTab: number | string | undefined | null
  discrepancy: number
  onAutoAdjust?: (originalIndex: number) => Promise<void>
  tabs?: ReactNode
}

// 필터링된 항목 반환 (원본 인덱스 포함)
interface IndexedItem<T> {
  item: T
  originalIndex: number
}

function filterItems<T extends BaseItem>(
  items: Array<T>,
  viewMode: ViewMode,
  activeTab: number | string | undefined | null,
): Array<IndexedItem<T>> {
  const indexed = items.map((item, originalIndex) => ({ item, originalIndex }))
  // "모두" 선택 시 필터 없음
  if (activeTab === null) return indexed
  if (viewMode === "monthly") {
    return indexed.filter(({ item }) => item.month === activeTab)
  }
  if (viewMode === "category") {
    return indexed.filter(({ item }) => item.category === activeTab)
  }
  return indexed
}

// 금액 계산 (수입/지출 구분)
function calcTotal(
  items: ReadonlyArray<TransactionItem | ExpenseItem>,
  type: "income" | "expense",
) {
  if (type === "income") return sumAmounts(items as Array<TransactionItem>)
  return sumExpenseItems(items as Array<ExpenseItem>)
}

// 수입/지출 항목 테이블
export function ItemsTable({
  items,
  path,
  type,
  categories,
  activeTab,
  discrepancy,
  onAutoAdjust,
  tabs,
}: ItemsTableProps) {
  const viewMode = useUIStore((s) => s.viewMode)
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
  const [projectDetail, setProjectDetail] = useState<{
    index: number
    project: ProjectExpense
  } | null>(null)

  const filtered = useMemo(
    () => filterItems(items as Array<TransactionItem | ExpenseItem>, viewMode, activeTab),
    [items, viewMode, activeTab],
  )

  const filteredItems = useMemo(() => filtered.map(({ item }) => item), [filtered])
  const total = useMemo(() => calcTotal(filteredItems, type), [filteredItems, type])

  // 행 클릭 핸들러
  const handleRowClick = useCallback(
    (index: number) => {
      openEdit(filtered[index].originalIndex)
    },
    [filtered, openEdit],
  )

  // 프로젝트 클릭 (amount 영역)
  const handleProjectClick = useCallback(
    (index: number) => {
      const { item, originalIndex } = filtered[index]
      if (isProjectExpense(item)) {
        setProjectDetail({ index: originalIndex, project: item })
      }
    },
    [filtered],
  )

  // 항목 추가
  const handleAdd = useCallback(
    async (item: TransactionItem | ExpenseItem) => {
      await addSortedItem(path, items, item)
    },
    [path, items],
  )

  // 항목 수정
  const handleEdit = useCallback(
    async (item: TransactionItem | ExpenseItem) => {
      if (editIndex === null) return
      await updateSortedItem(path, items, editIndex, item)
    },
    [path, items, editIndex],
  )

  // 항목 삭제
  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    await removeItem(path, items, deleteIndex)
    closeDelete()
  }, [path, items, deleteIndex, closeDelete])

  // 금액 인라인 편집 (일반 항목만)
  const handleUpdateAmount = useCallback(
    async (filteredIndex: number, newValue: number) => {
      const { item, originalIndex } = filtered[filteredIndex]
      const updated = { ...item, amount: newValue }
      await updateSortedItem(path, items, originalIndex, updated as TransactionItem | ExpenseItem)
    },
    [filtered, path, items],
  )

  // 자동 조정 (filtered → original 인덱스 변환)
  const handleAutoAdjust = useCallback(
    async (filteredIndex: number) => {
      const { originalIndex } = filtered[filteredIndex]
      await onAutoAdjust?.(originalIndex)
    },
    [filtered, onAutoAdjust],
  )

  // DnD
  const handleReorder = useCallback(
    async (reordered: Array<TransactionItem | ExpenseItem>) => {
      await reorderItems(path, reordered)
    },
    [path],
  )
  const { sensors, keys, handleDragEnd } = useSortableList(
    items as Array<TransactionItem | ExpenseItem>,
    handleReorder,
  )

  // 프로젝트 하위 항목 업데이트
  const handleProjectUpdate = useCallback(
    async (subItems: Array<ProjectItem>) => {
      if (!projectDetail) return
      const updated = { ...(items[projectDetail.index] as ProjectExpense), items: subItems }
      await updateSortedItem(path, items, projectDetail.index, updated)
      setProjectDetail({ ...projectDetail, project: updated })
    },
    [items, path, projectDetail],
  )

  const label = type === "income" ? "수입" : "지출"
  const showSort = sortVisible && viewMode === "raw"

  // 빈 상태
  if (items.length === 0 && !showAdd) {
    return (
      <section className={styles.section} data-items data-type={type}>
        <header className={styles.header}>
          <h3 className={styles.title}>{label}</h3>
          {tabs && <div className={styles.tabs}>{tabs}</div>}
          <AddButton onClick={openAdd} label={`${label} 추가`} />
        </header>
        <p data-empty>항목 없음</p>
        {renderFormDialog()}
      </section>
    )
  }

  // 테이블 렌더링
  return (
    <section className={styles.section} data-items data-type={type}>
      <header className={styles.header}>
        <h3 className={styles.title}>{label}</h3>
        {tabs && <div className={styles.tabs}>{tabs}</div>}
        <AddButton onClick={openAdd} label={`${label} 추가`} />
      </header>

      {filtered.length === 0 ? (
        <p data-empty>항목 없음</p>
      ) : (
        <SortableWrapper active={showSort} sensors={sensors} keys={keys} onDragEnd={handleDragEnd}>
          <table>
            <thead>
              <tr>
                <th className={styles.monthCol}>월</th>
                <th className={styles.catCol}>분류</th>
                <th>항목</th>
                <th>메모</th>
                <th>{formatNumber(total)}</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </SortableWrapper>
      )}

      {renderFormDialog()}

      {/* 수정 다이얼로그 */}
      {type === "income" ? (
        <ItemFormDialog
          open={editIndex !== null}
          onClose={closeEdit}
          mode="edit"
          defaultValues={editIndex !== null ? (items[editIndex] as TransactionItem) : undefined}
          categories={categories}
          onSubmit={handleEdit as (item: TransactionItem) => Promise<void>}
          onDelete={() => {
            if (editIndex !== null) requestDelete(editIndex)
          }}
        />
      ) : (
        <ExpenseFormDialog
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
      )}

      <ConfirmDialog
        open={deleteIndex !== null}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="항목 삭제"
        description="이 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
      />

      {/* 프로젝트 상세 다이얼로그 */}
      {projectDetail && (
        <ProjectDetailDialog
          open
          onClose={() => setProjectDetail(null)}
          project={projectDetail.project}
          onUpdate={handleProjectUpdate}
        />
      )}
    </section>
  )

  function renderTableRows() {
    return filtered.map(({ item }, index) => {
      const isProject = type === "expense" && isProjectExpense(item)
      const amount = isProject ? sumExpenseItems([item]) : (item as TransactionItem).amount

      const amountCell = isProject ? (
        <td
          onClick={(e) => {
            e.stopPropagation()
            handleProjectClick(index)
          }}
        >
          {formatNumber(amount)}
        </td>
      ) : (
        <td>
          <NumberCell
            value={amount}
            discrepancy={discrepancy}
            onUpdate={(v) => handleUpdateAmount(index, v)}
            onAutoAdjust={onAutoAdjust ? () => handleAutoAdjust(index) : undefined}
            autoAdjustResult={amount + (type === "income" ? discrepancy : -discrepancy)}
          />
        </td>
      )

      if (showSort) {
        return (
          <SortableRow key={index} id={keys[index]}>
            <td data-placeholder={!item.month || undefined}>
              {item.month ? `${item.month}월` : <IconQuestionMark size={14} />}
            </td>
            <td data-placeholder={!item.category || undefined}>
              {item.category || <IconQuestionMark size={14} />}
            </td>
            <td>
              {item.name}
              {isProject && <ProjectBadge />}
            </td>
            <td data-memo>{item.memo}</td>
            {amountCell}
          </SortableRow>
        )
      }

      return (
        <tr key={index} onClick={() => handleRowClick(index)} data-clickable>
          <td data-placeholder={!item.month || undefined}>
            {item.month ? `${item.month}월` : <IconQuestionMark size={14} />}
          </td>
          <td data-placeholder={!item.category || undefined}>
            {item.category || <IconQuestionMark size={14} />}
          </td>
          <td>
            {item.name}
            {isProject && <ProjectBadge />}
          </td>
          <td data-memo>{item.memo}</td>
          {amountCell}
        </tr>
      )
    })
  }

  // 추가 다이얼로그 렌더링
  function renderFormDialog() {
    if (type === "income") {
      return (
        <ItemFormDialog
          open={showAdd}
          onClose={closeAdd}
          mode="create"
          categories={categories}
          onSubmit={handleAdd as (item: TransactionItem) => Promise<void>}
        />
      )
    }
    return (
      <ExpenseFormDialog
        open={showAdd}
        onClose={closeAdd}
        mode="create"
        categories={categories}
        onSubmit={handleAdd}
      />
    )
  }
}
