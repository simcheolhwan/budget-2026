import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import { CategoryPills } from "./CategoryPills"
import formStyles from "./FormDialog.module.css"
import type { BalanceItem } from "@/schemas"
import { BalanceItemSchema } from "@/schemas"

const HEX_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/

function normalizeHex(v: string): string {
  let hex = v.trim()
  if (!hex) return ""
  if (!hex.startsWith("#")) hex = "#" + hex
  // 3자리 → 6자리 확장: #abc → #aabbcc
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex.toLowerCase()
}

interface BalanceFormDialogProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  defaultValues?: Partial<BalanceItem>
  categories: Array<string>
  onSubmit: (item: BalanceItem) => Promise<void>
  onDelete?: () => void
}

// 계좌/미수금/예수금 추가/수정 다이얼로그
export function BalanceFormDialog({
  open,
  onClose,
  mode,
  defaultValues,
  categories,
  onSubmit,
  onDelete,
}: BalanceFormDialogProps) {
  const { register, handleSubmit, control, reset, formState, watch, setValue } =
    useForm<BalanceItem>({
      resolver: zodResolver(BalanceItemSchema),
      defaultValues: {
        category: "",
        name: "",
        balance: 0,
        memo: "",
        ...defaultValues,
      },
    })

  const colorValue = watch("color")
  const normalizedColor = colorValue ? normalizeHex(colorValue) : ""
  const colorIsValid = normalizedColor ? HEX_RE.test(normalizedColor) : false
  const colorHasError = !!colorValue && !colorIsValid

  const handleColorBlur = () => {
    if (!colorValue) return
    const normalized = normalizeHex(colorValue)
    if (!normalized) {
      setValue("color", undefined)
    } else if (normalized !== colorValue) {
      setValue("color", normalized)
    }
  }

  useEffect(() => {
    if (open) {
      reset({
        category: "",
        name: "",
        balance: 0,
        memo: "",
        ...defaultValues,
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    const color = data.color ? normalizeHex(data.color) : undefined
    if (color && !HEX_RE.test(color)) return
    try {
      await onSubmit({ ...data, color })
      onClose()
    } catch {
      // 다이얼로그 유지 (Firebase 에러 시 자동 재시도됨)
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={formStyles.backdrop} />
        <Dialog.Popup className={formStyles.popup}>
          <Dialog.Title className={formStyles.title}>
            {mode === "create" ? "항목 추가" : "항목 수정"}
          </Dialog.Title>

          <form onSubmit={handleFormSubmit} className={formStyles.form}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>분류</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <CategoryPills
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    categories={categories}
                  />
                )}
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="balance-name" className={formStyles.label}>
                이름
              </label>
              <input
                id="balance-name"
                type="text"
                className={formStyles.input}
                {...register("name")}
                placeholder="이름…"
              />
              {formState.errors.name && (
                <span role="alert" className={formStyles.error}>
                  {formState.errors.name.message}
                </span>
              )}
            </div>

            <div className={formStyles.field}>
              <label htmlFor="balance-amount" className={formStyles.label}>
                잔액
              </label>
              <input
                id="balance-amount"
                type="number"
                inputMode="numeric"
                className={formStyles.input}
                {...register("balance", { valueAsNumber: true })}
              />
              {formState.errors.balance && (
                <span role="alert" className={formStyles.error}>
                  {formState.errors.balance.message}
                </span>
              )}
            </div>

            <div className={formStyles.field}>
              <label htmlFor="balance-memo" className={formStyles.label}>
                메모
              </label>
              <textarea
                id="balance-memo"
                className={formStyles.textarea}
                {...register("memo")}
                rows={4}
                placeholder="메모…"
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="balance-color" className={formStyles.label}>
                색상
              </label>
              <div className={formStyles.colorField}>
                <input
                  id="balance-color"
                  type="text"
                  className={formStyles.colorHexInput}
                  value={colorValue ?? ""}
                  onChange={(e) => setValue("color", e.target.value || undefined)}
                  onBlur={handleColorBlur}
                  placeholder="#000000"
                  spellCheck={false}
                  autoComplete="off"
                />
                {colorIsValid && (
                  <span
                    className={formStyles.colorPreview}
                    style={{ backgroundColor: normalizedColor }}
                  />
                )}
              </div>
              {colorHasError && (
                <span role="alert" className={formStyles.error}>
                  올바른 HEX 색상을 입력하세요
                </span>
              )}
            </div>

            <footer className={formStyles.footer}>
              <button type="submit" className={formStyles.submitButton}>
                저장
              </button>
              <Dialog.Close
                render={
                  <button type="button" className={formStyles.cancelButton}>
                    취소
                  </button>
                }
              />
              {mode === "edit" && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  data-danger
                  className={formStyles.deleteButton}
                >
                  삭제
                </button>
              )}
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
