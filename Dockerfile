# ===========================================================================
# WildArc — Production Dockerfile (Backend API only)
# ===========================================================================
# Usage:
#   docker build -t wildarc-api .
#   docker run -p 3000:3000 --env-file .env wildarc-api
#
# For local development, use docker-compose.yml instead.
# ===========================================================================

# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc --project tsconfig.json

# ---- Production stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S wildarc -u 1001
USER wildarc

# Copy compiled output and dependencies from builder
COPY --from=builder --chown=wildarc:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=wildarc:nodejs /app/dist ./dist
COPY --from=builder --chown=wildarc:nodejs /app/package.json ./package.json

# Expose API port (matches config.server.port default)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENV NODE_ENV=production
CMD ["node", "dist/src/server.js"]
