import { AlertDialog } from "@base-ui/react/alert-dialog"
import styles from "./ConfirmDialog.module.css"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

// 삭제/로그아웃 등 확인 다이얼로그
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={styles.backdrop} />
        <AlertDialog.Popup className={styles.popup}>
          <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
          {description && (
            <AlertDialog.Description className={styles.description}>
              {description}
            </AlertDialog.Description>
          )}
          <footer className={styles.footer}>
            <AlertDialog.Close
              render={
                <button className={styles.cancelButton} type="button">
                  {cancelLabel}
                </button>
              }
            />
            <button
              className={styles.confirmButton}
              type="button"
              onClick={() => {
                onConfirm()
              }}
            >
              {confirmLabel}
            </button>
          </footer>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
