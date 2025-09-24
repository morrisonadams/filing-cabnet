# ---- Build stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN   if [ -f package-lock.json ]; then npm ci;   elif [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile;   else npm i; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Provide a writable mount for data persistence
VOLUME ["/app/data"]
ENV DATA_DIR=/app/data

EXPOSE 3000
CMD ["npm","start"]