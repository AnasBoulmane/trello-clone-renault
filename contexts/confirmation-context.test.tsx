//contexts/confirmation-context.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, renderHook, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationProvider, useConfirmation } from './confirmation-context'

describe('ConfirmationContext', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    cleanup()
  })

  // Helper to wrap components with the provider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfirmationProvider>{children}</ConfirmationProvider>
  )

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test as we expect an error
    const consoleSpy = vi.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    expect(() => {
      renderHook(() => useConfirmation())
    }).toThrow('useConfirmation must be used within a ConfirmationProvider')

    consoleSpy.mockRestore()
  })

  it('should provide confirm function', () => {
    const { result } = renderHook(() => useConfirmation(), { wrapper })
    expect(typeof result.current.confirm).toBe('function')
  })

  it('should show dialog when confirm is called', async () => {
    const TestComponent = () => {
      const { confirm } = useConfirmation()

      return <button onClick={() => confirm({ title: 'Test Title' })}>Show Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    const button = screen.getByText('Show Dialog')
    await userEvent.click(button)
    // Wait for the dialog and its content
    await waitFor(async () => {
      // Dialog should be visible with the provided title
      expect(screen.getByText('Test Title')).toBeDefined()
    })
  })

  it('should resolve true when confirmed', async () => {
    // Create a component that will store the confirmation result
    let confirmationResult: boolean | undefined

    const TestComponent = () => {
      const { confirm } = useConfirmation()

      const handleClick = async () => {
        confirmationResult = await confirm({
          title: 'Confirm Test',
          description: 'Please confirm',
        })
      }

      return <button onClick={handleClick}>Show Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    // Show the dialog
    const button = screen.getByText('Show Dialog')
    await userEvent.click(button)
    await waitFor(async () => {
      // Click the confirm button
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await userEvent.click(confirmButton)

      // Verify the promise resolved to true
      expect(confirmationResult).toBe(true)

      // Dialog should be closed
      expect(screen.queryByText('Confirm Test')).toBeNull()
    })
  })

  it('should resolve false when cancelled', async () => {
    let confirmationResult: boolean | undefined

    const TestComponent = () => {
      const { confirm } = useConfirmation()

      const handleClick = async () => {
        confirmationResult = await confirm({
          title: 'Cancel Test',
          description: 'Please cancel',
        })
      }

      return <button onClick={handleClick}>Show Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    // Show the dialog
    const button = screen.getByText('Show Dialog')
    await userEvent.click(button)
    await waitFor(async () => {
      // Click the cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      // Verify the promise resolved to false
      expect(confirmationResult).toBe(false)

      // Dialog should be closed
      expect(screen.queryByText('Cancel Test')).toBeNull()
    })
  })

  it('should resolve false when dialog is dismissed', async () => {
    let confirmationResult: boolean | undefined

    const TestComponent = () => {
      const { confirm } = useConfirmation()

      const handleClick = async () => {
        confirmationResult = await confirm({
          title: 'Dismiss Test',
        })
      }

      return <button onClick={handleClick}>Show Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    // Show the dialog
    const button = screen.getByText('Show Dialog')
    await userEvent.click(button)
    await waitFor(async () => {
      // Find and click the close button (usually an X in the corner)
      const closeButton = screen.getByRole('button', { name: /close/i })
      await userEvent.click(closeButton)

      // Verify the promise resolved to false
      expect(confirmationResult).toBe(false)

      // Dialog should be closed
      expect(screen.queryByText('Dismiss Test')).toBeNull()
    })
  })

  it('should render dialog with custom options', async () => {
    const TestComponent = () => {
      const { confirm } = useConfirmation()

      const handleClick = () => {
        confirm({
          title: 'Custom Title',
          description: 'Custom Description',
          confirmText: 'Yes, proceed',
          cancelText: 'No, go back',
          variant: 'destructive',
        })
      }

      return <button onClick={handleClick}>Show Dialog</button>
    }

    render(<TestComponent />, { wrapper })

    // Show the dialog
    const button = screen.getByText('Show Dialog')
    await userEvent.click(button)
    // Wait for the dialog and its content
    await waitFor(async () => {
      // Verify all custom options are rendered
      expect(screen.getByText('Custom Title')).toBeDefined()
      expect(screen.getByText('Custom Description')).toBeDefined()
      expect(screen.getByText('Yes, proceed')).toBeDefined()
      expect(screen.getByText('No, go back')).toBeDefined()
    })
  })
})
