import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskDialog } from './task-dialog'
import { Button } from '../ui/button'
import { DialogTrigger } from '../ui/dialog'

describe('TaskDialog', () => {
  const mockOnSubmit = vi.fn(() => Promise.resolve())

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  describe('Create Mode', () => {
    it('should render create dialog with proper title and description', async () => {
      render(
        <TaskDialog mode="create" onSubmit={mockOnSubmit}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Create new task')).toBeDefined()
      expect(screen.getByText(/Describe your task in detail/)).toBeDefined()
    })

    it('should handle task creation', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task Description',
      }

      render(
        <TaskDialog mode="create" onSubmit={mockOnSubmit}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      // Fill the form
      await user.type(screen.getByTestId('title-input'), newTask.title)
      await user.type(screen.getByTestId('description-input'), newTask.description)

      // Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith(newTask)
      await waitFor(() => {
        expect(screen.queryByText('Create new task')).toBeNull()
      })
    })
  })

  describe('Edit Mode', () => {
    const existingTask = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
    }

    it('should render edit dialog with proper title and description', async () => {
      render(
        <TaskDialog mode="edit" onSubmit={mockOnSubmit} initialValues={existingTask}>
          <DialogTrigger asChild>
            <Button>Edit Task</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Edit task')).toBeDefined()
      expect(screen.getByText(/Update your task details/)).toBeDefined()
    })

    it('should pre-fill form with existing task data', async () => {
      render(
        <TaskDialog mode="edit" onSubmit={mockOnSubmit} initialValues={existingTask}>
          <DialogTrigger asChild>
            <Button>Edit Task</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      expect((screen.getByTestId('title-input') as HTMLInputElement).value).toBe(existingTask.title)
      expect((screen.getByTestId('description-input') as HTMLInputElement).value).toBe(
        existingTask.description
      )
    })

    it('should handle task update', async () => {
      const updatedTask = {
        ...existingTask,
        title: 'Updated Task',
        description: 'Updated Description',
      }

      render(
        <TaskDialog mode="edit" onSubmit={mockOnSubmit} initialValues={existingTask}>
          <DialogTrigger asChild>
            <Button>Edit Task</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      // Update form fields
      const titleInput = screen.getByTestId('title-input')
      const descriptionInput = screen.getByTestId('description-input')

      await user.clear(titleInput)
      await user.clear(descriptionInput)
      await user.type(titleInput, updatedTask.title)
      await user.type(descriptionInput, updatedTask.description)

      // Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...existingTask,
        title: updatedTask.title,
        description: updatedTask.description,
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle submission errors', async () => {
      const mockError = new Error('Update failed')
      const mockOnSubmitWithError = vi.fn(() => Promise.reject(mockError))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <TaskDialog mode="create" onSubmit={mockOnSubmitWithError}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </TaskDialog>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button'))

      // Fill and submit form
      await user.type(screen.getByTestId('title-input'), 'Test Task')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error'), mockError)

      // Dialog should remain open after error
      expect(screen.getByText('Create new task')).toBeDefined()

      consoleErrorSpy.mockRestore()
    })
  })
})
