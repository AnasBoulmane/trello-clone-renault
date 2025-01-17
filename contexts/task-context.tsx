'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { DropResult } from '@hello-pangea/dnd'

import { BoardColumns, Task } from '@/types/task'
import {
  createTask,
  fetchTasks,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from '@/lib/api'

type TaskContextType = {
  columns: BoardColumns
  addTask: (task: Partial<Task>) => Promise<void>
  updateTask: (task: Partial<Task>) => Promise<void>
  deleteTask: (id: string | number) => Promise<void>
  fetchInitialTasks: () => void
  handleDragEnd: (result: DropResult) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

/**
 * TaskProvider Component: a context provider that centralizes the state and logic for the task board exercise.
 **/
export function TaskProvider({ children }: { children: ReactNode }) {
  const [columns, setColumns] = useState<BoardColumns>({
    todo: [],
    inProgress: [],
    done: [],
  })

  // fetch tasks from the API
  const fetchInitialTasks = () => {
    // Todo add loading state and probably using react-query for better data fetching
    fetchTasks()
      .then((data) => {
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          // this because the API doesn't return the description field for todos
          description: task.description || `Task ${task.id} description`,
          status: task.status || 'todo',
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
            status: 'todo',
          },
          ...prev.todo,
        ],
      }))
    } catch (error) {
      console.error('Error adding task:', error)
      // Here you could integrate with a toast notification system
    }
  }

  // Update a task
  const updateTask = async (task: Partial<Task>) => {
    if (!task.title?.trim()) return

    try {
      const data = await updateTaskApi(task)

      setColumns((prev) => {
        const status = data.status || ('todo' as keyof BoardColumns)
        const updatedTasks = prev[status].map((t) => (t.id === data.id ? data : t))
        return {
          ...prev,
          [status]: updatedTasks,
        }
      })
    } catch (error) {
      console.error('Error updating task:', error)
      // Here you could integrate with a toast notification system
    }
  }

  // Delete a task
  const deleteTask = async (id: string | number) => {
    try {
      await deleteTaskApi(Number(id))
      setColumns((prev) => {
        const updatedColumns = Object.fromEntries(
          Object.entries(prev).map(([key, value]) => [
            key,
            value.filter((task) => task.id !== Number(id)),
          ])
        )
        return updatedColumns as BoardColumns
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      // Here you could integrate with a toast notification system
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    try {
      const { source, destination } = result
      if (!destination) return

      const sourceId = source.droppableId as keyof BoardColumns
      const destinationId = destination.droppableId as keyof BoardColumns
      const sourceColumn = Array.from(columns[sourceId])
      const [movedItem] = sourceColumn.splice(source.index, 1)

      // If dragging within the same column
      if (sourceId === destinationId) {
        sourceColumn.splice(destination.index, 0, movedItem)
        setColumns((prev) => ({
          ...prev,
          [sourceId]: sourceColumn,
        }))
      } else {
        // If dragging between different columns
        const destColumn = Array.from(columns[destinationId])
        const updatedItem = {
          ...movedItem,
          status: destinationId,
          completed: destinationId === 'done',
        }
        // Optimistically update the state
        destColumn.splice(destination.index, 0, updatedItem)
        setColumns((prev) => ({
          ...prev,
          [sourceId]: sourceColumn,
          [destinationId]: destColumn,
        }))
        // Update the task on the server
        updateTaskApi(updatedItem).catch((error) => {
          // revert the changes if the update fails
          setColumns((prev) => ({
            ...prev,
            [sourceId]: columns[sourceId],
            [destinationId]: columns[destinationId],
          }))
          console.error('Error updating task:', error)
          // Here you could integrate with a toast notification
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Here you could integrate with a toast notification
    }
  }

  return (
    <TaskContext.Provider
      value={{ columns, addTask, updateTask, deleteTask, fetchInitialTasks, handleDragEnd }}
    >
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
