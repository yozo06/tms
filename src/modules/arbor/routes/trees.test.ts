/**
 * Arbor Trees API Route Tests — H-09
 *
 * Tests for /api/trees CRUD, activity, and health endpoints.
 * Uses Supertest + Vitest mocks for Supabase (no real DB required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Chainable Supabase mock factory ─────────────────────────────────────────
// vi.hoisted() ensures these are available when vi.mock() factories run
// (vitest hoists vi.mock() above const declarations, causing ReferenceError otherwise)
const { mockFrom, mockVerifyToken, treesChain, activityChain, healthChain, contributorsChain } = vi.hoisted(() => {
  const CHAIN_METHODS = [
    'select', 'eq', 'neq', 'ilike', 'order', 'range', 'limit',
    'insert', 'update', 'delete', 'single', 'maybeSingle',
  ] as const;

  function makeChain() {
    let _result: any = { data: null, error: null };
    const chain: any = {
      then(resolve: any, reject?: any) {
        return Promise.resolve(_result).then(resolve, reject);
      },
      _setResult(r: any) { _result = r; },
    };
    CHAIN_METHODS.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain); });
    return chain;
  }

  const treesChain = makeChain();
  const activityChain = makeChain();
  const healthChain = makeChain();
  const contributorsChain = makeChain();

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    switch (table) {
      case 'trees': return treesChain;
      case 'tree_activity_log': return activityChain;
      case 'tree_health_observations': return healthChain;
      case 'tree_contributors': return contributorsChain;
      default: return makeChain();
    }
  });

  const mockVerifyToken = vi.fn();

  return { mockFrom, mockVerifyToken, treesChain, activityChain, healthChain, contributorsChain };
});

vi.mock('../../../core/lib/supabase', () => ({ db: { from: mockFrom } }));

// ── Auth mock ───────────────────────────────────────────────────────────────
vi.mock('../../../core/lib/auth', () => ({
  verifyToken: mockVerifyToken,
  comparePassword: vi.fn(),
  signToken: vi.fn().mockReturnValue('t'),
  signRefreshToken: vi.fn().mockReturnValue('rt'),
  hashPassword: vi.fn().mockResolvedValue('h'),
}));

// ── Drive mock ──────────────────────────────────────────────────────────────
vi.mock('../../../core/lib/drive', () => ({
  uploadToDrive: vi.fn().mockResolvedValue({ url: 'https://drive.google.com/mock' }),
}));

import app from '../../../app';

// ── Chain reset helper (defined here so CHAIN_METHODS lives in hoisted scope above) ──
const CHAIN_RESET_METHODS = [
  'select', 'eq', 'neq', 'ilike', 'order', 'range', 'limit',
  'insert', 'update', 'delete', 'single', 'maybeSingle',
] as const;

function resetChain(chain: any) {
  chain._setResult({ data: null, error: null });
  CHAIN_RESET_METHODS.forEach(m => { chain[m].mockReset(); chain[m].mockReturnValue(chain); });
}

// ── Test data ───────────────────────────────────────────────────────────────
const ownerUser = { userId: 1, email: 'yogesh@wildarc.dev', role: 'owner' };
const employeeUser = { userId: 2, email: 'emp@wildarc.dev', role: 'employee' };
const AUTH = ['Authorization', 'Bearer valid-token'] as const;

const sampleTree = {
  id: 1, tree_code: 'T001', custom_common_name: 'Test Mango',
  health_score: 8, action: 'keep', status: 'pending', priority: 'medium',
  species_id: 1, zone_id: 1, project_id: 'proj-1',
  coord_x: 10, coord_y: 20, updated_at: '2026-01-01T00:00:00Z',
  species: { common_name: 'Mango', scientific_name: 'Mangifera indica', ecosystem_roles: ['shade'] },
  land_zones: { zone_code: 'Z1', zone_name: 'Zone 1' },
  assigned_user: null,
};

function resetAll() {
  vi.clearAllMocks();
  [treesChain, activityChain, healthChain, contributorsChain].forEach(resetChain);
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINT — no auth required
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/trees/:code/public', () => {
  beforeEach(resetAll);

  it('returns formatted public tree data without authentication', async () => {
    treesChain.single.mockResolvedValue({
      data: {
        tree_code: 'T001', custom_common_name: 'Old Mango',
        custom_fun_fact: 'Over 100 years old', public_notes: 'Landmark tree',
        approx_age_yrs: 100, height_m: 20, trunk_diameter_cm: 80,
        status: 'completed', planting_date: '1925-01-01',
        species: {
          common_name: 'Mango', scientific_name: 'Mangifera indica',
          description: 'King of fruits', fun_fact: 'National fruit of India',
          edible_parts: 'fruit', medicinal_uses: 'traditional',
          ecosystem_roles: ['shade', 'fruit'], water_needs: 'moderate',
          sunlight_needs: 'full', is_native: true, external_ref_url: null,
          reference_images: ['img1.jpg'],
        },
        land_zones: { zone_name: 'Heritage Zone' },
        tree_contributors: [
          { role: 'planter', since_date: '2020-01-01', is_public: true,
            users: { name: 'Yogesh', bio: 'Founder', profile_photo: null } },
          { role: 'helper', since_date: '2021-01-01', is_public: false,
            users: { name: 'Private', bio: null, profile_photo: null } },
        ],
      },
      error: null,
    });

    const res = await request(app).get('/api/trees/T001/public');

    expect(res.status).toBe(200);
    expect(res.body.code).toBe('T001');
    expect(res.body.name).toBe('Old Mango');
    expect(res.body.species).toBe('Mangifera indica');
    expect(res.body.funFact).toBe('Over 100 years old');
    expect(res.body.zone).toBe('Heritage Zone');
    // Only public contributors should be returned
    expect(res.body.contributors).toHaveLength(1);
    expect(res.body.contributors[0].person.name).toBe('Yogesh');
  });

  it('returns 404 when tree code does not exist', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: { message: 'No rows' } });

    const res = await request(app).get('/api/trees/NOTEXIST/public');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED CRUD
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/trees', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/trees');
    expect(res.status).toBe(401);
  });

  it('returns paginated tree list on success', async () => {
    treesChain.range.mockResolvedValue({ data: [sampleTree], error: null, count: 1 });

    const res = await request(app).get('/api/trees').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body.trees).toHaveLength(1);
    expect(res.body.trees[0].tree_code).toBe('T001');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it('returns 500 on database error', async () => {
    treesChain.range.mockResolvedValue({ data: null, error: { message: 'connection refused' }, count: 0 });

    const res = await request(app).get('/api/trees').set(...AUTH);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('connection refused');
  });
});

describe('GET /api/trees/:code', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns full tree detail on success', async () => {
    treesChain.single.mockResolvedValue({ data: sampleTree, error: null });

    const res = await request(app).get('/api/trees/T001').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body.tree_code).toBe('T001');
    expect(res.body.species.common_name).toBe('Mango');
  });

  it('returns 404 when tree not found', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: { message: 'No rows' } });

    const res = await request(app).get('/api/trees/GHOST').set(...AUTH);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/trees', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(employeeUser);

    const res = await request(app).post('/api/trees').set(...AUTH)
      .send({ tree_code: 'T099' });

    expect(res.status).toBe(403);
  });

  it('creates a tree and returns 201 on success', async () => {
    const newTree = { ...sampleTree, id: 99, tree_code: 'T099' };
    treesChain.single.mockResolvedValue({ data: newTree, error: null });

    const res = await request(app).post('/api/trees').set(...AUTH)
      .send({ tree_code: 'T099', action: 'keep', priority: 'medium' });

    expect(res.status).toBe(201);
    expect(res.body.tree_code).toBe('T099');
    expect(treesChain.insert).toHaveBeenCalled();
  });

  it('returns 400 when tree_code is missing', async () => {
    const res = await request(app).post('/api/trees').set(...AUTH)
      .send({ action: 'keep' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when database insert fails', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: { message: 'duplicate key value' } });

    const res = await request(app).post('/api/trees').set(...AUTH)
      .send({ tree_code: 'T001' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duplicate/i);
  });
});

describe('PATCH /api/trees/:code', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('updates a tree and returns updated data', async () => {
    treesChain.single
      .mockResolvedValueOnce({ data: { id: 1, status: 'pending' }, error: null })
      .mockResolvedValueOnce({ data: { ...sampleTree, status: 'in_progress' }, error: null });

    const res = await request(app).patch('/api/trees/T001').set(...AUTH)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('returns 404 when tree does not exist', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: null });

    const res = await request(app).patch('/api/trees/GHOST').set(...AUTH)
      .send({ status: 'completed' });

    expect(res.status).toBe(404);
  });

  it('returns 400 when employee sends disallowed fields', async () => {
    mockVerifyToken.mockReturnValue(employeeUser);
    treesChain.single.mockResolvedValue({ data: { id: 1, status: 'pending' }, error: null });

    const res = await request(app).patch('/api/trees/T001').set(...AUTH)
      .send({ species_id: 99 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no valid fields/i);
  });

  it('logs status change in activity log', async () => {
    treesChain.single
      .mockResolvedValueOnce({ data: { id: 1, status: 'pending' }, error: null })
      .mockResolvedValueOnce({ data: { ...sampleTree, status: 'completed', completed_at: '2026-04-07' }, error: null });

    await request(app).patch('/api/trees/T001').set(...AUTH)
      .send({ status: 'completed' });

    expect(activityChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action_taken: 'status_changed', previous_status: 'pending', new_status: 'completed' }),
    );
  });
});

describe('DELETE /api/trees/:code', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(employeeUser);

    const res = await request(app).delete('/api/trees/T001').set(...AUTH);

    expect(res.status).toBe(403);
  });

  it('deletes the tree and returns success', async () => {
    treesChain._setResult({ error: null });

    const res = await request(app).delete('/api/trees/T001').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(treesChain.delete).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/trees/:code/activity', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns activity log entries for a tree', async () => {
    treesChain.single.mockResolvedValue({ data: { id: 1 }, error: null });
    const activities = [{ id: 1, action_taken: 'tree_created', notes: 'Added', logged_at: '2026-01-01' }];
    activityChain.limit.mockResolvedValue({ data: activities, error: null });

    const res = await request(app).get('/api/trees/T001/activity').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].action_taken).toBe('tree_created');
  });

  it('returns 404 if tree does not exist', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: null });

    const res = await request(app).get('/api/trees/GHOST/activity').set(...AUTH);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/trees/:code/activity', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('creates an activity entry and returns 201', async () => {
    treesChain.single.mockResolvedValue({ data: { id: 1 }, error: null });
    const newEntry = { id: 10, action_taken: 'watered', notes: 'Deep watering' };
    activityChain.single.mockResolvedValue({ data: newEntry, error: null });

    const res = await request(app).post('/api/trees/T001/activity').set(...AUTH)
      .send({ action_taken: 'watered', notes: 'Deep watering' });

    expect(res.status).toBe(201);
    expect(res.body.action_taken).toBe('watered');
  });

  it('returns 400 when action_taken is missing', async () => {
    const res = await request(app).post('/api/trees/T001/activity').set(...AUTH)
      .send({ notes: 'No action specified' });

    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HEALTH OBSERVATIONS
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/trees/:code/health', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns health observations for a tree', async () => {
    treesChain.single.mockResolvedValue({ data: { id: 1 }, error: null });
    const observations = [{ id: 1, health_score: 7, observed_issues: 'Leaf spots', observed_at: '2026-01-15' }];
    healthChain.order.mockResolvedValue({ data: observations, error: null });

    const res = await request(app).get('/api/trees/T001/health').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].health_score).toBe(7);
  });
});

describe('POST /api/trees/:code/health', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('creates a health observation and returns 201', async () => {
    treesChain.single.mockResolvedValue({ data: { id: 1 }, error: null });
    const newObs = { id: 5, health_score: 9, notes: 'Very healthy' };
    healthChain.single.mockResolvedValue({ data: newObs, error: null });

    const res = await request(app).post('/api/trees/T001/health').set(...AUTH)
      .send({ health_score: 9, notes: 'Very healthy' });

    expect(res.status).toBe(201);
    expect(res.body.health_score).toBe(9);
  });

  it('returns 400 when health_score is out of range', async () => {
    const res = await request(app).post('/api/trees/T001/health').set(...AUTH)
      .send({ health_score: 15 });

    expect(res.status).toBe(400);
  });

  it('returns 404 when tree does not exist', async () => {
    treesChain.single.mockResolvedValue({ data: null, error: null });

    const res = await request(app).post('/api/trees/T001/health').set(...AUTH)
      .send({ health_score: 8 });

    expect(res.status).toBe(404);
  });
});
