# Etapa 1: Instalación de dependencias del monorepo
FROM node:18-alpine AS deps
WORKDIR /app

# Copiar los package.json de la raíz y de los workspaces
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Instalar TODAS las dependencias desde la raíz
RUN npm install

# Etapa 2: Construcción de la aplicación de frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Build arguments para las variables de entorno necesarias en build time
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

# Copiar las dependencias instaladas de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/shared ./shared

# Copiar el código fuente completo
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Construir la aplicación de frontend
# La variable de entorno asegura que no se genere telemetría anónima en el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
WORKDIR /app/frontend
RUN npm run build

# Etapa 3: Imagen final de producción
FROM node:18-alpine AS runner
WORKDIR /app

# Build arguments para runtime
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar solo los artefactos necesarios para producción
COPY --from=builder /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./.next
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json .

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
