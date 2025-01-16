'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { TaskForm } from './task-form'
import { Task } from '@/types/task'

type TaskToolbarProps = {
  onTaskCreate: (task: Partial<Task>) => Promise<void>
}

export function TaskToolbar({ onTaskCreate }: TaskToolbarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleTaskCreate = async (task: Partial<Task>) => {
    try {
      await onTaskCreate?.(task)
      setIsDialogOpen(false) // close the dialog after creating the task
    } catch (error) {
      // todo: show error message
      console.error('Error creating task:', error)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="ml-auto px-2 lg:px-3">
            New Task
            <Plus />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] sm:top-[50%] sm:translate-y-[-50%] sm:bottom-auto top-auto translate-y-0 bottom-0">
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
            <DialogDescription>
              Describre your task in detail. You can always edit it later.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onCancel={() => setIsDialogOpen(false)} onSubmit={handleTaskCreate} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
