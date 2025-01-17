/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './task-card'
import { useConfirmation } from '@/contexts/confirmation-context'
import { useTaskDialog } from '@/contexts/task-dialog-context'
import { useTaskStore } from '@/stores/use-task-store'

// Mock all required contexts
vi.mock('@/stores/use-task-store', () => ({
  useTaskStore: vi.fn(),
}))

vi.mock('@/contexts/confirmation-context', () => ({
  useConfirmation: vi.fn(),
}))

vi.mock('@/contexts/task-dialog-context', () => ({
  useTaskDialog: vi.fn(),
}))

describe('TaskCard Component', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
  }

  const mockProvided = {
    innerRef: () => {},
    draggableProps: {},
    dragHandleProps: {},
  }

  const mockUpdateTask = vi.fn()
  const mockDeleteTask = vi.fn()
  const mockConfirm = vi.fn()
  const mockOpenDialog = vi.fn()

  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()
    // Setup context mocks
    ;(useTaskStore as any).mockReturnValue({
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    })
    ;(useConfirmation as any).mockReturnValue({
      confirm: mockConfirm,
    })
    ;(useTaskDialog as any).mockReturnValue({
      openDialog: mockOpenDialog,
    })
  })

  // Existing tests remain unchanged...
  it('should render task details correctly', () => {
    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    expect(screen.getByText(mockTask.title)).toBeDefined()
    expect(screen.getByText(mockTask.description)).toBeDefined()
  })

  it('should show edit/delete button on hover', async () => {
    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)
    const editButton = screen.getByTestId('edit-task')
    const deleteButton = screen.getByTestId('delete-task')
    expect(editButton.classList).toContain('opacity-0')
    expect(deleteButton.classList).toContain('opacity-0')
    expect(editButton.classList).toContain('group-hover:opacity-100')
    expect(deleteButton.classList).toContain('group-hover:opacity-100')
  })

  // Updated test for edit functionality
  it('should open edit dialog when edit button is clicked', async () => {
    const updatedTask = { ...mockTask, title: 'Updated Title' }
    mockOpenDialog.mockResolvedValueOnce(updatedTask)

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)
    const user = userEvent.setup()

    await user.click(screen.getByTestId('edit-task'))

    expect(mockOpenDialog).toHaveBeenCalledWith({
      mode: 'edit',
      initialValues: mockTask,
    })

    // Verify that updateTask was called with the dialog result
    expect(mockUpdateTask).toHaveBeenCalledWith(updatedTask)
  })

  it('should not update task when edit dialog is cancelled', async () => {
    mockOpenDialog.mockResolvedValueOnce(undefined)

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)
    const user = userEvent.setup()

    await user.click(screen.getByTestId('edit-task'))

    expect(mockOpenDialog).toHaveBeenCalledWith({
      mode: 'edit',
      initialValues: mockTask,
    })

    // Verify that updateTask was not called
    expect(mockUpdateTask).not.toHaveBeenCalled()
  })

  it('handles task deletion with confirmation', async () => {
    mockConfirm.mockResolvedValueOnce(true)

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    const user = userEvent.setup()
    const deleteButton = screen.getByTestId('delete-task')

    await user.click(deleteButton)

    expect(mockConfirm).toHaveBeenCalledWith({
      title: 'Delete Task',
      description: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    })

    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id)
  })

  it('does not delete task when confirmation is cancelled', async () => {
    mockConfirm.mockResolvedValueOnce(false)

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    const user = userEvent.setup()
    const deleteButton = screen.getByTestId('delete-task')

    await user.click(deleteButton)

    expect(mockConfirm).toHaveBeenCalled()
    expect(mockDeleteTask).not.toHaveBeenCalled()
  })
})
