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
# Run as non-root
RUN addgroup -g 1001 -S nodegrp && adduser -S nodeusr -G nodegrp
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
USER nodeusr
CMD ["npm", "run", "start"]