import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'

export function TaskBoardSkeleton() {
  const renderColumn = (columnId: string, title: string) => (
    <div
      className={cn(
        'flex flex-col rounded-lg p-2 transition-colors duration-200 bg-gray-100',
        'w-full min-h-[calc(100vh-15rem)] md:min-h-[calc(100vh-13rem)] md:w-1/3'
      )}
      data-testid="task-column"
      data-column-id={columnId}
    >
      <h2 className="text-xl font-semibold p-2 mb-2">{title}</h2>
      <div className="flex-1 rounded-lg p-2 animate-pulse space-y-2 bg-gray-200">
        <Skeleton className="h-28" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button className="ml-auto px-3" disabled>
          <span className="hidden md:block">New Task</span>
          <Plus />
        </Button>
      </div>
      <div className="flex gap-8 flex-wrap">
        {renderColumn('todo', 'To Do')}
        {renderColumn('inProgress', 'In Progress')}
        {renderColumn('done', 'Done')}
      </div>
    </div>
  )
}
