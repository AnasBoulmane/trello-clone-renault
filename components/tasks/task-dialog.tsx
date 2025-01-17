'use client'
import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { TaskForm } from './task-form'
import { Task } from '@/types/task'

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Partial<Task>) => Promise<void>
  onCancel?: () => void
  initialValues?: Task
  mode: 'create' | 'edit'
  children?: ReactNode
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  initialValues,
  mode,
  children,
}: TaskDialogProps) {
  const handleSubmit = async (task: Partial<Task>) => {
    try {
      await onSubmit?.({ ...initialValues, ...task })
      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${mode}ing task:`, error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const title = mode === 'create' ? 'Create new task' : 'Edit task'
  const description =
    mode === 'create'
      ? 'Describe your task in detail. You can always edit it later.'
      : 'Update your task details.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm initialValues={initialValues} onCancel={handleCancel} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
