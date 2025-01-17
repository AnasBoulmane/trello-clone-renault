import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTaskStore } from './use-task-store'
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api'

// Mock all API functions
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

describe('TaskStore', () => {
  // Before each test, we need to:
  // 1. Clear any mocked function calls
  // 2. Reset the store state
  // 3. Clear localStorage to ensure persistence tests start fresh
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useTaskStore.setState({
      columns: { todo: [], inProgress: [], done: [] },
      hasHydrated: false,
    })
  })

  describe('Store Initialization and Hydration', () => {
    it('should initialize with default state', () => {
      const state = useTaskStore.getState()

      expect(state.columns).toEqual({
        todo: [],
        inProgress: [],
        done: [],
      })
      expect(state.hasHydrated).toBe(false)
    })

    it('should track hydration status', () => {
      act(() => {
        useTaskStore.getState().setHasHydrated(true)
      })

      expect(useTaskStore.getState().hasHydrated).toBe(true)
    })

    it('should persist state to localStorage', () => {
      const task = { id: 1, title: 'Test Task', status: 'todo' }

      act(() => {
        useTaskStore.setState({
          columns: { todo: [task], inProgress: [], done: [] },
          hasHydrated: true,
        })
      })

      // Check localStorage content
      const stored = JSON.parse(localStorage.getItem('task-storage') || '{}')
      expect(stored.state.columns.todo).toHaveLength(1)
      expect(stored.state.columns.todo[0]).toEqual(task)
    })
  })

  describe('Task Fetching', () => {
    it('should fetch tasks only when not hydrated', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo' },
        { id: 2, title: 'Task 2', status: 'todo' },
      ]
      ;(fetchTasks as any).mockResolvedValueOnce(mockTasks)

      // First fetch (not hydrated)
      await act(async () => {
        await useTaskStore.getState().fetchInitialTasks()
      })

      expect(fetchTasks).toHaveBeenCalledTimes(1)
      expect(useTaskStore.getState().columns.todo).toHaveLength(2)

      // Set as hydrated
      act(() => {
        useTaskStore.getState().setHasHydrated(true)
      })

      // Try fetching again
      await act(async () => {
        await useTaskStore.getState().fetchInitialTasks()
      })

      // Should not fetch again since we're hydrated
      expect(fetchTasks).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(fetchTasks as any).mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useTaskStore.getState().fetchInitialTasks()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching tasks:', expect.any(Error))
      expect(useTaskStore.getState().columns.todo).toHaveLength(0)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Task Operations', () => {
    it('should add new task to todo column', async () => {
      const newTask = { title: 'New Task', description: 'Description' }
      const createdTask = {
        id: 1,
        ...newTask,
        status: 'todo',
        completed: false,
      }
      ;(createTask as any).mockResolvedValueOnce(createdTask)

      await act(async () => {
        await useTaskStore.getState().addTask(newTask)
      })

      expect(createTask).toHaveBeenCalledWith(newTask)
      expect(useTaskStore.getState().columns.todo[0]).toEqual(createdTask)
    })

    it('should update existing task', async () => {
      // Setup initial state
      const task = { id: 1, title: 'Task 1', status: 'todo' }
      act(() => {
        useTaskStore.setState({
          columns: { todo: [task], inProgress: [], done: [] },
        })
      })

      const updatedTask = { ...task, title: 'Updated Task' }
      ;(updateTask as any).mockResolvedValueOnce(updatedTask)

      await act(async () => {
        await useTaskStore.getState().updateTask(updatedTask)
      })

      expect(updateTask).toHaveBeenCalledWith(updatedTask)
      expect(useTaskStore.getState().columns.todo[0].title).toBe('Updated Task')
    })

    it('should delete task from any column', async () => {
      // Setup initial state with tasks in different columns
      const tasks = {
        todo: [{ id: 1, title: 'Task 1', status: 'todo' }],
        inProgress: [{ id: 2, title: 'Task 2', status: 'inProgress' }],
        done: [],
      }
      act(() => {
        useTaskStore.setState({ columns: tasks })
      })

      await act(async () => {
        await useTaskStore.getState().deleteTask(1)
      })

      expect(deleteTask).toHaveBeenCalledWith(1)
      expect(useTaskStore.getState().columns.todo).toHaveLength(0)
      expect(useTaskStore.getState().columns.inProgress).toHaveLength(1)
    })
  })

  describe('Drag and Drop Operations', () => {
    it('should handle drag within same column', async () => {
      // Setup initial state with multiple tasks
      const tasks = [
        { id: 1, title: 'Task 1', status: 'todo' },
        { id: 2, title: 'Task 2', status: 'todo' },
      ]
      act(() => {
        useTaskStore.setState({
          columns: { todo: tasks, inProgress: [], done: [] },
        })
      })

      const dropResult = {
        destination: { droppableId: 'todo', index: 1 },
        source: { droppableId: 'todo', index: 0 },
        draggableId: '1',
        type: 'DEFAULT',
      }

      await act(async () => {
        await useTaskStore.getState().handleDragEnd(dropResult)
      })

      // Verify reordering occurred but no API call was made
      const state = useTaskStore.getState()
      expect(state.columns.todo[1].id).toBe(1)
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('should handle drag between columns with optimistic update', async () => {
      const task = { id: 1, title: 'Task 1', status: 'todo' }
      act(() => {
        useTaskStore.setState({
          columns: { todo: [task], inProgress: [], done: [] },
        })
      })

      const dropResult = {
        destination: { droppableId: 'inProgress', index: 0 },
        source: { droppableId: 'todo', index: 0 },
        draggableId: '1',
        type: 'DEFAULT',
      }

      const updatedTask = { ...task, status: 'inProgress', completed: false }
      ;(updateTask as any).mockResolvedValueOnce(updatedTask)

      await act(async () => {
        await useTaskStore.getState().handleDragEnd(dropResult)
      })

      const state = useTaskStore.getState()
      expect(state.columns.todo).toHaveLength(0)
      expect(state.columns.inProgress).toHaveLength(1)
      expect(state.columns.inProgress[0].status).toBe('inProgress')
      expect(updateTask).toHaveBeenCalledWith(expect.objectContaining(updatedTask))
    })

    it('should revert optimistic update on API failure', async () => {
      const task = { id: 1, title: 'Task 1', status: 'todo' }
      act(() => {
        useTaskStore.setState({
          columns: { todo: [task], inProgress: [], done: [] },
        })
      })

      const dropResult = {
        destination: { droppableId: 'inProgress', index: 0 },
        source: { droppableId: 'todo', index: 0 },
        draggableId: '1',
        type: 'DEFAULT',
      }

      ;(updateTask as any).mockRejectedValueOnce(new Error('Update failed'))

      await act(async () => {
        await useTaskStore.getState().handleDragEnd(dropResult)
      })

      const state = useTaskStore.getState()
      expect(state.columns.todo).toHaveLength(1)
      expect(state.columns.inProgress).toHaveLength(0)
    })
  })
})
