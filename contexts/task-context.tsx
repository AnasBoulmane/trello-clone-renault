'use client'

import { createContext, useContext, ReactNode } from 'react'
import { DropResult } from '@hello-pangea/dnd'

import { BoardColumns, Task } from '@/types/task'
import { useDragAndDrop } from '@/hooks/use-dnd'
import { createTask, fetchTasks } from '@/lib/api'

type TaskContextType = {
  columns: BoardColumns
  addTask: (task: Partial<Task>) => Promise<void>
  fetchInitialTasks: () => void
  handleDragEnd: (result: DropResult) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

/**
 * TaskProvider Component: a context provider that centralizes the state and logic for the task board exercise.
 **/
export function TaskProvider({ children }: { children: ReactNode }) {
  const { columns, setColumns, handleDragEnd } = useDragAndDrop({
    todo: [],
    inProgress: [],
    done: [],
  } as BoardColumns)

  // fetch tasks from the API
  const fetchInitialTasks = () => {
    // Todo add loading state and probably using react-query for better data fetching
    fetchTasks()
      .then((data) => {
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          // this because the API doesn't return the description field for todos
          description: `Task ${task.id} description`,
        }))

        setColumns((prev: BoardColumns) => ({
          ...prev,
          todo: formattedTasks,
        }))
      })
      .catch(console.error) // todo: show error message
  }

  // Add a new task to the todo column
  const addTask = async (newTask: Partial<Task>) => {
    if (!newTask.title?.trim()) return

    try {
      const data = await createTask(newTask)
      if (!data) return

      setColumns((prev) => ({
        ...prev,
        todo: [
          {
            id: data.id,
            title: data.title,
            description: data.description,
          },
          ...prev.todo,
        ],
      }))
    } catch (error) {
      console.error('Error adding task:', error)
      // Here you could integrate with a toast notification system
    }
  }

  return (
    <TaskContext.Provider value={{ columns, addTask, fetchInitialTasks, handleDragEnd }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}
