# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar solo lo necesario para ejecutar
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponer el puerto
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# Comando de inicio
CMD ["node", "./dist/server/entry.mjs"]