import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationDialog } from './confirmation-dialog'

describe('ConfirmationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirmation Title',
    description: 'Confirmation Description',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders dialog content correctly', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    expect(screen.getByText(defaultProps.title)).toBeDefined()
    expect(screen.getByText(defaultProps.description)).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
    expect(screen.getByText('Confirm')).toBeDefined()
  })

  it('handles confirmation correctly', async () => {
    const onConfirm = vi.fn().mockResolvedValueOnce(undefined)

    render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Confirm'))

    expect(onConfirm).toHaveBeenCalled()
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles cancellation correctly', async () => {
    render(<ConfirmationDialog {...defaultProps} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Cancel'))

    expect(defaultProps.onCancel).toHaveBeenCalled()
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables buttons during async confirmation', async () => {
    const onConfirm = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
    )

    render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

    const user = userEvent.setup()
    const confirmButton = screen.getByText('Confirm') as HTMLButtonElement
    const cancelButton = screen.getByText('Cancel') as HTMLButtonElement

    await user.click(confirmButton)

    // Buttons should be disabled during confirmation
    expect(confirmButton.disabled).toBe(true)
    expect(cancelButton.disabled).toBe(true)

    // Wait for confirmation to complete
    await waitFor(() => {
      expect(confirmButton.disabled).toBe(false)
      expect(cancelButton.disabled).toBe(false)
    })
  })

  it('handles confirmation errors gracefully', async () => {
    const error = new Error('Confirmation failed')
    const onConfirm = vi.fn().mockRejectedValueOnce(error)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Confirm'))

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during confirmation:', error)

    // Dialog should remain open on error
    expect(screen.getByText(defaultProps.title)).toBeDefined()

    // Cleanup
    consoleErrorSpy.mockRestore()
  })

  it('customizes button text correctly', () => {
    render(<ConfirmationDialog {...defaultProps} confirmText="Yes, Delete" cancelText="No, Keep" />)

    expect(screen.getByText('Yes, Delete')).toBeDefined()
    expect(screen.getByText('No, Keep')).toBeDefined()
  })

  it('applies destructive variant styling', () => {
    render(<ConfirmationDialog {...defaultProps} variant="destructive" />)

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton.classList).toContain('bg-destructive')
  })
})
