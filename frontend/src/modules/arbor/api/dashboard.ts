import { client } from '../../../core/api/client'
export const getDashboardStats = () => client.get('/dashboard/stats').then((r: any) => r.data)
