import { IconPlus } from "@tabler/icons-react"
import styles from "./AddButton.module.css"

interface AddButtonProps {
  onClick: () => void
  label: string
}

// 섹션별 항목 추가 버튼
export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onClick} aria-label={label}>
      <IconPlus size={16} aria-hidden />
    </button>
  )
}
