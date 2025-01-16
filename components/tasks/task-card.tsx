import { GripVertical } from 'lucide-react'

import { Card, CardHeader, CardContent } from '../ui/card'
import { Task } from '@/types/task'

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="group cursor-move hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-4 flex flex-row gap-2">
        <div className="font-medium flex-1">{task.title}</div>
        <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      {task.description && (
        <CardContent className="p-4 pt-0 text-sm text-gray-600">{task.description}</CardContent>
      )}
    </Card>
  )
}
