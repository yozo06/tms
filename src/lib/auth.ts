import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const SECRET = process.env.JWT_SECRET!
const EXPIRY = process.env.JWT_EXPIRY || '1h'
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'

export interface TokenPayload {
  userId: number
  email: string
  role: 'owner' | 'employee' | 'volunteer'
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRY } as any)

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRY } as any)

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, SECRET) as TokenPayload

export const hashPassword = (pw: string): Promise<string> =>
  bcrypt.hash(pw, 12)

export const comparePassword = (pw: string, hash: string): Promise<boolean> =>
  bcrypt.compare(pw, hash)
