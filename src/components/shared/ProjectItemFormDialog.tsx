import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import formStyles from "./FormDialog.module.css"
import type { ProjectItem } from "@/schemas"
import { ProjectItemSchema } from "@/schemas"

interface ProjectItemFormDialogProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  defaultValues?: Partial<ProjectItem>
  onSubmit: (item: ProjectItem) => Promise<void>
  onDelete?: () => void
}

// 프로젝트 하위 항목 추가/수정 폼 다이얼로그 (항목 + 금액만)
export function ProjectItemFormDialog({
  open,
  onClose,
  mode,
  defaultValues,
  onSubmit,
  onDelete,
}: ProjectItemFormDialogProps) {
  const { register, handleSubmit, reset, formState } = useForm<ProjectItem>({
    resolver: zodResolver(ProjectItemSchema),
    defaultValues: {
      name: "",
      amount: 0,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        amount: 0,
        ...defaultValues,
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
    onClose()
  })

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={formStyles.backdrop} />
        <Dialog.Popup className={formStyles.popup}>
          <Dialog.Title className={formStyles.title}>
            {mode === "create" ? "하위 항목 추가" : "하위 항목 수정"}
          </Dialog.Title>

          <form onSubmit={handleFormSubmit} className={formStyles.form}>
            <div className={formStyles.field}>
              <label htmlFor="project-item-name" className={formStyles.label}>
                항목
              </label>
              <input
                id="project-item-name"
                type="text"
                className={formStyles.input}
                {...register("name")}
                placeholder="항목명…"
              />
            </div>

            <div className={formStyles.field}>
              <label htmlFor="project-item-amount" className={formStyles.label}>
                금액
              </label>
              <input
                id="project-item-amount"
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
