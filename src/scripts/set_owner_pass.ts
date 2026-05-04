import { db } from '../core/lib/supabase'
import { hashPassword } from '../core/lib/auth'

async function run() {
    try {
        const hash = await hashPassword('password123')

        // 1. Force create or update the user yozo@email.com
        let { data: user } = await db.from('users').select('id').eq('email', 'yozo@email.com').single()

        if (user) {
            await db.from('users').update({ password_hash: hash, role: 'owner', is_active: true }).eq('id', user.id)
        } else {
            const res = await db.from('users').insert({
                email: 'yozo@email.com',
                name: 'Yogesh',
                password_hash: hash,
                role: 'owner',
                is_active: true
            }).select('id').single()
            user = res.data
        }

        // 2. Tie yozo@email.com to the first project as an admin so the dashboard loads correctly
        const { data: project } = await db.from('projects').select('id').limit(1).single()
        if (user && project) {
            await db.from('project_members').upsert({ user_id: user.id, project_id: project.id, role: 'admin' })
        }

        console.log('ACCOUNT PROVISIONED: yozo@email.com | PASSWORD: password123')
        process.exit(0)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}
run()
