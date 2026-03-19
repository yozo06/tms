import { Router } from 'express'
import multer from 'multer'
import { db } from '../lib/supabase'
import { uploadToDrive } from '../lib/drive'
import { authenticate, requireOwner } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import { treeCreateSchema, treeUpdateSchema, treeActivitySchema, treeHealthSchema, treeContributorSchema } from '../schemas'

const r = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// PUBLIC — no auth
r.get('/:code/public', async (req, res) => {
  const { data: tree, error } = await db
    .from('trees')
    .select(`
      tree_code, custom_common_name, custom_fun_fact, public_notes,
      approx_age_yrs, height_m, trunk_diameter_cm, status, planting_date,
      species:species_id (
        common_name, scientific_name, description, fun_fact,
        edible_parts, medicinal_uses, ecosystem_roles,
        water_needs, sunlight_needs, is_native, external_ref_url, reference_images
      ),
      land_zones:zone_id ( zone_name ),
      tree_contributors (
        role, since_date, is_public,
        users:user_id ( name, bio, profile_photo )
      )
    `)
    .eq('tree_code', req.params.code.toUpperCase())
    .single()

  if (error || !tree) return res.status(404).json({ error: 'Tree not found' })

  const contributors = (tree.tree_contributors as any[])
    .filter((c: any) => c.is_public)
    .map((c: any) => ({ role: c.role, since: c.since_date, person: c.users }))

  return res.json({
    code: tree.tree_code,
    name: (tree as any).custom_common_name || (tree.species as any)?.common_name,
    species: (tree.species as any)?.scientific_name,
    description: (tree.species as any)?.description,
    funFact: (tree as any).custom_fun_fact || (tree.species as any)?.fun_fact,
    publicNotes: (tree as any).public_notes,
    age: tree.approx_age_yrs,
    height: tree.height_m,
    status: tree.status,
    zone: (tree.land_zones as any)?.zone_name,
    ecosystemRoles: (tree.species as any)?.ecosystem_roles || [],
    edibleParts: (tree.species as any)?.edible_parts,
    referenceImages: (tree.species as any)?.reference_images || [],
    contributors,
    plantingDate: tree.planting_date
  })
})

// ALL ROUTES BELOW REQUIRE AUTH
r.use(authenticate)

r.get('/', async (req, res) => {
  const { zone, action, status, priority, assigned_to, search, page = '1', limit = '50' } = req.query
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

  let q = db.from('trees').select(`
    id, tree_code, custom_common_name, health_score, action, status, priority,
    coord_x, coord_y, updated_at,
    species:species_id ( common_name, scientific_name, ecosystem_roles ),
    land_zones:zone_id ( zone_code, zone_name ),
    assigned_user:assigned_to ( name )
  `, { count: 'exact' })

  if (zone) q = q.eq('zone_id', zone)
  if (action) q = q.eq('action', action)
  if (status) q = q.eq('status', status)
  if (priority) q = q.eq('priority', priority)
  if (assigned_to) q = q.eq('assigned_to', assigned_to)
  if (search) q = q.ilike('tree_code', `%${search}%`)
  if (req.user!.role === 'employee') q = q.eq('assigned_to', req.user!.userId)

  const { data, error, count } = await q.order('tree_code').range(offset, offset + parseInt(limit as string) - 1)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ trees: data, total: count, page: parseInt(page as string) })
})

r.get('/:code', async (req, res) => {
  const { data: tree, error } = await db
    .from('trees')
    .select(`
      *,
      species:species_id (*),
      land_zones:zone_id (*),
      assigned_user:assigned_to ( id, name, email ),
      added_user:added_by ( name ),
      tree_contributors (
        id, role, since_date, notes, is_public,
        users:user_id ( id, name, email, role )
      )
    `)
    .eq('tree_code', req.params.code.toUpperCase())
    .single()
  if (error || !tree) return res.status(404).json({ error: 'Tree not found' })
  return res.json(tree)
})

r.post('/', requireOwner, validate(treeCreateSchema), async (req, res) => {
  const { tree_code } = req.body
  if (!tree_code) return res.status(400).json({ error: 'tree_code is required' })
  const payload = { ...req.body, tree_code: tree_code.toUpperCase(), added_by: req.user!.userId }
  const { data, error } = await db.from('trees').insert(payload).select().single()
  if (error) return res.status(400).json({ error: error.message })
  await db.from('tree_activity_log').insert({
    tree_id: data.id, performed_by: req.user!.userId,
    action_taken: 'tree_created', new_status: 'pending',
    notes: `Tree ${tree_code} added to system`
  })
  return res.status(201).json(data)
})

