'use client'
import { GripVertical, Pencil, Trash } from 'lucide-react'
import { DraggableProvided } from '@hello-pangea/dnd'

import { Task } from '@/types/task'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent } from '../ui/card'
import { useConfirmation } from '@/contexts/confirmation-context'
import { useTaskDialog } from '@/contexts/task-dialog-context'
import { useTaskStore } from '@/stores/use-task-store'

type TaskCardProps = {
  task: Task
  provided: DraggableProvided
  isDragging: boolean
}

export function TaskCard({ task, provided, isDragging }: TaskCardProps) {
  const { updateTask, deleteTask } = useTaskStore()
  const confirmation = useConfirmation()
  const taskDialog = useTaskDialog()

  // Handle task deletion with confirmation
  const handleDelete = async () => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Task',
      description: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    })

    if (confirmed) {
      await deleteTask(task.id)
    }
  }

  // Handle task editing
  const handleEdit = async () => {
    const updatedTask = await taskDialog.openDialog({
      mode: 'edit',
      initialValues: task,
    })

    if (updatedTask) {
      await updateTask(updatedTask)
    }
  }

  // Render the task card
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
        <button
          role="button"
          className="flex self-start opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
          data-testid="delete-task"
        >
          <Trash className="w-4 h-4 text-gray-400" />
        </button>
        <button
          role="button"
          className="flex self-start opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEdit}
          data-testid="edit-task"
        >
          <Pencil className="w-4 h-4 text-gray-400 " />
        </button>
        <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      {task.description && (
        <CardContent className="p-4 pt-0 text-sm text-gray-600">{task.description}</CardContent>
      )}
    </Card>
  )
}
