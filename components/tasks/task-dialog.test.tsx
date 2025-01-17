import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskDialog } from './task-dialog'

describe('TaskDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(() => Promise.resolve()),
    onCancel: vi.fn(),
    mode: 'create' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  describe('Create Mode', () => {
    it('should render create dialog with proper title and description', () => {
      render(<TaskDialog {...defaultProps} />)

      expect(screen.getByText('Create new task')).toBeDefined()
      expect(screen.getByText(/Describe your task in detail/)).toBeDefined()
    })

    it('should handle task creation and close dialog', async () => {
      const mockOnSubmit = vi.fn(() => Promise.resolve())
      const mockOnOpenChange = vi.fn()

      render(
        <TaskDialog {...defaultProps} onSubmit={mockOnSubmit} onOpenChange={mockOnOpenChange} />
      )

      const user = userEvent.setup()

      // Fill the form
      await user.type(screen.getByTestId('title-input'), 'New Task')
      await user.type(screen.getByTestId('description-input'), 'Description')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Description',
      })
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Edit Mode', () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo' as const,
    }

    const editProps = {
      ...defaultProps,
      mode: 'edit' as const,
      initialValues: mockTask,
    }

    it('should render edit dialog with proper title and description', () => {
      render(<TaskDialog {...editProps} />)

      expect(screen.getByText('Edit task')).toBeDefined()
      expect(screen.getByText(/Update your task details/)).toBeDefined()
    })

    it('should pre-fill form with existing task data', () => {
      render(<TaskDialog {...editProps} />)

      expect((screen.getByTestId('title-input') as HTMLInputElement).value).toBe(mockTask.title)
      expect((screen.getByTestId('description-input') as HTMLInputElement).value).toBe(
        mockTask.description
      )
    })

    it('should handle task update with initial values', async () => {
      const mockOnSubmit = vi.fn(() => Promise.resolve())

      render(<TaskDialog {...editProps} onSubmit={mockOnSubmit} />)

      const user = userEvent.setup()

      // Update form fields
      const titleInput = screen.getByTestId('title-input')
      const descriptionInput = screen.getByTestId('description-input')

      await user.clear(titleInput)
      await user.clear(descriptionInput)
      await user.type(titleInput, 'Updated Task')
      await user.type(descriptionInput, 'Updated Description')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...mockTask,
        title: 'Updated Task',
        description: 'Updated Description',
      })
    })
  })

  describe('Dialog Controls', () => {
    it('should call onCancel and close dialog when cancelled', async () => {
      const mockOnCancel = vi.fn()
      const mockOnOpenChange = vi.fn()

      render(
        <TaskDialog {...defaultProps} onCancel={mockOnCancel} onOpenChange={mockOnOpenChange} />
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should handle submission errors gracefully', async () => {
      const mockError = new Error('Submission failed')
      const mockOnSubmit = vi.fn(() => Promise.reject(mockError))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<TaskDialog {...defaultProps} onSubmit={mockOnSubmit} />)

      const user = userEvent.setup()
      await user.type(screen.getByTestId('title-input'), 'Test')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error'), mockError)

      consoleErrorSpy.mockRestore()
    })
  })
})
