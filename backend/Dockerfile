# Use official Node.js LTS image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

# Install TypeScript globally to ensure tsc is available
RUN npm install -g typescript

# Copy tsconfig.json before the rest
COPY tsconfig.json ./

# Copy entire source directory
COPY . .

# Create ES module compatible path resolver
RUN echo 'import { register } from "tsconfig-paths"; import { dirname } from "path"; import { fileURLToPath } from "url"; const __dirname = dirname(fileURLToPath(import.meta.url)); register({ baseUrl: "./dist", paths: { "@config/*": ["config/*"], "@features/*": ["features/*"], "@auth/*": ["features/authentication/*"], "@user/*": ["features/user/*"], "@cache/*": ["features/cache/*"], "@logging/*": ["features/logging/*"], "@security/*": ["features/security/*"], "@web/*": ["features/web-server/*"], "@test/*": ["test/*"], "@/*": ["*"] } });' > path-resolver.js

# Compile TypeScript
RUN tsc

# Production stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy tsconfig.json for path resolution
COPY tsconfig.json ./

# Copy path resolver
COPY --from=builder /app/path-resolver.js ./path-resolver.js

# Install production dependencies AND tsconfig-paths
RUN npm ci --only=production && npm install --save tsconfig-paths

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run the application with path resolution for ES modules
CMD ["node", "--import", "./path-resolver.js", "dist/index.js"]
