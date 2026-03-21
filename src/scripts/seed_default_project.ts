import { db } from '../lib/supabase'

async function run() {
    console.log('Fetching users...')
    const { data: users, error: uErr } = await db.from('users').select('*')
    if (uErr) return console.error('Error fetching users:', uErr)

    const owner = users.find(u => u.role === 'owner')
    if (!owner) return console.error('No owner found in users table.')

    console.log('Creating default project "WildArc Coorg"...')
    const { data: project, error: pErr } = await db.from('projects').insert({
        name: 'WildArc Coorg',
        description: 'The premier regenerative permaculture farm model.',
        owner_id: owner.id
    }).select().single()

    if (pErr) return console.error('Error creating project:', pErr)
    console.log(`Created project: ${project.id}`)

    console.log('Assigning members to project...')
    for (const user of users) {
        let projRole = 'viewer'
        if (user.role === 'owner') projRole = 'admin'
        else if (user.role === 'employee') projRole = 'editor'
        else if (user.role === 'volunteer') projRole = 'contributor'

        await db.from('project_members').insert({
            project_id: project.id,
            user_id: user.id,
            role: projRole
        })
    }

    console.log('Updating trees with project_id...')
    const { error: tErr } = await db.from('trees').update({ project_id: project.id }).is('project_id', null)
    if (tErr) console.error('Error updating trees:', tErr)

    console.log('Updating land_zones with project_id...')
    const { error: zErr } = await db.from('land_zones').update({ project_id: project.id }).is('project_id', null)
    if (zErr) console.error('Error updating land_zones:', zErr)

    console.log('Database Seeding Complete!')
}

run()
