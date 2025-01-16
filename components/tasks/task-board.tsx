'use client'

import { useEffect, useState } from 'react'

import { TaskToolbar } from './task-toolbar'
import { addTask, fetchTasks } from '@/lib/api'
import { Columns, Task } from '@/types/task'
import { TaskColumn } from './task-column'

/**
 * TaskBoard Component: the entry point for the task board exercise.
 * it centralizes the state and logic for the moment. but we my consider
 * using a state management library like redux or zustand for better state management.
 **/
export function TaskBoard() {
  const [columns, setColumns] = useState<Columns>({
    todo: [],
    inProgress: [],
    done: [],
  })

  useEffect(() => {
    // Todo add loading state and probably using react-query for better data fetching
    fetchTasks()
      .then((data) => {
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          // this because the API doesn't return the description field for todos
          description: `Task ${task.id} description`,
        }))

        setColumns((prev: Columns) => ({
          ...prev,
          todo: formattedTasks,
        }))
      })
      .catch(console.error) // todo: show error message
  }, [])

  const handleAddTask = async (newTask: Partial<Task>) => {
    if (!newTask.title?.trim()) return // todo: show error message
    const data = await addTask(newTask).catch(console.error) // todo: show error message

    if (!data) return // todo: show error message

    setColumns((prev) => ({
      ...prev,
      todo: [
        {
          id: data.id,
          title: data.title,
          description: data.description,
        },
        ...prev.todo,
      ],
    }))
  }

  return (
    <div className="space-y-6">
      <TaskToolbar onTaskCreate={handleAddTask} />

      <div className="flex gap-8">
        <TaskColumn title="To Do" columnId="todo" tasks={columns.todo} />
        <TaskColumn title="In Progress" columnId="inProgress" tasks={columns.inProgress} />
        <TaskColumn title="Done" columnId="done" tasks={columns.done} />
      </div>
    </div>
  )
}
