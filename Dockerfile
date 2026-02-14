# =============================================
# Akram Frontend — Multi-stage Dockerfile
# =============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cache optimized)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build static files
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy static build from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
