// task-form.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from './task-form'

describe('TaskForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('should render all form fields and buttons', () => {
    render(<TaskForm {...defaultProps} />)

    expect(screen.getByLabelText(/title/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })

  it('should handle form submission with valid data', async () => {
    render(<TaskForm {...defaultProps} />)

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await userEvent.type(titleInput, 'Test Task')
    await userEvent.type(descriptionInput, 'Test Description')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
    })
  })

  it('should handle cancellation', async () => {
    render(<TaskForm {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('should validate title minimum length', async () => {
    render(<TaskForm {...defaultProps} />)

    const titleInput = screen.getByLabelText(/title/i)
    await userEvent.type(titleInput, 'ab')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    expect(await screen.findByText(/title must be at least 3 characters/i)).toBeDefined()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should initialize with provided values', () => {
    const initialValues = {
      title: 'Initial Title',
      description: 'Initial Description',
    }

    render(<TaskForm {...defaultProps} initialValues={initialValues} />)

    // data attributes more reliable
    const titleInput = screen.getByTestId('title-input')
    const descriptionInput = screen.getByTestId('description-input')

    expect(titleInput instanceof HTMLInputElement).toBe(true)
    expect(descriptionInput instanceof HTMLElement).toBe(true)

    if (titleInput instanceof HTMLInputElement) {
      expect(titleInput.value).toBe(initialValues.title)
    }

    if (descriptionInput instanceof HTMLElement) {
      expect(descriptionInput.textContent).toBe(initialValues.description)
    }
  })
})
