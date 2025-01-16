import { Task } from '@/types/task'

const BASE_URL = process.env.NEXT_PUBLIC_TODO_API_BASE_URL!

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${BASE_URL}/users/1/todos`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export const addTask = async (newTask: Partial<Task>): Promise<Task | null> => {
  const response = await fetch(`${BASE_URL}/users/1/todos`, {
    method: 'POST',
    body: JSON.stringify({
      title: newTask.title,
      description: newTask.description,
      completed: false,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}
