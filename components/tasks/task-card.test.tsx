import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './task-card'
import { useTaskContext } from '@/contexts/task-context'
import { useConfirmation } from '@/contexts/confirmation-context'

// Mock the context
vi.mock('@/contexts/task-context', () => ({
  useTaskContext: vi.fn(),
}))
vi.mock('@/contexts/confirmation-context', () => ({
  useConfirmation: vi.fn(),
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

  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()
    // Setup context mocks
    ;(useTaskContext as any).mockReturnValue({
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    })
    ;(useConfirmation as any).mockReturnValue({
      confirm: mockConfirm,
    })
  })

  it('should render task details correctly', () => {
    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    expect(screen.getByText(mockTask.title)).toBeDefined()
    expect(screen.getByText(mockTask.description)).toBeDefined()
  })

  it('should show edit button on hover', async () => {
    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)
    const user = userEvent.setup()

    // The edit button should initially be invisible (opacity-0)
    const editButton = screen.getByTestId('edit-task')
    expect(editButton.classList).toContain('opacity-0')

    // Hover should make it visible
    await user.hover(editButton.parentElement!)
    expect(editButton.classList).toContain('group-hover:opacity-100')
  })

  it('should open edit dialog when edit button is clicked', async () => {
    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)
    const user = userEvent.setup()

    await user.click(screen.getByTestId('edit-task'))

    expect(screen.getByText('Edit task')).toBeDefined()
    expect((screen.getByTestId('title-input') as HTMLInputElement).value).toBe(mockTask.title)
    expect((screen.getByTestId('description-input') as HTMLInputElement).value).toBe(
      mockTask.description
    )
  })

  it('handles task deletion with confirmation', async () => {
    mockConfirm.mockResolvedValueOnce(true) // User confirms deletion

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    const user = userEvent.setup()
    const deleteButton = screen.getByTestId('delete-task')

    await user.click(deleteButton)

    // Verify confirmation dialog was shown with correct options
    expect(mockConfirm).toHaveBeenCalledWith({
      title: 'Delete Task',
      description: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    })

    // Verify delete was called
    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id)
  })

  it('does not delete task when confirmation is cancelled', async () => {
    mockConfirm.mockResolvedValueOnce(false) // User cancels deletion

    render(<TaskCard task={mockTask} provided={mockProvided} isDragging={false} />)

    const user = userEvent.setup()
    const deleteButton = screen.getByTestId('delete-task')

    await user.click(deleteButton)

    // Verify confirmation was shown
    expect(mockConfirm).toHaveBeenCalled()
    // Verify delete was not called
    expect(mockDeleteTask).not.toHaveBeenCalled()
  })
})
