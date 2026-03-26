import { client } from '../../../core/api/client'
export const getMapTrees = () => client.get('/map/trees').then((r: any) => r.data)
export const getMapZones = () => client.get('/map/zones').then((r: any) => r.data)
