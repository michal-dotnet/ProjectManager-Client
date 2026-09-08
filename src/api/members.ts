import { apiClient } from './client'
import type { AddEventMemberPayload, EventMemberDto, PagedResult } from '../types/api'

export async function fetchMembers(eventId: number, pageNumber = 1, pageSize = 100) {
  const { data } = await apiClient.get<PagedResult<EventMemberDto>>(`/events/${eventId}/members`, {
    params: { pageNumber, pageSize },
  })
  return data
}

export async function addMember(eventId: number, payload: AddEventMemberPayload) {
  const { data } = await apiClient.post<EventMemberDto>(`/events/${eventId}/members`, payload)
  return data
}

export async function removeMember(eventId: number, userId: number) {
  await apiClient.delete(`/events/${eventId}/members/${userId}`)
}
