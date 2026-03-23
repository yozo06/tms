import { client } from './client'
export const login = (email: string, password: string) =>
  client.post('/auth/login', { email, password }).then((r: any) => r.data)
export const changePassword = (currentPassword: string, newPassword: string) =>
  client.post('/auth/change-password', { currentPassword, newPassword }).then((r: any) => r.data)
export const getMe = () => client.get('/users/me').then((r: any) => r.data)
