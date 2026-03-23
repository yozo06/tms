import { client } from './client'

export interface Tree {
  id: number; tree_code: string; custom_common_name?: string
  health_score?: number; action: string; status: string
  priority: string; coord_x?: number; coord_y?: number
  species?: { common_name: string; scientific_name: string; ecosystem_roles: string[] }
  land_zones?: { zone_code: string; zone_name: string }
  assigned_user?: { name: string }
  approx_age_yrs?: number; height_m?: number; trunk_diameter_cm?: number
  action_notes?: string; public_notes?: string; decision_factors?: Record<string, any>
  planting_date?: string; completed_at?: string; updated_at: string
  assigned_to?: number
}

export const getPublicTree = (code: string) => client.get(`/trees/${code}/public`).then((r: any) => r.data)
export const getTrees = (params?: Record<string, any>) => client.get('/trees', { params }).then((r: any) => r.data)
export const getTree = (code: string) => client.get(`/trees/${code}`).then((r: any) => r.data)
export const createTree = (data: any) => client.post('/trees', data).then((r: any) => r.data)
export const updateTree = (code: string, data: any) => client.patch(`/trees/${code}`, data).then((r: any) => r.data)
export const deleteTree = (code: string) => client.delete(`/trees/${code}`).then((r: any) => r.data)
export const getActivity = (code: string) => client.get(`/trees/${code}/activity`).then((r: any) => r.data)
export const addActivity = (code: string, action_taken: string, notes?: string) =>
  client.post(`/trees/${code}/activity`, { action_taken, notes }).then((r: any) => r.data)
export const getHealth = (code: string) => client.get(`/trees/${code}/health`).then((r: any) => r.data)
export const addHealth = (code: string, data: any) => client.post(`/trees/${code}/health`, data).then((r: any) => r.data)
export const getPhotos = (code: string) => client.get(`/trees/${code}/photos`).then((r: any) => r.data)
export const uploadPhoto = (code: string, file: File, type: string, caption?: string) => {
  const fd = new FormData()
  fd.append('photo', file); fd.append('photo_type', type)
  if (caption) fd.append('caption', caption)
  return client.post(`/trees/${code}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r: any) => r.data)
}
export const getContributors = (code: string) => client.get(`/trees/${code}/contributors`).then((r: any) => r.data)
export const addContributor = (code: string, data: any) => client.post(`/trees/${code}/contributors`, data).then((r: any) => r.data)
