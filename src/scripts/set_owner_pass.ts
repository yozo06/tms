import { db } from '../lib/supabase'
import { hashPassword } from '../lib/auth'

async function run() {
    try {
        const hash = await hashPassword('password123')
        await db.from('users').update({ password_hash: hash }).eq('email', 'yozo@email.com')
        console.log('Owner password reset to password123')
    } catch (e) {
        console.error(e)
    }
}
run()
