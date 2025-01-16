import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, renderHook } from '@testing-library/react'
import { TaskProvider, useTaskContext } from './task-context'
import { fetchTasks, createTask } from '@/lib/api'
import { DropResult } from '@hello-pangea/dnd'

// Mock the API
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
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
    const createdTask = { id: '1', ...newTask }
    ;(createTask as any).mockResolvedValueOnce(createdTask)

    const { result } = renderHook(() => useTaskContext(), { wrapper })

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(createTask).toHaveBeenCalledWith(newTask)
    expect(result.current.columns.todo[0]).toEqual(createdTask)
  })

  it('should handle drag and drop between columns', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper })

    const task = { id: '1', title: 'Task 1', description: 'Description' }

    // Set initial state with a task in todo
    act(() => {
      result.current.columns.todo.push(task)
    })

    // Simulate drag from todo to inProgress
    await act(async () => {
      result.current.handleDragEnd({
        destination: { droppableId: 'inProgress', index: 0 },
        source: { droppableId: 'todo', index: 0 },
        draggableId: '1',
        type: 'DEFAULT',
      } as DropResult)
    })

    expect(result.current.columns.todo).toHaveLength(0)
    expect(result.current.columns.inProgress).toHaveLength(1)
    expect(result.current.columns.inProgress[0]).toEqual(task)
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
})
