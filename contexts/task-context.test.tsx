import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { TaskProvider, useTaskContext } from './task-context'
import { fetchTasks, createTask, updateTask } from '@/lib/api'
import { DropResult } from '@hello-pangea/dnd'

// Mock the API
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
}))

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to wrap components with TaskProvider
  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>

  it('should fetch initial tasks', async () => {
    const mockTasks = [{ id: '1', title: 'Task 1' }]
    ;(fetchTasks as any).mockResolvedValueOnce(mockTasks)

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    await act(async () => {
      result.current.fetchInitialTasks()
    })

    expect(fetchTasks).toHaveBeenCalled()
    expect(result.current.columns.todo).toHaveLength(1)
    expect(result.current.columns.todo[0].title).toBe('Task 1')
  })

  it('should add new task', async () => {
    const newTask = { title: 'New Task', description: 'Description' }
    const createdTask = { id: 1, ...newTask, status: 'todo' }
    ;(createTask as any).mockResolvedValueOnce(createdTask)

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(createTask).toHaveBeenCalledWith(newTask)
    expect(result.current.columns.todo[0]).toEqual(createdTask)
  })

  // Test error handling during initial fetch
  it('should handle failed task fetching gracefully', async () => {
    // Mock the API to reject
    ;(fetchTasks as any).mockRejectedValue(new Error('Failed to fetch tasks'))
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    await act(async () => {
      result.current.fetchInitialTasks()
    })

    expect(fetchTasks).toHaveBeenCalled()
    expect(result.current.columns.todo).toHaveLength(0)
  })

  it('should handle drag within same column', async () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'todo' },
      { id: 2, title: 'Task 2', status: 'todo' },
    ]

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    // Set initial state
    act(() => {
      result.current.columns.todo.push(...tasks)
    })

    const dropResult: DropResult = {
      destination: { droppableId: 'todo', index: 1 },
      source: { droppableId: 'todo', index: 0 },
      draggableId: '1',
      type: 'DEFAULT',
    }

    await act(async () => {
      await result.current.handleDragEnd(dropResult)
    })

    expect(result.current.columns.todo[1].id).toBe(1)
    expect(updateTask).not.toHaveBeenCalled() // No API call needed for same column
  })

  it('should handle drag between columns with optimistic update', async () => {
    const task = { id: 1, title: 'Task 1', status: 'todo' }
    const updatedTask = { ...task, status: 'inProgress', completed: false }
    ;(updateTask as any).mockResolvedValueOnce(updatedTask)

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    // Set initial state
    act(() => {
      result.current.columns.todo.push(task)
    })

    const dropResult: DropResult = {
      destination: { droppableId: 'inProgress', index: 0 },
      source: { droppableId: 'todo', index: 0 },
      draggableId: '1',
      type: 'DEFAULT',
    }

    await act(async () => {
      await result.current.handleDragEnd(dropResult)
    })

    // Verify optimistic update
    expect(result.current.columns.todo).toHaveLength(0)
    expect(result.current.columns.inProgress).toHaveLength(1)
    expect(result.current.columns.inProgress[0].status).toBe('inProgress')
    expect(updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'inProgress',
        completed: false,
      })
    )
  })

  it('should revert changes on failed drag between columns', async () => {
    const task = { id: 1, title: 'Task 1', status: 'todo' }
    ;(updateTask as any).mockRejectedValueOnce(new Error('Update failed'))

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    // Set initial state
    act(() => {
      result.current.columns.todo.push(task)
    })

    const dropResult: DropResult = {
      destination: { droppableId: 'inProgress', index: 0 },
      source: { droppableId: 'todo', index: 0 },
      draggableId: '1',
      type: 'DEFAULT',
    }

    await act(async () => {
      await result.current.handleDragEnd(dropResult)
    })

    // Verify state reverted after error
    expect(result.current.columns.todo).toHaveLength(1)
    expect(result.current.columns.inProgress).toHaveLength(0)
  })
})
