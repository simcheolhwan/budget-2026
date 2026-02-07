import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import { CategoryPills } from "./CategoryPills"
import formStyles from "./FormDialog.module.css"
import type { BalanceItem } from "@/schemas"
import { BalanceItemSchema } from "@/schemas"

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
  const { register, handleSubmit, control, reset, formState } = useForm<BalanceItem>({
    resolver: zodResolver(BalanceItemSchema),
    defaultValues: {
      category: "",
      name: "",
      balance: 0,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        category: "",
        name: "",
        balance: 0,
        ...defaultValues,
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
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

            <footer className={formStyles.footer}>
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
              <Dialog.Close
                render={
                  <button type="button" className={formStyles.cancelButton}>
                    취소
                  </button>
                }
              />
              <button type="submit" className={formStyles.submitButton}>
                저장
              </button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
