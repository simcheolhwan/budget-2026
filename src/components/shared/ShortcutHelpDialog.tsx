import { Dialog } from "@base-ui/react/dialog"
import styles from "./ShortcutHelpDialog.module.css"

interface ShortcutHelpDialogProps {
  open: boolean
  onClose: () => void
}

interface Shortcut {
  keys: Array<string>
  description: string
}

interface ShortcutGroup {
  label: string
  items: Array<Shortcut>
}

const SHORTCUT_GROUPS: Array<ShortcutGroup> = [
  {
    label: "탐색",
    items: [
      { keys: ["Alt", "1"], description: "나" },
      { keys: ["Alt", "2"], description: "가족" },
      { keys: ["Alt", "3"], description: "예산" },
      { keys: ["Alt", "P"], description: "프로젝트" },
      { keys: ["Alt", "←"], description: "이전 연도" },
      { keys: ["Alt", "→"], description: "다음 연도" },
    ],
  },
  {
    label: "동작",
    items: [
      { keys: ["⌘", "K"], description: "검색" },
      { keys: ["Alt", "N"], description: "지출 추가" },
      { keys: ["?"], description: "단축키 도움말" },
    ],
  },
]

// 개별 키캡을 "+"로 연결하여 렌더링
function KeyCombo({ keys }: { keys: Array<string> }) {
  return (
    <span className={styles.keyCombo}>
      {keys.map((key, i) => (
        <span key={i} className={styles.keyGroup}>
          {i > 0 && <span className={styles.keySeparator}>+</span>}
          <kbd className={styles.keyCap}>{key}</kbd>
        </span>
      ))}
    </span>
  )
}

// 전체 키보드 단축키 목록 모달
export function ShortcutHelpDialog({ open, onClose }: ShortcutHelpDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup} role="dialog" aria-label="단축키 도움말">
          <Dialog.Title className={styles.title}>단축키</Dialog.Title>

          <div className={styles.groups}>
            {SHORTCUT_GROUPS.map(({ label, items }) => (
              <section key={label} className={styles.group}>
                <h3 className={styles.groupLabel}>{label}</h3>
                <ul className={styles.list}>
                  {items.map(({ keys, description }) => (
                    <li key={keys.join("+")} className={styles.row}>
                      <KeyCombo keys={keys} />
                      <span className={styles.description}>{description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className={styles.footer}>
            <Dialog.Close
              render={
                <button type="button" className={styles.closeButton}>
                  닫기
                </button>
              }
            />
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
