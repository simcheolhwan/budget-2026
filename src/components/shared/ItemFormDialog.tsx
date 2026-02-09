import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import { CategoryPills } from "./CategoryPills"
import formStyles from "./FormDialog.module.css"
import type { TransactionItem } from "@/schemas"
import { TransactionItemSchema } from "@/schemas"
import { getCurrentMonth } from "@/lib/utils"

interface ItemFormDialogProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  defaultValues?: Partial<TransactionItem>
  categories: Array<string>
  onSubmit: (item: TransactionItem) => Promise<void>
  onDelete?: () => void
}

// 수입 항목 추가/수정 폼 다이얼로그
export function ItemFormDialog({
  open,
  onClose,
  mode,
  defaultValues,
  categories,
  onSubmit,
  onDelete,
}: ItemFormDialogProps) {
  const { register, handleSubmit, control, reset, formState } = useForm<TransactionItem>({
    resolver: zodResolver(TransactionItemSchema),
    defaultValues: {
      month: getCurrentMonth(),
      category: "",
      name: "",
      memo: "",
      amount: 0,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        month: mode === "create" ? getCurrentMonth() : undefined,
        category: "",
        name: "",
        memo: "",
        amount: 0,
        ...defaultValues,
      })
    }
  }, [open, mode, defaultValues, reset])

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
            {mode === "create" ? "수입 추가" : "수입 수정"}
          </Dialog.Title>

          <form onSubmit={handleFormSubmit} className={formStyles.form}>
            <div className={formStyles.field}>
              <label htmlFor="item-month" className={formStyles.label}>
                월
              </label>
              <select
                id="item-month"
                className={formStyles.select}
                {...register("month", {
                  setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                })}
              >
                <option value="">없음</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}월
                  </option>
                ))}
              </select>
              {formState.errors.month && (
                <span role="alert" className={formStyles.error}>
                  {formState.errors.month.message}
                </span>
              )}
            </div>

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
              <label htmlFor="item-name" className={formStyles.label}>
                항목
              </label>
              <input
                id="item-name"
                type="text"
                className={formStyles.input}
                {...register("name")}
                placeholder="항목명…"
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="item-memo" className={formStyles.label}>
                메모
              </label>
              <input
                id="item-memo"
                type="text"
                className={formStyles.input}
                {...register("memo")}
                placeholder="메모…"
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="item-amount" className={formStyles.label}>
                금액
              </label>
              <input
                id="item-amount"
                type="number"
                inputMode="numeric"
                className={formStyles.input}
                {...register("amount", { valueAsNumber: true })}
              />
              {formState.errors.amount && (
                <span role="alert" className={formStyles.error}>
                  {formState.errors.amount.message}
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
