# Use official Node.js image
FROM node:20-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --production

# Copy source code
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY package.json package-lock.json* .npmrc ./
RUN npm ci
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd -g 10014 appuser && \
    useradd -u 10014 -g appuser -d /app -s /bin/sh appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port (default 8000, can be overridden)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["npm", "start"]
