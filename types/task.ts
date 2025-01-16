export type Task = {
  id: string
  title: string
  description: string
  completed?: boolean
}

export type Columns = {
  todo: Task[]
  inProgress: Task[]
  done: Task[]
}
