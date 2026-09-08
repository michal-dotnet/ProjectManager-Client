import { apiClient } from './client'
import type { AuthResponseDto, LoginPayload, RegisterPayload } from '../types/api'

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/register', payload)
  return data
}
