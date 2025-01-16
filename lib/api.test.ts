// lib/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTasks, addTask } from './api'

describe('API Functions', () => {
  const API_BASE_URL = 'http://api.example.com'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ]

      // Setup mock response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      })

      const tasks = await fetchTasks()

      // Verify the response
      expect(tasks).toEqual(mockTasks)

      // Verify the correct URL was called
      const expectedUrl = `${API_BASE_URL}/users/1/todos`
      expect(fetch).toHaveBeenCalledWith(expectedUrl)
    })

    it('should handle fetch error', async () => {
      // Mock error response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(fetchTasks()).rejects.toThrow('HTTP error! status: 404')
    })
  })

  describe('addTask', () => {
    it('should add task successfully', async () => {
      const newTask = { title: 'New Task', description: 'Description' }
      const returnedTask = { ...newTask, id: '3', completed: false }

      // Setup mock response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(returnedTask),
      })

      const task = await addTask(newTask)

      // Verify the response
      expect(task).toEqual(returnedTask)

      // Verify the request was made correctly
      const expectedUrl = `${API_BASE_URL}/users/1/todos`
      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
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
    })

    it('should handle add task error', async () => {
      const newTask = { title: 'New Task', description: 'Description' }

      // Mock error response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(addTask(newTask)).rejects.toThrow('HTTP error! status: 500')
    })
  })
})
