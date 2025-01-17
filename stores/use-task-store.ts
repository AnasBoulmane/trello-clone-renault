// store/use-task-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DropResult } from '@hello-pangea/dnd'
import { BoardColumns, Task } from '@/types/task'
import {
  createTask,
  fetchTasks,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from '@/lib/api'

// Define the store's state and actions
interface TaskState {
  // State
  columns: BoardColumns
  hasHydrated: boolean

  // Actions
  setHasHydrated: (state: boolean) => void
  fetchInitialTasks: () => Promise<void>
  addTask: (task: Partial<Task>) => Promise<void>
  updateTask: (task: Partial<Task>) => Promise<void>
  deleteTask: (id: string | number) => Promise<void>
  handleDragEnd: (result: DropResult) => Promise<void>
}

// Create the store with persistence
export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // Initial state
      columns: {
        todo: [],
        inProgress: [],
        done: [],
      },
      hasHydrated: false,

      // Actions
      setHasHydrated: (state) => set({ hasHydrated: state }),

      fetchInitialTasks: async () => {
        // Only fetch if we don't have any tasks in the store
        const { columns, hasHydrated } = get()
        const isEmpty = Object.values(columns).every((col) => col.length === 0)

        // If we have persisted data, don't fetch
        if (hasHydrated && !isEmpty) {
          return
        }

        try {
          const data = await fetchTasks()
          const formattedTasks = data.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description || `Task ${task.id} description`,
            status: task.status || 'todo',
          }))

          set((state) => ({
            columns: {
              ...state.columns,
              todo: formattedTasks,
            },
          }))
        } catch (error) {
          console.error('Error fetching tasks:', error)
        }
      },

      addTask: async (newTask) => {
        if (!newTask.title?.trim()) return

        try {
          const data = await createTask(newTask)
          if (!data) return

          set((state) => ({
            columns: {
              ...state.columns,
              todo: [
                {
                  id: data.id,
                  title: data.title,
                  description: data.description,
                  completed: data.completed,
                  status: 'todo',
                },
                ...state.columns.todo,
              ],
            },
          }))
        } catch (error) {
          console.error('Error adding task:', error)
        }
      },

      updateTask: async (task) => {
        if (!task.title?.trim()) return

        try {
          const data = await updateTaskApi(task)

          set((state) => {
            const status = data.status || ('todo' as keyof BoardColumns)
            const updatedTasks = state.columns[status].map((t) => (t.id === data.id ? data : t))

            return {
              columns: {
                ...state.columns,
                [status]: updatedTasks,
              },
            }
          })
        } catch (error) {
          console.error('Error updating task:', error)
        }
      },

      deleteTask: async (id) => {
        try {
          await deleteTaskApi(Number(id))

          set((state) => {
            const updatedColumns = Object.fromEntries(
              Object.entries(state.columns).map(([key, value]) => [
                key,
                value.filter((task) => task.id !== Number(id)),
              ])
            )
            return { columns: updatedColumns as BoardColumns }
          })
        } catch (error) {
          console.error('Error deleting task:', error)
        }
      },

      handleDragEnd: async (result) => {
        const { source, destination } = result
        if (!destination) return

        const state = get()
        const sourceId = source.droppableId as keyof BoardColumns
        const destinationId = destination.droppableId as keyof BoardColumns
        const sourceColumn = Array.from(state.columns[sourceId])
        const [movedItem] = sourceColumn.splice(source.index, 1)

        // If dragging within the same column
        if (sourceId === destinationId) {
          sourceColumn.splice(destination.index, 0, movedItem)
          set({
            columns: {
              ...state.columns,
              [sourceId]: sourceColumn,
            },
          })
        } else {
          // If dragging between different columns
          const destColumn = Array.from(state.columns[destinationId])
          const updatedItem = {
            ...movedItem,
            status: destinationId,
            completed: destinationId === 'done',
          }

          // Optimistically update the state
          destColumn.splice(destination.index, 0, updatedItem)
          set({
            columns: {
              ...state.columns,
              [sourceId]: sourceColumn,
              [destinationId]: destColumn,
            },
          })

          // Update the task on the server
          try {
            await updateTaskApi(updatedItem)
          } catch (error) {
            // Revert the changes if the update fails
            set({
              columns: {
                ...state.columns,
                [sourceId]: state.columns[sourceId],
                [destinationId]: state.columns[destinationId],
              },
            })
            console.error('Error updating task:', error)
          }
        }
      },
    }),
    {
      name: 'task-storage', // name of the item in localStorage
      onRehydrateStorage: () => (state) => {
        // Called after hydration is finished
        state?.setHasHydrated(true)
      },
    }
  )
)
