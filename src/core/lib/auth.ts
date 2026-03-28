import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '../config'

const SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: number
  email: string
  role: 'owner' | 'employee' | 'volunteer'
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: config.auth.jwtExpiry } as any)

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: config.auth.jwtRefreshExpiry } as any)

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, SECRET) as TokenPayload

export const hashPassword = (pw: string): Promise<string> =>
  bcrypt.hash(pw, config.auth.bcryptRounds)

export const comparePassword = (pw: string, hash: string): Promise<boolean> =>
  bcrypt.compare(pw, hash)
