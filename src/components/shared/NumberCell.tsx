import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import styles from "./NumberCell.module.css"
import { formatNumber, parseOperatorInput } from "@/lib/utils"

interface NumberCellProps {
  value: number
  discrepancy: number
  onUpdate: (newValue: number) => Promise<void>
  onAutoAdjust?: () => Promise<void>
  autoAdjustResult?: number
}

// 숫자 셀 표시 + Popover 편집
export function NumberCell({
  value,
  discrepancy,
  onUpdate,
  onAutoAdjust,
  autoAdjustResult,
}: NumberCellProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Popover 열릴 때 입력 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setInputValue("")
      // 다음 프레임에서 포커스 (Popover 렌더 후)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // +/- 연산 미리보기
  const preview = useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return null
    if (!trimmed.startsWith("+") && !trimmed.startsWith("-")) return null
    const delta = Number(trimmed)
    if (Number.isNaN(delta)) return null
    return value + delta
  }, [inputValue, value])

  const handleSubmit = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (trimmed === "") {
      setOpen(false)
      return
    }

    const newValue = parseOperatorInput(trimmed, value)
    if (newValue === null) {
      setOpen(false)
      return
    }

    setOpen(false)
    await onUpdate(newValue)
  }, [inputValue, value, onUpdate])

  const handleAutoAdjust = useCallback(async () => {
    setOpen(false)
    await onAutoAdjust?.()
  }, [onAutoAdjust])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    },
    [handleSubmit],
  )

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={<span />}
          nativeButton={false}
          data-number-cell
          aria-label="금액 편집"
        >
          {formatNumber(value)}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end">
            <Popover.Popup className={styles.popup}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={inputValue}
                placeholder={formatNumber(value)}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="새 금액"
              />

              {preview !== null && (
                <div className={styles.preview}>
                  {formatNumber(value)} {inputValue.trim().startsWith("-") ? "−" : "+"}{" "}
                  {formatNumber(Math.abs(preview - value))} = {formatNumber(preview)}
                </div>
              )}

              {onAutoAdjust && discrepancy !== 0 && autoAdjustResult != null && (
                <button type="button" className={styles.autoButton} onClick={handleAutoAdjust}>
                  {formatNumber(value)} {autoAdjustResult - value > 0 ? "+" : "−"}{" "}
                  {formatNumber(Math.abs(autoAdjustResult - value))} ={" "}
                  {formatNumber(autoAdjustResult)}
                </button>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </span>
  )
}
