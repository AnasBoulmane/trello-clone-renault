'use client'
import { Plus } from 'lucide-react'

import { DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Task } from '@/types/task'
import { TaskDialog } from './task-dialog'

type TaskToolbarProps = {
  onTaskCreate: (task: Partial<Task>) => Promise<void>
}

export function TaskToolbar({ onTaskCreate }: TaskToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <TaskDialog onSubmit={onTaskCreate} mode="create">
        <DialogTrigger asChild>
          <Button className="ml-auto px-2 lg:px-3">
            New Task
            <Plus />
          </Button>
        </DialogTrigger>
      </TaskDialog>
    </div>
  )
}
