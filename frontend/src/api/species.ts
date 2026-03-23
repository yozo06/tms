import { client } from './client'
export const getSpecies = () => client.get('/species').then((r: any) => r.data)
export const getEcosystemRoles = () => client.get('/species/roles').then((r: any) => r.data)
export const createSpecies = (data: any) => client.post('/species', data).then((r: any) => r.data)
export const getZones = () => client.get('/zones').then((r: any) => r.data)
export const createZone = (data: any) => client.post('/zones', data).then((r: any) => r.data)
