# Dockerfile para la aplicación Next.js de Optima-CX Frontend

# Etapa 1: Instalación de dependencias
FROM node:18-alpine AS deps
WORKDIR /app

# Copiar package.json y lockfile
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Etapa 2: Construcción de la aplicación
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa 3: Imagen final de producción
FROM node:18-alpine AS runner
WORKDIR /app

# Variables de entorno para producción
ENV NODE_ENV=production

# Crear un usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar los artefactos de construcción de la etapa anterior
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
