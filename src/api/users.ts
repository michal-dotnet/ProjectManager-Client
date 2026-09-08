import { apiClient } from './client'
import type { PagedResult, UserDto } from '../types/api'

export async function fetchUsers(pageNumber = 1, pageSize = 200) {
  const { data } = await apiClient.get<PagedResult<UserDto>>('/users', {
    params: { pageNumber, pageSize },
  })
  return data
}
