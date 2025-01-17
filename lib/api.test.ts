// lib/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTasks, createTask, updateTask } from './api'

describe('API Functions', () => {
  const API_BASE_URL = 'http://api.example.com'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo', description: 'Description 1' },
        { id: 2, title: 'Task 2', status: 'inProgress', description: 'Description 2' },
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      })

      const tasks = await fetchTasks()

      expect(tasks).toEqual(mockTasks)
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users/1/todos`)
    })

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      await expect(fetchTasks()).rejects.toThrow('Network error')
    })

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      await expect(fetchTasks()).rejects.toThrow('HTTP error! status: 404')
    })
  })

  describe('createTask', () => {
    it('should create task with correct defaults', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Description',
      }

      const serverResponse = {
        ...newTask,
        id: 1,
        status: 'todo',
        completed: false,
        userId: 1,
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      })

      const result = await createTask(newTask)

      expect(result).toEqual(serverResponse)
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/todos`, {
        method: 'POST',
        body: JSON.stringify({
          ...newTask,
          completed: false,
          status: 'todo',
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
    })
  })

  describe('updateTask', () => {
    it('should update task with status change', async () => {
      const task = {
        id: 1,
        title: 'Task',
        description: 'Description',
        status: 'inProgress' as const,
        completed: false,
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(task),
      })

      const result = await updateTask(task)

      expect(result).toEqual(task)
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/todos/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          status: task.status,
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
    })

    it('should handle invalid task id', async () => {
      const invalidUpdate = {
        id: 999,
        title: 'Invalid Task',
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(updateTask(invalidUpdate)).rejects.toThrow('HTTP error! status: 404')
    })
  })
})
