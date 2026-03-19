import { client } from './client'
export const getUsers = () => client.get('/users').then(r => r.data)
export const createUser = (data: any) => client.post('/users', data).then(r => r.data)
export const updateUser = (id: number, data: any) => client.patch(`/users/${id}`, data).then(r => r.data)
export const deactivateUser = (id: number) => client.delete(`/users/${id}`).then(r => r.data)
