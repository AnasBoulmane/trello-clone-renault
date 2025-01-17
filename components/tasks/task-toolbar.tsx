'use client'
import { Plus } from 'lucide-react'

import { Button } from '../ui/button'
import { useTaskContext } from '@/contexts/task-context'
import { useTaskDialog } from '@/contexts/task-dialog-context'

export function TaskToolbar() {
  const { addTask } = useTaskContext()
  const taskDialog = useTaskDialog()

  // Handle task creation with the task dialog
  const handleNewTask = async () => {
    try {
      const newTask = await taskDialog.openDialog({
        mode: 'create',
      })

      if (newTask) {
        await addTask(newTask)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      // todo: Show error message to user
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Button className="ml-auto px-2 lg:px-3" onClick={handleNewTask}>
        New Task
        <Plus />
      </Button>
    </div>
  )
}
