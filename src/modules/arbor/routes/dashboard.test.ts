/**
 * Arbor Dashboard API Route Tests — H-09
 *
 * Tests for GET /api/dashboard/stats endpoint.
 * Uses Supertest + Vitest mocks for Supabase (no real DB required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Chainable Supabase mock ────────────────────────────────────────────────
// vi.hoisted() ensures these are available when vi.mock() factories run
const { mockFrom, mockVerifyToken, treesChain, zoneSummaryChain } = vi.hoisted(() => {
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
  const zoneSummaryChain = makeChain();

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    switch (table) {
      case 'trees': return treesChain;
      case 'zone_summary': return zoneSummaryChain;
      default: return makeChain();
    }
  });

  const mockVerifyToken = vi.fn();

  return { mockFrom, mockVerifyToken, treesChain, zoneSummaryChain };
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
const AUTH = ['Authorization', 'Bearer valid-token'] as const;

function resetAll() {
  vi.clearAllMocks();
  [treesChain, zoneSummaryChain].forEach(resetChain);
}

// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/dashboard/stats', () => {
  beforeEach(() => { resetAll(); mockVerifyToken.mockReturnValue(ownerUser); });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('returns computed stats and zone summary on success', async () => {
    const mockTrees = [
      { status: 'pending', action: 'cut', priority: 'urgent', assigned_to: 1 },
      { status: 'pending', action: 'trim', priority: 'medium', assigned_to: 2 },
      { status: 'in_progress', action: 'keep', priority: 'low', assigned_to: 1 },
      { status: 'completed', action: 'monitor', priority: 'low', assigned_to: null },
    ];
    // trees query resolves via thenable (no .single() terminal)
    treesChain._setResult({ data: mockTrees, error: null });

    const mockZones = [
      { zone_code: 'Z1', zone_name: 'Heritage', total_trees: 10, completed: 5 },
    ];
    zoneSummaryChain._setResult({ data: mockZones, error: null });

    const res = await request(app).get('/api/dashboard/stats').set(...AUTH);

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(4);
    expect(res.body.stats.pending).toBe(2);
    expect(res.body.stats.inProgress).toBe(1);
    expect(res.body.stats.completed).toBe(1);
    expect(res.body.stats.toCut).toBe(1);
    expect(res.body.stats.toTrim).toBe(1);
    expect(res.body.stats.urgent).toBe(1);
    expect(res.body.zones).toHaveLength(1);
    expect(res.body.zones[0].zone_name).toBe('Heritage');
  });

  it('returns 500 when trees query fails', async () => {
    treesChain._setResult({ data: null, error: { message: 'Connection lost' } });

    const res = await request(app).get('/api/dashboard/stats').set(...AUTH);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Connection lost');
  });
});
