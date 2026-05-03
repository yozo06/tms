/**
 * Arbor Zones API Route Tests — H-09
 *
 * Tests for /api/zones CRUD endpoints.
 * Uses Supertest + Vitest mocks for Supabase (no real DB required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Chainable Supabase mock ────────────────────────────────────────────────
// vi.hoisted() ensures these are available when vi.mock() factories run
const { mockFrom, mockVerifyToken, zonesChain } = vi.hoisted(() => {
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

  const zonesChain = makeChain();

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'land_zones') return zonesChain;
    return makeChain();
  });

  const mockVerifyToken = vi.fn();

  return { mockFrom, mockVerifyToken, zonesChain };
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

const sampleZone = {
  id: 1, zone_code: 'Z1', zone_name: 'Heritage Zone',
  description: 'Old growth area', boundary_coords: null,
  project_id: 'proj-1', created_at: '2026-01-01',
};

function resetAll() {
  vi.clearAllMocks();
  resetChain(zonesChain);
}

// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/zones', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/zones');
    expect(res.status).toBe(401);
  });

  it('returns list of all zones', async () => {
    zonesChain.order.mockResolvedValue({ data: [sampleZone], error: null });

    const res = await request(app).get('/api/zones').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].zone_code).toBe('Z1');
    expect(res.body[0].zone_name).toBe('Heritage Zone');
  });

  it('returns 500 on database error', async () => {
    zonesChain.order.mockResolvedValue({ data: null, error: { message: 'DB down' } });

    const res = await request(app).get('/api/zones').set(...AUTH);

    expect(res.status).toBe(500);
  });
});

describe('POST /api/zones', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(volunteerUser);

    const res = await request(app).post('/api/zones').set(...AUTH)
      .send({ zone_code: 'Z2', zone_name: 'New Zone' });

    expect(res.status).toBe(403);
  });

  it('creates a zone and returns 201', async () => {
    const newZone = { id: 2, zone_code: 'Z2', zone_name: 'Riparian Zone' };
    zonesChain.single.mockResolvedValue({ data: newZone, error: null });

    const res = await request(app).post('/api/zones').set(...AUTH)
      .send({ zone_code: 'Z2', zone_name: 'Riparian Zone', description: 'Near the stream' });

    expect(res.status).toBe(201);
    expect(res.body.zone_name).toBe('Riparian Zone');
  });

  it('returns 400 when zone_code is missing', async () => {
    const res = await request(app).post('/api/zones').set(...AUTH)
      .send({ zone_name: 'No Code Zone' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when zone_name is missing', async () => {
    const res = await request(app).post('/api/zones').set(...AUTH)
      .send({ zone_code: 'Z9' });

    expect(res.status).toBe(400);
  });

  it('returns 400 on database error (duplicate)', async () => {
    zonesChain.single.mockResolvedValue({ data: null, error: { message: 'unique constraint violated' } });

    const res = await request(app).post('/api/zones').set(...AUTH)
      .send({ zone_code: 'Z1', zone_name: 'Duplicate Zone' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unique/i);
  });
});

describe('PATCH /api/zones/:id', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('updates a zone and returns updated data', async () => {
    const updated = { ...sampleZone, description: 'Updated desc' };
    zonesChain.single.mockResolvedValue({ data: updated, error: null });

    const res = await request(app).patch('/api/zones/1').set(...AUTH)
      .send({ description: 'Updated desc' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated desc');
  });

  it('returns 403 for non-owner users', async () => {
    mockVerifyToken.mockReturnValue(volunteerUser);

    const res = await request(app).patch('/api/zones/1').set(...AUTH)
      .send({ description: 'Attempt' });

    expect(res.status).toBe(403);
  });
});
