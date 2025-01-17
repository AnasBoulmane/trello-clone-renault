'use client'

import dynamic from 'next/dynamic'
import { TaskBoardSkeleton } from './task-board-skeleton'

export const TaskBoardLoader = dynamic(
  () => import('@/components/tasks/task-board').then((mod) => mod.TaskBoard),
  {
    loading: () => <TaskBoardSkeleton />,
    ssr: true,
  }
)
