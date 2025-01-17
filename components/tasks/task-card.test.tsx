import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './task-card'
import { useTaskContext } from '@/contexts/task-context'

// Mock the context
vi.mock('@/contexts/task-context', () => ({
  useTaskContext: vi.fn(),
}))

describe('TaskCard Component', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo' as const,
  }

  const mockProvided = {
    innerRef: () => {},
    draggableProps: {
      'data-rbd-draggable-context-id': '1',
      'data-rbd-draggable-id': '1',
    },
    dragHandleProps: {
      'data-rbd-drag-handle-draggable-id': '1',
      'data-rbd-drag-handle-context-id': '1',
    },
  }

  beforeEach(() => {
    cleanup()
    ;(useTaskContext as any).mockReturnValue({
      updateTask: vi.fn(),
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
})
