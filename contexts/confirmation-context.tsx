'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ConfirmationDialogLoader } from '@/components/ui/confirmation-dialog-loader'

type ConfirmationOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

type ConfirmationState = ConfirmationOptions & {
  isOpen: boolean
  resolve?: (value: boolean) => void
}

type ConfirmationContextType = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

const defaultState: ConfirmationState = {
  isOpen: false,
  title: '',
}

/**
 * ConfirmationProvider: Manages the global confirmation dialog state and renders
 * the dialog component. This ensures the dialog is always available in the app
 * while maintaining its state properly.
 */
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmationState>(defaultState)

  // Shows the confirmation dialog and returns a promise that resolves
  // when the user either confirms or cancels
  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  // Handles dialog open state changes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setState((current) => ({
        ...current,
        isOpen,
      }))

      if (!isOpen && state.resolve) {
        state.resolve(false)
      }
    },
    [state.resolve]
  )

  // Handles the confirmation action
  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState(defaultState)
  }, [state.resolve])

  // Handles the cancel action
  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState(defaultState)
  }, [state.resolve])

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialogLoader
        open={state.isOpen}
        onOpenChange={handleOpenChange}
        title={state.title}
        description={state.description}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  )
}

/**
 * useConfirmation: A hook that provides access to the confirmation dialog.
 * This hook must be used within a ConfirmationProvider.
 */
export function useConfirmation() {
  const context = useContext(ConfirmationContext)

  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }

  return context
}
