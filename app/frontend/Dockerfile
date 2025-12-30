# Production multi-stage build for Next.js
FROM node:22.14.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false

FROM node:22.14.0-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22.14.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install supercronic for cron jobs (Alpine)
# Checksum from https://github.com/aptible/supercronic/releases/tag/v0.2.29
RUN apk add --no-cache curl && \
    curl -fsSL https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64 \
    -o /tmp/supercronic && \
    echo "cd48d45c4b10f3f0bfdd3a57d054cd05ac96812b supercronic" > /tmp/supercronic.sha1 && \
    cd /tmp && sha1sum -c supercronic.sha1 && \
    mv /tmp/supercronic /usr/local/bin/supercronic && \
    chmod +x /usr/local/bin/supercronic && \
    rm /tmp/supercronic.sha1

# Run as non-root
RUN addgroup -g 1001 -S nodegrp && adduser -S nodeusr -G nodegrp

# Create log directory with proper permissions
RUN mkdir -p /var/log/nextjs/archive && \
    chown -R nodeusr:nodegrp /var/log/nextjs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/rotate-logs.sh ./rotate-logs.sh

# Make log rotation script executable
RUN chmod +x ./rotate-logs.sh

# Create crontab file for log rotation (runs daily at midnight)
RUN echo "0 0 * * * /app/rotate-logs.sh >> /var/log/nextjs/rotation.log 2>&1" > /app/crontab

EXPOSE 3000
USER nodeusr

# Start supercronic in background for log rotation, then start the Node.js server
# Note: For production deployments with high availability requirements,
# consider using a process supervisor or container orchestration
CMD supercronic /app/crontab & npm run start