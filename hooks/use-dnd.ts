import { useState } from 'react'
import { DropResult } from '@hello-pangea/dnd'
/**
 * useDragAndDrop Hook: a generic custom hook that handles drag and drop logic.
 * it takes an initial columns object and returns the columns state and a handleDragEnd function.
 * @param initialColumns - the initial columns object.
 * @returns an object containing the columns state and the handleDragEnd function.
 **/
export function useDragAndDrop<ItemType, T extends Record<string, ItemType[]>>(initialColumns: T) {
  const [columns, setColumns] = useState<T>(initialColumns)

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    const sourceId = source.droppableId as keyof T
    const destinationId = destination.droppableId as keyof T

    // If dragging within the same column
    if (sourceId === destinationId) {
      setColumns((prev) => {
        const newColumn = Array.from(prev[sourceId])
        const [movedItem] = newColumn.splice(source.index, 1)
        newColumn.splice(destination.index, 0, movedItem)

        return {
          ...prev,
          [sourceId]: newColumn,
        }
      })
    } else {
      // If dragging between different columns
      setColumns((prev) => {
        const sourceColumn = Array.from(prev[sourceId])
        const destColumn = Array.from(prev[destinationId])
        const [movedItem] = sourceColumn.splice(source.index, 1)
        destColumn.splice(destination.index, 0, movedItem)

        return {
          ...prev,
          [sourceId]: sourceColumn,
          [destinationId]: destColumn,
        }
      })
    }
  }

  return {
    columns,
    setColumns,
    handleDragEnd,
  }
}
