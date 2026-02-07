import { useSortable } from "@dnd-kit/sortable"
import type { ReactNode } from "react"

interface SortableRowProps {
  id: string
  children: ReactNode
}

// 드래그 가능한 테이블 행 (행 자체가 드래그 핸들)
export function SortableRow({ id, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  }

  return (
    <tr ref={setNodeRef} style={style} data-clickable {...listeners} {...attributes}>
      {children}
    </tr>
  )
}
