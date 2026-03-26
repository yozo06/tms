/**
 * src/core/config.ts
 *
 * Central configuration for the WildArc backend.
 * All runtime-tunable defaults live here — no magic numbers scattered
 * through the codebase.  Secrets and credentials always stay in environment
 * variables and are never stored here.
 */

export const config = {
  server: {
    /** HTTP port the Express server binds to. */
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },

  cors: {
    /** Origin of the Vite dev server (or deployed frontend). */
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    /** Origin of the API server itself (used when frontend + API share a host). */
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  },

  auth: {
    /** Access-token lifetime.  Short-lived by default. */
    jwtExpiry: process.env.JWT_EXPIRY ?? '1h',
    /** Refresh-token lifetime. */
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
    /** bcrypt work factor — 12 is a safe default; increase over time as hardware speeds up. */
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  },

  uploads: {
    /** Maximum allowed file size for tree photos, in bytes (default 10 MB). */
    maxFileSizeBytes: parseInt(
      process.env.MAX_FILE_SIZE_BYTES ?? String(10 * 1024 * 1024),
      10,
    ),
  },

  pagination: {
    /** Default page size for paginated list endpoints. */
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT ?? '50', 10),
    /** Maximum rows returned for activity / health-log queries. */
    activityLogLimit: parseInt(process.env.ACTIVITY_LOG_LIMIT ?? '100', 10),
  },
} as const
