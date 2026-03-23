import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './authenticate';
import * as authLib from '../lib/auth';
import type { Request, Response, NextFunction } from 'express';

// Mock the auth library
vi.mock('../lib/auth', () => ({
    verifyToken: vi.fn(),
}));

describe('Authenticate Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {},
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });

    it('should return 401 if no authorization header is present', () => {
        authenticate(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is poorly formatted (no Bearer)', () => {
        mockReq.headers = { authorization: 'InvalidTokenFormat' };
        authenticate(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() and set req.user if token is valid', () => {
        mockReq.headers = { authorization: 'Bearer valid_token_here' };
        const mockPayload = { userId: 1, email: 'test@farm.com', role: 'owner' };

        // Setup mock return
        (authLib.verifyToken as any).mockReturnValue(mockPayload);

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(authLib.verifyToken).toHaveBeenCalledWith('valid_token_here');
        expect((mockReq as any).user).toEqual(mockPayload);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification throws an error (e.g., expired)', () => {
        mockReq.headers = { authorization: 'Bearer expired_token' };

        // Setup mock to throw
        (authLib.verifyToken as any).mockImplementation(() => {
            throw new Error('jwt expired');
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(authLib.verifyToken).toHaveBeenCalledWith('expired_token');
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });
});
