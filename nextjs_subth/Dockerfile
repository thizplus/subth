# ═══════════════════════════════════════════════════════════
# SUBTH Frontend - Next.js (Standalone)
# ═══════════════════════════════════════════════════════════

FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# ═══════════════════════════════════════════════════════════
# Builder
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG API_URL
ARG NEXT_PUBLIC_CDN_URL

ENV API_URL=$API_URL
ENV NEXT_PUBLIC_CDN_URL=$NEXT_PUBLIC_CDN_URL

# Build with standalone output
RUN npm run build

# ═══════════════════════════════════════════════════════════
# Production image
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