r.patch('/:code', validate(treeUpdateSchema), async (req, res) => {
  const { data: existing } = await db.from('trees').select('id, status').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!existing) return res.status(404).json({ error: 'Tree not found' })
  const isEmployee = req.user!.role === 'employee'
  const allowed = isEmployee ? ['status', 'action_notes', 'health_score'] : Object.keys(req.body)
  const patch: Record<string, any> = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k] })
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'No valid fields to update' })
  if (patch.status === 'completed' && existing.status !== 'completed') patch.completed_at = new Date().toISOString()
  const { data, error } = await db.from('trees').update(patch).eq('id', existing.id).select().single()
  if (error) return res.status(400).json({ error: error.message })
  if (patch.status && patch.status !== existing.status) {
    await db.from('tree_activity_log').insert({
      tree_id: existing.id, performed_by: req.user!.userId,
      action_taken: 'status_changed', previous_status: existing.status,
      new_status: patch.status, notes: req.body.log_notes || null
    })
  }
  return res.json(data)
})

r.delete('/:code', requireOwner, async (req, res) => {
  const { error } = await db.from('trees').delete().eq('tree_code', req.params.code.toUpperCase())
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ success: true })
})

// ACTIVITY
r.get('/:code/activity', async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { data, error } = await db.from('tree_activity_log')
    .select('*, users:performed_by(name, role)')
    .eq('tree_id', tree.id).order('logged_at', { ascending: false }).limit(100)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/:code/activity', validate(treeActivitySchema), async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { action_taken, notes } = req.body
  if (!action_taken) return res.status(400).json({ error: 'action_taken required' })
  const { data, error } = await db.from('tree_activity_log').insert({
    tree_id: tree.id, performed_by: req.user!.userId, action_taken, notes
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

// HEALTH
r.get('/:code/health', async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { data, error } = await db.from('tree_health_observations')
    .select('*, users:observed_by(name)')
    .eq('tree_id', tree.id).order('observed_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/:code/health', validate(treeHealthSchema), async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { data, error } = await db.from('tree_health_observations').insert({
    tree_id: tree.id, observed_by: req.user!.userId, ...req.body
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  if (req.body.health_score) await db.from('trees').update({ health_score: req.body.health_score }).eq('id', tree.id)
  return res.status(201).json(data)
})

// PHOTOS
r.get('/:code/photos', async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { data, error } = await db.from('tree_photos')
    .select('*, users:uploaded_by(name)')
    .eq('tree_id', tree.id).order('taken_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/:code/photos', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Photo file required' })
  const code = req.params.code.toUpperCase()
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', code).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const ts = Date.now()
  const ext = req.file.originalname.split('.').pop()
  const filename = `${req.body.photo_type || 'general'}_${ts}.${ext}`
  const { url } = await uploadToDrive(req.file.buffer, filename, req.file.mimetype, code)
  const { data, error } = await db.from('tree_photos').insert({
    tree_id: tree.id, uploaded_by: req.user!.userId,
    photo_url: url, photo_type: req.body.photo_type || 'general', caption: req.body.caption || null
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  await db.from('tree_activity_log').insert({
    tree_id: tree.id, performed_by: req.user!.userId,
    action_taken: 'photo_uploaded', notes: `${req.body.photo_type || 'general'} photo added`
  })
  return res.status(201).json(data)
})

// CONTRIBUTORS
r.get('/:code/contributors', async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { data, error } = await db.from('tree_contributors')
    .select('*, users:user_id(id, name, email, role, bio, profile_photo)')
    .eq('tree_id', tree.id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
})

r.post('/:code/contributors', requireOwner, validate(treeContributorSchema), async (req, res) => {
  const { data: tree } = await db.from('trees').select('id').eq('tree_code', req.params.code.toUpperCase()).single()
  if (!tree) return res.status(404).json({ error: 'Tree not found' })
  const { user_id, role, since_date, notes, is_public } = req.body
  if (!user_id || !role) return res.status(400).json({ error: 'user_id and role required' })
  const { data, error } = await db.from('tree_contributors').insert({
    tree_id: tree.id, user_id, role, since_date, notes, is_public: is_public !== false
  }).select().single()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json(data)
})

r.delete('/:code/contributors/:id', requireOwner, async (req, res) => {
  const { error } = await db.from('tree_contributors').delete().eq('id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ success: true })
})

export default r
