import type { Resource, ResourceInput, ResourceWithDistance, ResourceCategory } from '../types/resource'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail ?? detail
    } catch {
      // response wasn't JSON — keep statusText
    }
    throw new ApiError(typeof detail === 'string' ? detail : JSON.stringify(detail), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export interface ListResourcesParams {
  search?: string
  category?: ResourceCategory | ''
}

export function listResources(params: ListResourcesParams = {}): Promise<Resource[]> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  const qs = query.toString()
  return request<Resource[]>(`/api/resources${qs ? `?${qs}` : ''}`)
}

export function getNearbyResources(
  latitude: number,
  longitude: number,
  radiusKm: number,
  category?: ResourceCategory | '',
): Promise<ResourceWithDistance[]> {
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius_km: String(radiusKm),
  })
  if (category) query.set('category', category)
  return request<ResourceWithDistance[]>(`/api/resources/nearby?${query.toString()}`)
}

export function createResource(resource: ResourceInput, token: string): Promise<Resource> {
  return request<Resource>('/api/resources', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(resource),
  })
}

export function updateResource(
  id: string,
  resource: Partial<ResourceInput> & { verification_status?: string },
  token: string,
): Promise<Resource> {
  return request<Resource>(`/api/resources/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(resource),
  })
}

export function deleteResource(id: string, token: string): Promise<void> {
  return request<void>(`/api/resources/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function login(username: string, password: string): Promise<{ access_token: string }> {
  return request<{ access_token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}
