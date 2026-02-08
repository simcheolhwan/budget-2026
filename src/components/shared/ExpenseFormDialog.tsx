import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog } from "@base-ui/react/dialog"
import { Checkbox } from "@base-ui/react/checkbox"
import { CategoryPills } from "./CategoryPills"
import formStyles from "./FormDialog.module.css"
import type { ExpenseItem, ProjectItem } from "@/schemas"
import { TransactionItemSchema } from "@/schemas"
import { getCurrentMonth, isProjectExpense } from "@/lib/utils"

// 지출 항목 폼 스키마 (프로젝트 체크 시 amount 제외)
const ExpenseFormSchema = TransactionItemSchema.extend({
  isProject: z.boolean(),
})

type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>

interface ExpenseFormDialogProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  defaultValues?: Partial<ExpenseItem>
  categories: Array<string>
  onSubmit: (item: ExpenseItem) => Promise<void>
  onDelete?: () => void
}

// 지출 항목 추가/수정 폼 다이얼로그 (프로젝트 체크박스 포함)
export function ExpenseFormDialog({
  open,
  onClose,
  mode,
  defaultValues,
  categories,
  onSubmit,
  onDelete,
}: ExpenseFormDialogProps) {
  const isExistingProject = defaultValues ? isProjectExpense(defaultValues as ExpenseItem) : false

  const { register, handleSubmit, control, reset, watch, formState } = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: {
      month: getCurrentMonth(),
      category: "",
      name: "",
      memo: "",
      amount: 0,
      isProject: isExistingProject,
      ...defaultValues,
    },
  })

  const isProject = watch("isProject")

  useEffect(() => {
    if (open) {
      reset({
        month: mode === "create" ? getCurrentMonth() : undefined,
        category: "",
        name: "",
        memo: "",
        amount: 0,
        isProject: isExistingProject,
        ...defaultValues,
      })
    }
  }, [open, mode, defaultValues, isExistingProject, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    const { isProject: isProjectChecked, ...rest } = data
    const cleaned = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, v === "" ? undefined : v]),
    ) as Record<string, unknown>

    let item: ExpenseItem
    if (isProjectChecked) {
      // 프로젝트 지출: amount 제거, items 빈 배열
      item = {
        category: cleaned.category as string | undefined,
        month: cleaned.month as number | undefined,
        name: cleaned.name as string | undefined,
        memo: cleaned.memo as string | undefined,
        items:
          isExistingProject && defaultValues && "items" in defaultValues
            ? (defaultValues as { items: Array<ProjectItem> }).items
            : [],
      }
    } else {
      item = {
        category: cleaned.category as string | undefined,
        month: cleaned.month as number | undefined,
        name: cleaned.name as string | undefined,
        memo: cleaned.memo as string | undefined,
        amount: cleaned.amount as number,
      }
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
            {mode === "create" ? "지출 추가" : "지출 수정"}
          </Dialog.Title>

          <form onSubmit={handleFormSubmit} className={formStyles.form}>
            <div className={formStyles.field}>
              <label htmlFor="expense-month" className={formStyles.label}>
                월
              </label>
              <select
                id="expense-month"
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
              <label htmlFor="expense-name" className={formStyles.label}>
                항목
              </label>
              <input
                id="expense-name"
                type="text"
                className={formStyles.input}
                {...register("name")}
                placeholder="항목명…"
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="expense-memo" className={formStyles.label}>
                메모
              </label>
              <input
                id="expense-memo"
                type="text"
                className={formStyles.input}
                {...register("memo")}
                placeholder="메모…"
              />
            </div>

            {!isProject && (
              <div className={formStyles.field}>
                <label htmlFor="expense-amount" className={formStyles.label}>
                  금액
                </label>
                <input
                  id="expense-amount"
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
            )}

            <div className={formStyles.field}>
              <Controller
                name="isProject"
                control={control}
                render={({ field }) => (
                  <label className={formStyles.checkboxLabel}>
                    <Checkbox.Root
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mode === "edit" && isExistingProject}
                      className={formStyles.checkbox}
                    >
                      <Checkbox.Indicator className={formStyles.checkboxIndicator} />
                    </Checkbox.Root>
                    프로젝트 지출
                  </label>
                )}
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
