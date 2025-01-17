/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { TaskBoard } from './task-board'
import { useTaskStore } from '@/stores/use-task-store'

// Mock the Zustand store
vi.mock('@/stores/use-task-store', () => ({
  useTaskStore: vi.fn(),
}))

vi.mock('@/contexts/task-dialog-context', () => ({
  useTaskDialog: vi.fn(),
}))

vi.mock('@/contexts/confirmation-context', () => ({
  useConfirmation: vi.fn(),
}))

describe('TaskBoard Component', () => {
  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

  it('should render columns and tasks from store', () => {
    // Mock the store values
    const mockStoreValue = {
      columns: {
        todo: [{ id: '1', title: 'Task 1', description: 'Description 1' }],
        inProgress: [],
        done: [],
      },
      fetchInitialTasks: vi.fn(),
      addTask: vi.fn(),
      handleDragEnd: vi.fn(),
    }

    ;(useTaskStore as any).mockReturnValue(mockStoreValue)

    render(<TaskBoard />)

    // Verify columns are rendered
    expect(screen.getByText('To Do')).toBeDefined()
    expect(screen.getByText('In Progress')).toBeDefined()
    expect(screen.getByText('Done')).toBeDefined()

    // Verify the columns have the correct structure
    const columns = screen.getAllByTestId('task-column')
    expect(columns).toHaveLength(3)

    // Verify task is rendered
    expect(screen.getByText('Task 1')).toBeDefined()
  })

  it('should call fetchInitialTasks on mount', () => {
    const fetchInitialTasks = vi.fn()
    ;(useTaskStore as any).mockReturnValue({
      columns: { todo: [], inProgress: [], done: [] },
      fetchInitialTasks,
      handleDragEnd: vi.fn(),
    })

    render(<TaskBoard />)

    expect(fetchInitialTasks).toHaveBeenCalled()
  })
})
