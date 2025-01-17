export type Task = {
  id: number
  title: string
  description: string
  completed?: boolean
  status?: keyof BoardColumns
}

export type BoardColumns = {
  todo: Task[]
  inProgress: Task[]
  done: Task[]
}
