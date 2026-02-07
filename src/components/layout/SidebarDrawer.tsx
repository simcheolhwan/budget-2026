import { Dialog } from "@base-ui/react/dialog"
import { Sidebar } from "./Sidebar"
import styles from "./SidebarDrawer.module.css"

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
}

// 모바일 사이드바 드로어
export function SidebarDrawer({ open, onClose }: SidebarDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup} aria-label="사이드바">
          <Sidebar />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
