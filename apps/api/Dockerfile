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

# Copy API package files to apps/api directory
WORKDIR /app
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma

# Copy data directory (for JSON files)
COPY data ./data

# Install API dependencies from apps/api directory
WORKDIR /app/apps/api
RUN npm install --no-package-lock --legacy-peer-deps

# Build the API application (from apps/api directory where tsconfig.json is)
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 4000

# Start the application
WORKDIR /app/apps/api
CMD ["node", "./dist/main.js"]