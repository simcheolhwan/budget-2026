import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { ReactNode } from "react"
import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core"

interface SortableWrapperProps {
  active: boolean
  sensors: Array<SensorDescriptor<SensorOptions>>
  keys: Array<string>
  onDragEnd: (event: DragEndEvent) => void
  children: ReactNode
}

export function SortableWrapper({
  active,
  sensors,
  keys,
  onDragEnd,
  children,
}: SortableWrapperProps) {
  if (!active) return children

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}
