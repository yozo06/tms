/**
 * Arbor Species API Route Tests — H-09
 *
 * Tests for /api/species CRUD endpoints.
 * Uses Supertest + Vitest mocks for Supabase (no real DB required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Chainable Supabase mock ────────────────────────────────────────��───────
// vi.hoisted() ensures these are available when vi.mock() factories run
const { mockFrom, mockVerifyToken, speciesChain, rolesChain } = vi.hoisted(() => {
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

  const speciesChain = makeChain();
  const rolesChain = makeChain();

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    switch (table) {
      case 'species': return speciesChain;
      case 'ecosystem_roles': return rolesChain;
      default: return makeChain();
    }
  });

  const mockVerifyToken = vi.fn();

  return { mockFrom, mockVerifyToken, speciesChain, rolesChain };
});

vi.mock('../../../core/lib/supabase', () => ({ db: { from: mockFrom } }));

vi.mock('../../../core/lib/auth', () => ({
  verifyToken: mockVerifyToken,
  comparePassword: vi.fn(),
  signToken: vi.fn().mockReturnValue('t'),
  signRefreshToken: vi.fn().mockReturnValue('rt'),
  hashPassword: vi.fn().mockResolvedValue('h'),
}));

vi.mock('../../../core/lib/drive', () => ({
  uploadToDrive: vi.fn().mockResolvedValue({ url: 'https://drive.google.com/mock' }),
}));

import app from '../../../app';

// ── Chain reset helper ──────────────────────────────────────────────────────
const CHAIN_RESET_METHODS = [
  'select', 'eq', 'neq', 'ilike', 'order', 'range', 'limit',
  'insert', 'update', 'delete', 'single', 'maybeSingle',
] as const;

function resetChain(chain: any) {
  chain._setResult({ data: null, error: null });
  CHAIN_RESET_METHODS.forEach(m => { chain[m].mockReset(); chain[m].mockReturnValue(chain); });
}

const ownerUser = { userId: 1, email: 'yogesh@wildarc.dev', role: 'owner' };
const volunteerUser = { userId: 3, email: 'vol@wildarc.dev', role: 'volunteer' };
const AUTH = ['Authorization', 'Bearer valid-token'] as const;

const sampleSpecies = {
  id: 1, common_name: 'Mango', scientific_name: 'Mangifera indica',
  description: 'Tropical fruit tree', fun_fact: 'King of fruits',
};

function resetAll() {
  vi.clearAllMocks();
  [speciesChain, rolesChain].forEach(resetChain);
}

// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/species', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/species');
    expect(res.status).toBe(401);
  });

  it('returns list of all species', async () => {
    speciesChain.order.mockResolvedValue({ data: [sampleSpecies], error: null });

    const res = await request(app).get('/api/species').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].common_name).toBe('Mango');
  });

  it('returns 500 on database error', async () => {
    speciesChain.order.mockResolvedValue({ data: null, error: { message: 'DB down' } });

    const res = await request(app).get('/api/species').set(...AUTH);

    expect(res.status).toBe(500);
  });
});

describe('GET /api/species/roles', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns ecosystem roles', async () => {
    const roles = [{ id: 1, category: 'canopy', name: 'Shade provider' }];
    rolesChain.order.mockResolvedValue({ data: roles, error: null });

    const res = await request(app).get('/api/species/roles').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('canopy');
  });
});

describe('GET /api/species/:id', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns a single species by id', async () => {
    speciesChain.single.mockResolvedValue({ data: sampleSpecies, error: null });

    const res = await request(app).get('/api/species/1').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body.scientific_name).toBe('Mangifera indica');
  });

  it('returns 404 when species not found', async () => {
    speciesChain.single.mockResolvedValue({ data: null, error: { message: 'No rows' } });

    const res = await request(app).get('/api/species/999').set(...AUTH);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/species', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(volunteerUser);

    const res = await request(app).post('/api/species').set(...AUTH)
      .send({ common_name: 'Jackfruit', scientific_name: 'Artocarpus heterophyllus' });

    expect(res.status).toBe(403);
  });

  it('creates a species and returns 201', async () => {
    const newSpecies = { id: 2, common_name: 'Jackfruit', scientific_name: 'Artocarpus heterophyllus' };
    speciesChain.single.mockResolvedValue({ data: newSpecies, error: null });

    const res = await request(app).post('/api/species').set(...AUTH)
      .send({ common_name: 'Jackfruit', scientific_name: 'Artocarpus heterophyllus' });

    expect(res.status).toBe(201);
    expect(res.body.common_name).toBe('Jackfruit');
  });

  it('returns 400 when common_name is missing', async () => {
    const res = await request(app).post('/api/species').set(...AUTH)
      .send({ scientific_name: 'Artocarpus heterophyllus' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when scientific_name is missing', async () => {
    const res = await request(app).post('/api/species').set(...AUTH)
      .send({ common_name: 'Jackfruit' });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/species/:id', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('updates a species and returns updated data', async () => {
    const updated = { ...sampleSpecies, description: 'Updated description' };
    speciesChain.single.mockResolvedValue({ data: updated, error: null });

    const res = await request(app).patch('/api/species/1').set(...AUTH)
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated description');
  });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(volunteerUser);

    const res = await request(app).patch('/api/species/1').set(...AUTH)
      .send({ description: 'Trying to update' });

    expect(res.status).toBe(403);
  });
});
