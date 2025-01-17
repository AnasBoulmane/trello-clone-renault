import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskToolbar } from './task-toolbar'

describe('TaskToolbar Component', () => {
  // Setup mock function for onTaskCreate prop
  const mockOnTaskCreate = vi.fn(() => Promise.resolve())

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  // Test 1: Basic rendering
  it('renders the New Task button correctly', () => {
    render(<TaskToolbar onTaskCreate={mockOnTaskCreate} />)

    // Check if the button exists and has correct text and icon
    const button = screen.getByRole('button', { name: /new task/i })
    expect(button).toBeDefined()
    expect(button.querySelector('svg')).toBeDefined() // Check for Plus icon
  })

  // Test 2: Opening the dialog
  it('opens dialog when New Task button is clicked', async () => {
    render(<TaskToolbar onTaskCreate={mockOnTaskCreate} />)
    const user = userEvent.setup()

    // Click the New Task button
    const button = screen.getByRole('button', { name: /new task/i })
    await user.click(button)

    // Verify dialog content is visible
    expect(screen.getByText('Create new task')).toBeDefined()
    expect(screen.getByText(/describe your task in detail./i)).toBeDefined()
    // Check if form fields are rendered
    expect(screen.getByTestId('title-input')).toBeDefined()
    expect(screen.getByTestId('description-input')).toBeDefined()
  })

  // Test 3: Successful task creation
  it('creates a new task and closes dialog on successful submission', async () => {
    render(<TaskToolbar onTaskCreate={mockOnTaskCreate} />)
    const user = userEvent.setup()

    // Open dialog
    await user.click(screen.getByRole('button', { name: /new task/i }))

    // Fill out the form
    await user.type(screen.getByTestId('title-input'), 'New Test Task')
    await user.type(screen.getByTestId('description-input'), 'Test Description')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Verify task creation was called with correct data
    await waitFor(() => {
      expect(mockOnTaskCreate).toHaveBeenCalledWith({
        title: 'New Test Task',
        description: 'Test Description',
      })
    })

    // Verify dialog is closed
    await waitFor(() => {
      expect(screen.queryByText('Create new task')).toBeNull()
    })
  })

  // Test 4: Canceling task creation
  it('closes dialog without creating task when cancelled', async () => {
    render(<TaskToolbar onTaskCreate={mockOnTaskCreate} />)
    const user = userEvent.setup()

    // Open dialog
    await user.click(screen.getByRole('button', { name: /new task/i }))

    // Fill out the form (to verify data isn't submitted)
    await user.type(screen.getByTestId('title-input'), 'Test Task')

    // Click cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    // Verify onTaskCreate was not called
    expect(mockOnTaskCreate).not.toHaveBeenCalled()

    // Verify dialog is closed
    expect(screen.queryByText('Create new task')).toBeNull()
  })

  // Test 5: Dialog state management
  it('manages dialog open state correctly', async () => {
    render(<TaskToolbar onTaskCreate={mockOnTaskCreate} />)
    const user = userEvent.setup()

    // Initially dialog should be closed
    expect(screen.queryByText('Create new task')).toBeNull()

    // Open dialog
    await user.click(screen.getByRole('button', { name: /new task/i }))
    expect(screen.getByText('Create new task')).toBeDefined()

    // Close dialog using ESC key
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Create new task')).toBeNull()
    })
  })

  // Test 6: Error handling
  it('handles task creation errors gracefully', async () => {
    // Mock onTaskCreate to reject
    const mockErrorOnTaskCreate = vi.fn(() => Promise.reject(new Error('Creation failed')))
    render(<TaskToolbar onTaskCreate={mockErrorOnTaskCreate} />)
    const user = userEvent.setup()

    // Open dialog and submit form
    await user.click(screen.getByRole('button', { name: /new task/i }))
    await user.type(screen.getByTestId('title-input'), 'Test Task')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Verify error handling
    await waitFor(() => {
      expect(mockErrorOnTaskCreate).toHaveBeenCalled()
      // Dialog should remain open on error
      expect(screen.getByText('Create new task')).toBeDefined()
    })
  })
})
