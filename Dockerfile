# syntax=docker/dockerfile:1
# 🏛️ Chaitanya (Deemed to be University) — SDRMS Production Container
FROM node:20-bookworm-slim AS base

WORKDIR /app

# Install build dependencies for better-sqlite3 native bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm ci

# Copy full source
COPY . .

# Build frontend production bundle into dist/
RUN npm run build

# Seed baseline database schema and administrative users if not present
RUN node server/seed.js

# Expose backend service port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Start production server
CMD ["node", "server/server.js"]

