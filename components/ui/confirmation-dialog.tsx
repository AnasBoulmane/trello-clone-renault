import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type ConfirmationDialogProps = {
  // Dialog state
  open: boolean
  onOpenChange: (open: boolean) => void

  // Dialog content
  title: string
  description?: string

  // Customization
  cancelText?: string
  confirmText?: string
  variant?: 'default' | 'destructive'

  // Events
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  // Track loading state during async operations
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle the confirmation action
  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error during confirmation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle the cancel action
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
