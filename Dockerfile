# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Set DB_PATH to a volume mount point / persistent location
ENV DB_PATH=/data/pushstreak.db

# Install production dependencies only
COPY package.json package-lock.json ./
# need python/make/g++ for better-sqlite3 build if prebuilds are missing/incompatible, 
# but node:22-slim might not have them. better-sqlite3 usually provides prebuilds.
# If issues arise, we might need to add build tools.
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Copy server code
COPY --from=builder /app/server ./server

# Create directory for database volume
RUN mkdir -p /data && chown -R node:node /data

EXPOSE 3001

# Run as non-root user
USER node

CMD ["node", "server/index.js"]
