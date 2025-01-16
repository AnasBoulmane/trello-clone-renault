import { Task } from '@/types/task'
import { TaskCard } from './task-card'

type TaskColumnProps = {
  title: string
  columnId: string
  tasks: Task[]
}

export function TaskColumn({ columnId, title, tasks }: TaskColumnProps) {
  return (
    <div
      className="w-1/3 rounded-lg p-4 transition-colors duration-200 bg-gray-100"
      data-testid="task-column"
      data-column-id={columnId}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
