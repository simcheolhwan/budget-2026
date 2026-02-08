import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import { CategoryPills } from "./CategoryPills"
import formStyles from "./FormDialog.module.css"
import type { z } from "zod"
import type { Recurring } from "@/schemas"
import { RecurringSchema } from "@/schemas"

const RecurringFormSchema = RecurringSchema.pick({ category: true, name: true })

type RecurringFormValues = z.infer<typeof RecurringFormSchema>

interface RecurringFormDialogProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  defaultValues?: Partial<Recurring>
  categories: Array<string>
  onSubmit: (item: Recurring) => Promise<void>
  onDelete?: () => void
}

// 반복 항목 추가/수정 (분류 + 항목명)
// monthly 값은 테이블 내 NumberCell로 편집
export function RecurringFormDialog({
  open,
  onClose,
  mode,
  defaultValues,
  categories,
  onSubmit,
  onDelete,
}: RecurringFormDialogProps) {
  const { register, handleSubmit, control, reset } = useForm<RecurringFormValues>({
    resolver: zodResolver(RecurringFormSchema),
    defaultValues: {
      category: defaultValues?.category ?? "",
      name: defaultValues?.name ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        category: defaultValues?.category ?? "",
        name: defaultValues?.name ?? "",
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    const item: Recurring = {
      ...data,
      monthly: defaultValues?.monthly ?? {},
    }
    try {
      await onSubmit(item)
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
            {mode === "create" ? "반복 항목 추가" : "반복 항목 수정"}
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
              <label htmlFor="recurring-name" className={formStyles.label}>
                항목
              </label>
              <input
                id="recurring-name"
                type="text"
                className={formStyles.input}
                {...register("name")}
                placeholder="항목명…"
              />
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
