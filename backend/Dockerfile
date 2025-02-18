# Use official Node.js LTS image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

# Copy entire source directory
COPY . .

COPY ../settings.json ./settings.json

# Verify TypeScript installation
RUN npx tsc --version

# Compile TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "dist/index.js"]
