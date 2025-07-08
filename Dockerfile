# Build stage
FROM node:18-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/tenant-system/package.json ./packages/tenant-system/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN pnpm --filter @exzos/database db:generate

# Build
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

# Copiar arquivos necessários
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"]