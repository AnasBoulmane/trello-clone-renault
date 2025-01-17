'use client'

import dynamic from 'next/dynamic'

export const TaskDialogLoader = dynamic(
  () => import('@/components/tasks/task-dialog').then((mod) => mod.TaskDialog),
  {
    ssr: false,
  }
)
