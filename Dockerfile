# ---------- Stage 1: Base Dependencies ----------
FROM node:22-alpine AS deps
# 1. Added build-base to ensure better-sqlite3 compiles successfully on alpine
RUN apk add --no-cache libc6-compat python3 make g++ build-base
WORKDIR /app

COPY package*.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f "package-lock.json" ]; then npm ci; \
  elif [ -f "yarn.lock" ]; then yarn --frozen-lockfile; \
  elif [ -f "pnpm-lock.yaml" ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install; \
  fi

# ---------- Stage 2: Production Build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 👇 FIX: Changed PostgreSQL mock URL to a valid SQLite file format string
ENV DATABASE_URL="file:./dev.db"
ENV AUTH_SECRET="temporary-build-secret-only"
ENV NEXT_TELEMETRY_DISABLED=1

# Generate the custom Prisma Client before compiling the application
RUN npx prisma generate

RUN \
  if [ -f "package-lock.json" ]; then npm run build; \
  elif [ -f "yarn.lock" ]; then yarn build; \
  elif [ -f "pnpm-lock.yaml" ]; then corepack enable pnpm && pnpm run build; \
  else npm run build; \
  fi

# ---------- Stage 3: Production Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# 👇 Ensure your running container knows where to look for the sqlite file at runtime
ENV DATABASE_URL="file:./prisma/dev.db" 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1002 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the Prisma folder (this ensures your dev.db or migrations folder travels with the container)
COPY --from=builder /app/prisma ./prisma 

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]