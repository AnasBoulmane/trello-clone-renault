'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Task } from '@/types/task'
import { TaskDialog } from '@/components/tasks/task-dialog'

// Options that can be passed when opening the dialog
type TaskDialogOptions = {
  mode: 'create' | 'edit'
  initialValues?: Task
  title?: string
  description?: string
}

// The internal state of the dialog
type TaskDialogState = TaskDialogOptions & {
  isOpen: boolean
  resolve?: (value: Task | undefined) => void
}

// The context type that components will use
type TaskDialogContextType = {
  openDialog: (options: TaskDialogOptions) => Promise<Task | undefined>
}

const TaskDialogContext = createContext<TaskDialogContextType | undefined>(undefined)

const defaultState: TaskDialogState = {
  isOpen: false,
  mode: 'create',
}

/**
 * TaskDialogProvider: Manages the task dialog state and provides a consistent
 * interface for creating and editing tasks throughout the application.
 */
export function TaskDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TaskDialogState>(defaultState)

  // Opens the dialog and returns a promise that resolves with the task data
  // when the user submits the form or undefined if they cancel
  const openDialog = useCallback((options: TaskDialogOptions): Promise<Task | undefined> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  // Handles dialog open state changes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setState((current) => ({
        ...current,
        isOpen,
      }))

      if (!isOpen && state.resolve) {
        state.resolve(undefined)
      }
    },
    [state.resolve]
  )

  // Handles form submission
  const handleSubmit = useCallback(
    async (formData: Partial<Task>) => {
      if (state.resolve) {
        const taskData = {
          ...state.initialValues,
          ...formData,
        }
        state.resolve(taskData as Task)
      }
      setState(defaultState)
    },
    [state.initialValues, state.resolve]
  )

  // Handles cancellation
  const handleCancel = useCallback(() => {
    if (state.resolve) {
      state.resolve(undefined)
    }
    setState(defaultState)
  }, [state.resolve])

  return (
    <TaskDialogContext.Provider value={{ openDialog }}>
      {children}
      <TaskDialog
        open={state.isOpen}
        onOpenChange={handleOpenChange}
        mode={state.mode}
        initialValues={state.initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </TaskDialogContext.Provider>
  )
}

/**
 * useTaskDialog: A hook that provides access to the task dialog functionality.
 * This hook must be used within a TaskDialogProvider.
 */
export function useTaskDialog() {
  const context = useContext(TaskDialogContext)

  if (!context) {
    throw new Error('useTaskDialog must be used within a TaskDialogProvider')
  }

  return context
}
