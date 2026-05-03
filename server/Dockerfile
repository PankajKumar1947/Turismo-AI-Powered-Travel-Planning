# -------- Base --------
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable


# -------- Dependencies --------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# -------- Build --------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build


# -------- Production --------
FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production

# Copy only what's needed
COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Install only production deps
RUN pnpm install --prod --frozen-lockfile

# Security (non-root user)
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

CMD ["node", "dist/server.js"]