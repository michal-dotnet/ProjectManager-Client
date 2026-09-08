import { apiClient } from './client'
import type { CreateTaskPayload, PagedResult, TaskDto, UpdateTaskPayload } from '../types/api'

export async function fetchTasks(eventId: number, pageNumber = 1, pageSize = 100) {
  const { data } = await apiClient.get<PagedResult<TaskDto>>(`/events/${eventId}/tasks`, {
    params: { pageNumber, pageSize },
  })
  return data
}

export async function createTask(eventId: number, payload: CreateTaskPayload) {
  const { data } = await apiClient.post<TaskDto>(`/events/${eventId}/tasks`, payload)
  return data
}

export async function updateTask(eventId: number, taskId: number, payload: UpdateTaskPayload) {
  const { data } = await apiClient.put<TaskDto>(`/events/${eventId}/tasks/${taskId}`, payload)
  return data
}

export async function takeTask(eventId: number, taskId: number) {
  const { data } = await apiClient.post<TaskDto>(`/events/${eventId}/tasks/${taskId}/assignment`)
  return data
}
