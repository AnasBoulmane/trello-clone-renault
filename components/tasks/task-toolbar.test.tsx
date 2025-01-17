/* eslint-disable @typescript-eslint/no-explicit-any */
// components/tasks/task-toolbar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskToolbar } from './task-toolbar'
import { useTaskDialog } from '@/contexts/task-dialog-context'
import { useTaskStore } from '@/stores/use-task-store'

// Mock the contexts
vi.mock('@/stores/use-task-store', () => ({
  useTaskStore: vi.fn(),
}))

vi.mock('@/contexts/task-dialog-context', () => ({
  useTaskDialog: vi.fn(),
}))

describe('TaskToolbar Component', () => {
  const mockTask = {
    id: 1,
    title: 'New Task',
    description: 'Test Description',
    status: 'todo',
  }

  const mockAddTask = vi.fn()
  const mockOpenDialog = vi.fn()

  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()

    // Setup context mocks
    ;(useTaskStore as any).mockReturnValue({
      addTask: mockAddTask,
    })
    ;(useTaskDialog as any).mockReturnValue({
      openDialog: mockOpenDialog,
    })
  })

  it('renders the New Task button correctly', () => {
    render(<TaskToolbar />)

    const button = screen.getByRole('button', { name: /new task/i })
    expect(button).toBeDefined()
    expect(button.querySelector('svg')).toBeDefined() // Check for Plus icon
  })

  it('should open dialog and create task when dialog is confirmed', async () => {
    mockOpenDialog.mockResolvedValueOnce(mockTask)

    render(<TaskToolbar />)
    const user = userEvent.setup()

    // Click the New Task button
    const button = screen.getByRole('button', { name: /new task/i })
    await user.click(button)

    // Verify dialog was opened with correct options
    expect(mockOpenDialog).toHaveBeenCalledWith({
      mode: 'create',
    })

    // Verify addTask was called with the dialog result
    expect(mockAddTask).toHaveBeenCalledWith(mockTask)
  })

  it('should not create task when dialog is cancelled', async () => {
    mockOpenDialog.mockResolvedValueOnce(undefined)

    render(<TaskToolbar />)
    const user = userEvent.setup()

    // Click the New Task button
    await user.click(screen.getByRole('button', { name: /new task/i }))

    // Verify dialog was opened
    expect(mockOpenDialog).toHaveBeenCalled()

    // Verify addTask was not called
    expect(mockAddTask).not.toHaveBeenCalled()
  })
})
