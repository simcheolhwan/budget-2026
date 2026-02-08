import { useCallback, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Select } from "@base-ui/react/select"
import { IconChevronDown } from "@tabler/icons-react"
import styles from "./YearSelect.module.css"
import { formatNumber } from "@/lib/utils"
import { useAltKey } from "@/hooks/useAltKey"

interface YearSelectProps {
  years: Array<number>
  currentYear: number
  balance: number
  onYearChange: (year: number) => void
  memo?: string
  onUpdateMemo?: (memo: string | null) => Promise<void>
}

// 연도 선택 드롭다운 (트리거 = 연도 텍스트)
export function YearSelect({
  years,
  currentYear,
  balance,
  onYearChange,
  memo,
  onUpdateMemo,
}: YearSelectProps) {
  const altPressed = useAltKey()

  const currentIndex = years.indexOf(currentYear)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex >= 0 && currentIndex < years.length - 1

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <Select.Root
          value={currentYear}
          onValueChange={(val) => {
            if (val !== null) onYearChange(val)
          }}
        >
          <Select.Trigger className={styles.trigger} aria-label="연도 선택">
            {altPressed && canGoPrev && (
              <kbd className={styles.yearBadge} aria-hidden>
                ←
              </kbd>
            )}
            <Select.Value>{currentYear}</Select.Value>
            {altPressed && canGoNext && (
              <kbd className={styles.yearBadge} aria-hidden>
                →
              </kbd>
            )}
            <Select.Icon className={styles.triggerIcon}>
              <IconChevronDown size={16} aria-hidden />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Positioner
              className={styles.positioner}
              align="start"
              side="bottom"
              sideOffset={4}
              alignItemWithTrigger={false}
            >
              <Select.Popup className={styles.popup}>
                <Select.List>
                  {years.map((year) => (
                    <Select.Item className={styles.item} key={year} value={year}>
                      <Select.ItemText>{year}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        {memo && onUpdateMemo && <YearMemo memo={memo} onUpdateMemo={onUpdateMemo} />}
      </div>

      <span data-balance className={styles.balance} aria-label="수지">
        {formatNumber(balance)}
      </span>
    </div>
  )
}

function YearMemo({
  memo,
  onUpdateMemo,
}: {
  memo: string
  onUpdateMemo: (memo: string | null) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  const handleOpen = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setDraft(memo)
      setOpen(nextOpen)
    },
    [memo],
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const trimmed = draft.trim()
      await onUpdateMemo(trimmed || null)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }, [draft, onUpdateMemo])

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger render={<span />} className={styles.memoTrigger} aria-label="연도 메모 편집">
        <span className={styles.memoPreview}>{memo}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.memoBackdrop} />
        <Dialog.Popup className={styles.memoPopup}>
          <Dialog.Title className={styles.memoTitle}>메모</Dialog.Title>
          <textarea
            className={styles.memoTextarea}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSave()
            }}
            rows={4}
            placeholder="메모…"
            autoFocus
          />
          <footer className={styles.memoFooter}>
            <Dialog.Close className={styles.memoClose}>취소</Dialog.Close>
            <button className={styles.memoSave} onClick={handleSave} disabled={saving}>
              저장
            </button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
