import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TaskBoard } from './task-board'
import { fetchTasks, addTask } from '@/lib/api'

// Mock the API functions
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  addTask: vi.fn(),
}))

describe('TaskBoard Component', () => {
  // Let's set up some mock data that we'll use across our tests
  const mockTasks = [
    { id: '1', title: 'Task 1', description: 'Description 1' },
    { id: '2', title: 'Task 2', description: 'Description 2' },
  ]

  // Before each test, we'll reset our mocks to ensure clean test states
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up the default successful response for fetchTasks
    ;(fetchTasks as any).mockResolvedValue(mockTasks)
    cleanup()
  })

  // First, let's test the initial rendering and data fetching
  it('should fetch and display initial tasks in the todo column', async () => {
    render(<TaskBoard />)

    // Wait for the tasks to be loaded and displayed
    await waitFor(() => {
      // Check if both tasks are rendered
      mockTasks.forEach((task) => {
        expect(screen.getByText(task.title)).toBeDefined()
        expect(screen.getByText(`Task ${task.id} description`)).toBeDefined()
      })
    })

    // Verify that fetchTasks was called exactly once
    expect(fetchTasks).toHaveBeenCalledTimes(1)
  })

  // Let's test adding a new task
  it('should add a new task to the todo column', async () => {
    const newTask = {
      id: '3',
      title: 'Test Task 123',
      description: 'Test Description 123',
    }

    // Mock the addTask API call
    ;(addTask as any).mockResolvedValue(newTask)

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

    // Verify the new task is added to the todo column
    await waitFor(() => {
      expect(screen.getByText(newTask.title)).toBeDefined()
      expect(screen.getByText(newTask.description)).toBeDefined()
    })
  })

  // Test error handling during initial fetch
  it('should handle failed task fetching gracefully', async () => {
    // Mock the API to reject
    ;(fetchTasks as any).mockRejectedValue(new Error('Failed to fetch tasks'))

    render(<TaskBoard />)

    // Verify that the error doesn't break the component
    // The component should still render the column headers
    expect(screen.getByText('To Do')).toBeDefined()
    expect(screen.getByText('In Progress')).toBeDefined()
    expect(screen.getByText('Done')).toBeDefined()
  })

  // Test validation when adding a task
  it('should not add a task with empty title', async () => {
    render(<TaskBoard />)
    const user = userEvent.setup()

    // Open the new task dialog
    const newTaskButton = screen.getByRole('button', { name: /new task/i })
    await user.click(newTaskButton)

    // Try to submit without entering a title
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    // Verify that addTask was not called
    expect(addTask).not.toHaveBeenCalled()
  })

  // Test column rendering
  it('should render all three columns correctly', () => {
    render(<TaskBoard />)

    // Check for the presence of all three columns
    expect(screen.getByText('To Do')).toBeDefined()
    expect(screen.getByText('In Progress')).toBeDefined()
    expect(screen.getByText('Done')).toBeDefined()

    // Verify the columns have the correct structure
    const columns = screen.getAllByTestId('task-column')
    expect(columns).toHaveLength(3)
  })
})
