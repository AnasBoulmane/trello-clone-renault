'use client'

import dynamic from 'next/dynamic'

export const ConfirmationDialogLoader = dynamic(
  () => import('@/components/ui/confirmation-dialog').then((mod) => mod.ConfirmationDialog),
  {
    ssr: false,
  }
)
