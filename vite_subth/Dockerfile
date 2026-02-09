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
ARG VITE_CDN_URL
ARG VITE_APP_TITLE
ARG VITE_APP_DESCRIPTION
ARG VITE_APP_VERSION

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_DESCRIPTION=$VITE_APP_DESCRIPTION
ENV VITE_APP_VERSION=$VITE_APP_VERSION

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
