# ========= deps (dev) =========
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ========= build =========
FROM node:20-alpine AS build
WORKDIR /app
# 1) traga as dependências (inclui devDeps: tsc, nest, tsc-alias, prisma)
COPY --from=deps /app/node_modules ./node_modules

# 2) copie configs e código (não precisa package.json aqui)
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src

# 3) gere prisma client + compile + reescreva aliases
RUN npx prisma generate
# use nest se tiver @nestjs/cli; senão, tsc direto
# RUN npx nest build -p tsconfig.build.json || true
RUN npx tsc -p tsconfig.build.json
RUN npx tsc-alias -p tsconfig.build.json

# ========= prod-deps =========
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# ========= runtime =========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat

# deps de prod
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./

# artefatos do prisma (gerados no build)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma

# app compilada (aliases já reescritos)
COPY --from=build /app/dist ./dist

# entrypoint p/ migrations
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node","dist/main.js"]
