# Frontend Dockerfile - Multi-stage build for optimization
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL=http://localhost:5000
ARG REACT_APP_FACE_SERVICE_URL=http://localhost:5002

# Set environment variables
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_FACE_SERVICE_URL=${REACT_APP_FACE_SERVICE_URL}

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install curl and serve package for static file serving
RUN npm install -g serve && apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=20s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
