# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY src ./src
COPY openapi.yml ./
COPY knexfile.cjs ./
COPY migrations ./migrations
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi.yml ./openapi.yml
COPY --from=builder /app/knexfile.cjs ./knexfile.cjs
COPY --from=builder /app/migrations ./migrations
EXPOSE 3000
CMD ["node", "dist/server.js"]
