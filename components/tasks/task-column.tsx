import { Draggable, Droppable } from '@hello-pangea/dnd'

import { Task } from '@/types/task'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

type TaskColumnProps = {
  title: string
  columnId: string
  tasks: Task[]
}

export function TaskColumn({ columnId, title, tasks }: TaskColumnProps) {
  return (
    <div
      className="w-1/3 flex flex-col rounded-lg p-2 transition-colors duration-200 bg-gray-100"
      data-testid="task-column"
      data-column-id={columnId}
    >
      <h2 className="text-xl font-semibold p-2 mb-2">{title}</h2>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              // Base classes
              'flex-1 rounded-lg p-2 transition-all duration-200  space-y-2',
              // State-based styling
              snapshot.isDraggingOver ? 'bg-gray-200' : 'bg-gray-100'
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided, snapshot) => (
                  <TaskCard task={task} provided={provided} isDragging={snapshot.isDragging} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
