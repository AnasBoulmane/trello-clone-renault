'use client'

import { useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'

import { TaskToolbar } from './task-toolbar'
import { TaskColumn } from './task-column'
import { useTaskContext } from '@/contexts/task-context'

/**
 * TaskBoard Component: the entry point for the task board exercise.
 * it centralizes the state and logic for the moment. but we my consider
 * using a state management library like redux or zustand for better state management.
 **/
export function TaskBoard() {
  const { columns, fetchInitialTasks, handleDragEnd, addTask } = useTaskContext()

  useEffect(() => {
    // Todo add loading state and probably using react-query for better data fetching
    fetchInitialTasks()
  }, [])

  return (
    <div className="space-y-6">
      <TaskToolbar onTaskCreate={addTask} />
      <div className="flex gap-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <TaskColumn title="To Do" columnId="todo" tasks={columns.todo} />
          <TaskColumn title="In Progress" columnId="inProgress" tasks={columns.inProgress} />
          <TaskColumn title="Done" columnId="done" tasks={columns.done} />
        </DragDropContext>
      </div>
    </div>
  )
}
