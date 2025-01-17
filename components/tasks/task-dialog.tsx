'use client'
import { ReactNode, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { TaskForm } from './task-form'
import { Task } from '@/types/task'

type TaskDialogProps = {
  onSubmit: (task: Partial<Task>) => Promise<void>
  initialValues?: Task
  mode: 'create' | 'edit'
  children?: ReactNode
}

export function TaskDialog({ onSubmit, initialValues, mode, children }: TaskDialogProps) {
  const [open, onOpenChange] = useState(false)

  const handleSubmit = async (task: Partial<Task>) => {
    try {
      await onSubmit?.({ ...initialValues, ...task })
      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${mode}ing task:`, error)
    }
  }

  const title = mode === 'create' ? 'Create new task' : 'Edit task'
  const description =
    mode === 'create'
      ? 'Describe your task in detail. You can always edit it later.'
      : 'Update your task details.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px] sm:top-[50%] sm:translate-y-[-50%] sm:bottom-auto top-auto translate-y-0 bottom-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm
          initialValues={initialValues}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
