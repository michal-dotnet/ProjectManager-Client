export type UserRole = 'Worker' | 'Manager'
export type EventStatus = 'Draft' | 'Active' | 'Completed'
export type TaskStatusEnum = 'Available' | 'Assigned'

export interface UserDto {
  id: number
  name: string
  email: string
  isActive: boolean
  role: UserRole
  createdAt: string
}

export interface AuthResponseDto {
  token: string
  expiresAtUtc: string
  userId: number
  name: string
  email: string
  role: UserRole
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface EventDto {
  id: number
  name: string
  description?: string | null
  createdByUserId: number
  startDate?: string | null
  endDate?: string | null
  status: EventStatus
  createdAt: string
}

export interface CreateEventPayload {
  name: string
  description?: string
  startDate?: string | null
  endDate?: string | null
}

export type UpdateEventPayload = CreateEventPayload

export interface TaskDto {
  id: number
  eventId: number
  title: string
  description?: string | null
  status: TaskStatusEnum
  assignedToUserId?: number | null
  assignedToUserName?: string | null
  assignedAt?: string | null
  createdAt: string
  sortOrder?: number | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  sortOrder?: number
}

export type UpdateTaskPayload = CreateTaskPayload

export interface EventMemberDto {
  id: number
  eventId: number
  userId: number
  userName: string
  userEmail: string
  joinedAt: string
}

export interface AddEventMemberPayload {
  userId: number
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiProblemDetails {
  title?: string
  detail?: string
  status?: number
  [key: string]: unknown
}
