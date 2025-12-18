# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY web/server/package.json web/server/package-lock.json* web/server/bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copy source code
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY web/server/ .

# Set environment to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 10014 appuser && \
    adduser --system --uid 10014 --ingroup appuser --home /app --no-create-home appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port (default 8000, can be overridden)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:8000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["bun", "run", "src/index.ts"]
