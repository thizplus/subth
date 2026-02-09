# ═══════════════════════════════════════════════════════════
# SUBTH Admin Panel - Vite + React
# ═══════════════════════════════════════════════════════════

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time environment variables
ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

# Build
RUN npm run build

# ═══════════════════════════════════════════════════════════
# Production - Nginx
# ═══════════════════════════════════════════════════════════
FROM nginx:alpine

RUN apk --no-cache add wget

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
