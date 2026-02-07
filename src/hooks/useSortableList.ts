// dnd-kit DnD 정렬 패턴 추출.
// sortVisible 상태일 때만 DnD UI가 활성화된다.
// index 기반 키를 사용하여 항목 식별. 드래그 완료 시 reorderItems로 정렬 없이 그대로 저장.
import { useCallback, useMemo } from "react"
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"

export function useSortableList<T>(
  items: Array<T>,
  onReorder: (reordered: Array<T>) => Promise<void>,
) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const keys = useMemo(() => items.map((_item, index) => String(index)), [items])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = keys.indexOf(String(active.id))
      const newIndex = keys.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      await onReorder(arrayMove([...items], oldIndex, newIndex))
    },
    [items, keys, onReorder],
  )

  return { sensors, keys, handleDragEnd }
}
