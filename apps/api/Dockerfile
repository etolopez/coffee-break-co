# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root tsconfig.json (needed by shared package)
COPY tsconfig.json ./

# Copy root package.json (for shared dependencies)
COPY package.json ./

# Copy shared package first (monorepo dependency)
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Install root dependencies (winston, etc. needed by shared package)
RUN npm install

# Install shared package dependencies and @types/node
WORKDIR /app/packages/shared
RUN npm install && npm install --save-dev @types/node

# Build shared package
RUN npm run build

# Copy API package files
WORKDIR /app
COPY apps/api/package.json ./
COPY apps/api/package-lock.json ./
COPY apps/api/tsconfig.json ./

# Install API dependencies
RUN npm ci

# Copy API source code
COPY apps/api/src ./src
COPY apps/api/prisma ./prisma

# Copy data directory (for JSON files)
COPY data ./data

# Build the API application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 4000

# Start the application
WORKDIR /app
CMD ["node", "apps/api/dist/main.js"]
