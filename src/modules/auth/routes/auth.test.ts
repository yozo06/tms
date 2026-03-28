/**
 * Auth API Route Tests — H-08
 *
 * Tests for POST /api/auth/login, /api/auth/signup, /api/auth/refresh
 * Uses Supertest + Vitest mocks for Supabase (no real DB required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ── Supabase mock ────────────────────────────────────────────────────────────
// Must be hoisted before app imports resolve the supabase module.
const mockSingle = vi.fn();
const mockEqForSelect = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelectChain = vi.fn().mockReturnValue({ eq: mockEqForSelect, single: mockSingle });
const mockInsertSelect = vi.fn().mockReturnValue({ single: mockSingle });
const mockInsertChain = vi.fn().mockReturnValue({ select: mockInsertSelect });
const mockFrom = vi.fn().mockReturnValue({
    select: mockSelectChain,
    insert: mockInsertChain,
    update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
});

vi.mock('../../../core/lib/supabase', () => ({
    db: { from: mockFrom },
}));

// ── Auth lib mock ────────────────────────────────────────────────────────────
// Prevents JWT_SECRET env-var dependency at module load time.
const mockComparePassword = vi.fn();
const mockSignToken = vi.fn().mockReturnValue('mock-access-token');
const mockSignRefreshToken = vi.fn().mockReturnValue('mock-refresh-token');
const mockVerifyToken = vi.fn();
const mockHashPassword = vi.fn().mockResolvedValue('hashed-password');

vi.mock('../../../core/lib/auth', () => ({
    comparePassword: mockComparePassword,
    signToken: mockSignToken,
    signRefreshToken: mockSignRefreshToken,
    verifyToken: mockVerifyToken,
    hashPassword: mockHashPassword,
}));

// ── Import app AFTER mocks are set up ───────────────────────────────────────
import app from '../../../app';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
    id: 1,
    name: 'Yogesh Zope',
    email: 'yogesh@wildarc.dev',
    password_hash: 'hashed-password',
    role: 'owner' as const,
    is_active: true,
    ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain mocks
        mockSelectChain.mockReturnValue({ eq: mockEqForSelect, single: mockSingle });
        mockEqForSelect.mockReturnValue({ single: mockSingle });
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'secret' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yogesh@wildarc.dev' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 401 when user is not found', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { message: 'No rows' } });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'notfound@wildarc.dev', password: 'secret' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('returns 403 when account is deactivated', async () => {
        mockSingle.mockResolvedValue({
            data: makeUser({ is_active: false }),
            error: null,
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yogesh@wildarc.dev', password: 'secret' });

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/deactivated/i);
    });

    it('returns 401 when password is incorrect', async () => {
        mockSingle.mockResolvedValue({ data: makeUser(), error: null });
        mockComparePassword.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yogesh@wildarc.dev', password: 'wrong-password' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('returns 200 with token, refreshToken and user on valid login', async () => {
        mockSingle.mockResolvedValue({ data: makeUser(), error: null });
        mockComparePassword.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'yogesh@wildarc.dev', password: 'correct-password' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('mock-access-token');
        expect(res.body.refreshToken).toBe('mock-refresh-token');
        expect(res.body.user).toMatchObject({
            id: 1,
            name: 'Yogesh Zope',
            email: 'yogesh@wildarc.dev',
            role: 'owner',
        });
        // Password hash must never be in the response
        expect(res.body.user.password_hash).toBeUndefined();
    });

    it('normalises email to lowercase before querying', async () => {
        mockSingle.mockResolvedValue({ data: makeUser(), error: null });
        mockComparePassword.mockResolvedValue(true);

        await request(app)
            .post('/api/auth/login')
            .send({ email: 'Yogesh@WildArc.dev', password: 'secret' });

        // The route should call .eq('email', 'yogesh@wildarc.dev')
        expect(mockEqForSelect).toHaveBeenCalledWith('email', 'yogesh@wildarc.dev');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelectChain.mockReturnValue({ eq: mockEqForSelect, single: mockSingle });
        mockEqForSelect.mockReturnValue({ single: mockSingle });
        mockInsertChain.mockReturnValue({ select: mockInsertSelect });
        mockInsertSelect.mockReturnValue({ single: mockSingle });
    });

    it('returns 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'new@wildarc.dev', password: 'pass123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'New User', password: 'pass123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'New User', email: 'new@wildarc.dev' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when email is already in use', async () => {
        // First DB call (check existing) returns an existing user
        mockSingle.mockResolvedValueOnce({ data: { id: 99 }, error: null });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'New User', email: 'existing@wildarc.dev', password: 'pass123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already in use/i);
    });

    it('returns 201 with token, refreshToken and user on successful signup', async () => {
        // First call: check-existing → no existing user
        mockSingle.mockResolvedValueOnce({ data: null, error: null });
        // Second call: insert result → new user
        mockSingle.mockResolvedValueOnce({
            data: { id: 2, name: 'New User', email: 'new@wildarc.dev', role: 'volunteer' },
            error: null,
        });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'New User', email: 'new@wildarc.dev', password: 'pass123' });

        expect(res.status).toBe(201);
        expect(res.body.token).toBe('mock-access-token');
        expect(res.body.refreshToken).toBe('mock-refresh-token');
        expect(res.body.user).toMatchObject({
            id: 2,
            name: 'New User',
            email: 'new@wildarc.dev',
            role: 'volunteer',
        });
    });

    it('returns 500 when DB insert fails', async () => {
        // Check-existing: no match
        mockSingle.mockResolvedValueOnce({ data: null, error: null });
        // Insert fails
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'unique constraint' } });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'New User', email: 'new@wildarc.dev', password: 'pass123' });

        expect(res.status).toBe(500);
        expect(res.body.error).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 when refreshToken is missing', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/i);
    });

    it('returns 401 when refreshToken is invalid or expired', async () => {
        mockVerifyToken.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'expired-token' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid|expired/i);
    });

    it('returns 200 with a new access token when refreshToken is valid', async () => {
        mockVerifyToken.mockReturnValue({
            userId: 1,
            email: 'yogesh@wildarc.dev',
            role: 'owner',
        });

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'valid-refresh-token' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('mock-access-token');
        expect(mockSignToken).toHaveBeenCalledWith({
            userId: 1,
            email: 'yogesh@wildarc.dev',
            role: 'owner',
        });
    });
});
