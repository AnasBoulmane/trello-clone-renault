import { GripVertical } from 'lucide-react'
import { DraggableProvided } from '@hello-pangea/dnd'

import { Card, CardHeader, CardContent } from '../ui/card'
import { Task } from '@/types/task'
import { cn } from '@/lib/utils'

type TaskCardProps = {
  task: Task
  provided: DraggableProvided
  isDragging: boolean
}

export function TaskCard({ task, provided, isDragging }: TaskCardProps) {
  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cn(
        // Base classes
        'group ',
        // State-based styling
        isDragging ? 'shadow-lg' : 'hover:shadow-lg'
      )}
    >
      <CardHeader className="p-4 flex flex-row gap-2">
        <div className="font-medium flex-1">{task.title}</div>
        <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      {task.description && (
        <CardContent className="p-4 pt-0 text-sm text-gray-600">{task.description}</CardContent>
      )}
    </Card>
  )
}
