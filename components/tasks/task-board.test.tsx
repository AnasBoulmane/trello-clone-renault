// components/tasks/task-board.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TaskBoard } from './task-board'
import { useTaskContext } from '@/contexts/task-context'

// Mock the context
vi.mock('@/contexts/task-context', () => ({
  useTaskContext: vi.fn(),
}))

// integration test with the TaskContext
describe('TaskBoard Component', () => {
  beforeEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

  it('should render columns and tasks from context', () => {
    // Mock the context values
    const mockContextValue = {
      columns: {
        todo: [{ id: '1', title: 'Task 1', description: 'Description 1' }],
        inProgress: [],
        done: [],
      },
      fetchInitialTasks: vi.fn(),
      addTask: vi.fn(),
      handleDragEnd: vi.fn(),
    }

    ;(useTaskContext as any).mockReturnValue(mockContextValue)

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
    ;(useTaskContext as any).mockReturnValue({
      columns: { todo: [], inProgress: [], done: [] },
      fetchInitialTasks,
      addTask: vi.fn(),
      handleDragEnd: vi.fn(),
    })

    render(<TaskBoard />)

    expect(fetchInitialTasks).toHaveBeenCalled()
  })

  // Let's test adding a new task
  it('should add a new task to the todo column', async () => {
    const newTask = {
      id: '3',
      title: 'Test Task 123',
      description: 'Test Description 123',
    }

    const addTask = vi.fn()
    ;(useTaskContext as any).mockReturnValue({
      columns: { todo: [], inProgress: [], done: [] },
      fetchInitialTasks: vi.fn(),
      addTask,
      handleDragEnd: vi.fn(),
    })

    render(<TaskBoard />)

    const user = userEvent.setup()

    // Open the new task dialog
    const newTaskButton = screen.getByRole('button', { name: /new task/i })
    await user.click(newTaskButton)

    // Fill in the task form
    const titleInput = screen.getByTestId('title-input')
    const descriptionInput = screen.getByTestId('description-input')

    await user.type(titleInput, newTask.title)
    await user.type(descriptionInput, newTask.description)

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    // Verify the API was called correctly
    expect(addTask).toHaveBeenCalledWith({
      title: newTask.title,
      description: newTask.description,
    })
  })
})
