import { client } from './client'
export const getMapTrees = () => client.get('/map/trees').then(r => r.data)
export const getMapZones = () => client.get('/map/zones').then(r => r.data)
