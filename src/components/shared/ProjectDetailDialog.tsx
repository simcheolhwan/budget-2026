import { useCallback } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { IconPlus } from "@tabler/icons-react"
import styles from "./ProjectDetailDialog.module.css"
import { ProjectItemFormDialog } from "./ProjectItemFormDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import type { ProjectExpense, ProjectItem } from "@/schemas"
import { formatNumber, getProjectItems } from "@/lib/utils"
import { sumAmounts } from "@/lib/calculations"
import { useCrudDialogs } from "@/hooks/useCrudDialogs"

interface ProjectDetailDialogProps {
  open: boolean
  onClose: () => void
  project: ProjectExpense
  onUpdate: (items: Array<ProjectItem>) => Promise<void>
}

// 프로젝트 하위 항목 테이블 (추가/수정/삭제)
export function ProjectDetailDialog({
  open,
  onClose,
  project,
  onUpdate,
}: ProjectDetailDialogProps) {
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

  const items = getProjectItems(project)
  const total = sumAmounts(items)

  const handleAdd = useCallback(
    async (item: ProjectItem) => {
      await onUpdate([...items, item])
    },
    [items, onUpdate],
  )

  const handleEdit = useCallback(
    async (item: ProjectItem) => {
      if (editIndex === null) return
      const updated = items.map((v, i) => (i === editIndex ? item : v))
      await onUpdate(updated)
    },
    [items, editIndex, onUpdate],
  )

  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    const filtered = items.filter((_, i) => i !== deleteIndex)
    await onUpdate(filtered)
    closeDelete()
  }, [items, deleteIndex, onUpdate, closeDelete])

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Dialog.Title className={styles.title}>{project.name}</Dialog.Title>

          {items.length === 0 ? (
            <p data-empty>항목 없음</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>항목</th>
                  <th>{formatNumber(total)}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} onClick={() => openEdit(index)} data-clickable>
                    <td>{item.name}</td>
                    <td>{formatNumber(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <footer className={styles.footer}>
            <button type="button" className={styles.addButton} onClick={openAdd}>
              <IconPlus size={16} aria-hidden />
              항목 추가
            </button>
            <Dialog.Close
              render={
                <button type="button" className={styles.closeButton}>
                  닫기
                </button>
              }
            />
          </footer>

          <ProjectItemFormDialog
            open={showAdd}
            onClose={closeAdd}
            mode="create"
            onSubmit={handleAdd}
          />

          <ProjectItemFormDialog
            open={editIndex !== null}
            onClose={closeEdit}
            mode="edit"
            defaultValues={editIndex !== null ? items[editIndex] : undefined}
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
