# استخدام Node.js كـ base image
FROM node:20-alpine AS base

# تثبيت libc6-compat للتوافق
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Dependencies stage
FROM base AS deps

# نسخ ملفات package
COPY package.json package-lock.json* ./

# تثبيت التبعيات
RUN npm ci

# Builder stage
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تعطيل telemetry أثناء البناء
ENV NEXT_TELEMETRY_DISABLED=1

# بناء التطبيق
RUN npm run build

# Runner stage
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# إنشاء مستخدم غير root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات الضرورية
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
