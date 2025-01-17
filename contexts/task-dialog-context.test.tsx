import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskDialogProvider, useTaskDialog } from './task-dialog-context'

describe('TaskDialogContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  // Helper to wrap components with the provider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TaskDialogProvider>{children}</TaskDialogProvider>
  )

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test as we expect an error
    const consoleSpy = vi.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    expect(() => {
      renderHook(() => useTaskDialog())
    }).toThrow('useTaskDialog must be used within a TaskDialogProvider')

    consoleSpy.mockRestore()
  })

  it('should provide openDialog function', () => {
    const { result } = renderHook(() => useTaskDialog(), { wrapper })
    expect(typeof result.current.openDialog).toBe('function')
  })

  it('should show dialog with create mode', async () => {
    const TestComponent = () => {
      const { openDialog } = useTaskDialog()

      return <button onClick={() => openDialog({ mode: 'create' })}>Create Task</button>
    }

    render(<TestComponent />, { wrapper })

    const button = screen.getByText('Create Task')
    await userEvent.click(button)
    // Wait for the dialog and its content
    await waitFor(async () => {
      expect(screen.getByText('Create new task')).toBeDefined()
      expect(screen.getByText(/Describe your task in detail/)).toBeDefined()
    })
  })

  it('should show dialog with edit mode and initial values', async () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
    }

    const TestComponent = () => {
      const { openDialog } = useTaskDialog()

      return (
        <button
          onClick={() =>
            openDialog({
              mode: 'edit',
              initialValues: mockTask,
            })
          }
        >
          Edit Task
        </button>
      )
    }

    render(<TestComponent />, { wrapper })

    const button = screen.getByText('Edit Task')
    await userEvent.click(button)
    // Wait for the dialog and its content
    await waitFor(async () => {
      // Check dialog title and content
      expect(screen.getByText('Edit task')).toBeDefined()
      expect((screen.getByTestId('title-input') as HTMLInputElement).value).toBe(mockTask.title)
      expect((screen.getByTestId('description-input') as HTMLInputElement).value).toBe(
        mockTask.description
      )
    })
  })

  it('should resolve with task data when submitted', async () => {
    // We'll store the resolved value here
    let resolvedTask: any = null

    const TestComponent = () => {
      const { openDialog } = useTaskDialog()

      const handleClick = async () => {
        resolvedTask = await openDialog({ mode: 'create' })
      }

      return <button onClick={handleClick}>Open Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    const user = userEvent.setup()
    await user.click(screen.getByText('Open Dialog'))
    // Wait for the dialog and its content
    await waitFor(async () => {
      // Fill and submit the form
      await user.type(screen.getByTestId('title-input'), 'New Task')
      await user.type(screen.getByTestId('description-input'), 'New Description')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Verify the resolved data
      expect(resolvedTask).toEqual({
        title: 'New Task',
        description: 'New Description',
      })

      // Dialog should be closed
      expect(screen.queryByText('Create new task')).toBeNull()
    })
  })

  it('should resolve with undefined when cancelled', async () => {
    let resolvedTask: any = 'not undefined'

    const TestComponent = () => {
      const { openDialog } = useTaskDialog()

      const handleClick = async () => {
        resolvedTask = await openDialog({ mode: 'create' })
      }

      return <button onClick={handleClick}>Open Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    const user = userEvent.setup()
    await user.click(screen.getByText('Open Dialog'))
    // Wait for the dialog and its content
    await waitFor(async () => {
      // Click cancel button
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Verify resolution
      expect(resolvedTask).toBeUndefined()
      expect(screen.queryByText('Create new task')).toBeNull()
    })
  })

  it('should resolve with undefined when dialog is dismissed', async () => {
    let resolvedTask: any = 'not undefined'

    const TestComponent = () => {
      const { openDialog } = useTaskDialog()

      const handleClick = async () => {
        resolvedTask = await openDialog({ mode: 'create' })
      }

      return <button onClick={handleClick}>Open Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    const user = userEvent.setup()
    await user.click(screen.getByText('Open Dialog'))

    // Wait for the dialog and its content
    await waitFor(async () => {
      // Click the close button (X in the corner)
      await user.click(screen.getByRole('button', { name: /close/i }))

      expect(resolvedTask).toBeUndefined()
      expect(screen.queryByText('Create new task')).toBeNull()
    })
  })
})
