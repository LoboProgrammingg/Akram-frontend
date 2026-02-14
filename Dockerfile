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
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy static build from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx config
# Copy custom Nginx config to templates dir for env variable substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
