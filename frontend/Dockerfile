# Etapa de build (Node moderno + Vite)
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# Instalar deps con caché
COPY package*.json ./
RUN npm ci

# Copiar el código y construir
COPY . .
# Vite genera por defecto en /dist (ajusta si tu config cambia)
RUN npm run build

# Etapa de runtime (Nginx en Alpine)
FROM nginx:alpine

# Herramientas que usa el entrypoint y dockerize
RUN apk add --no-cache jq openssl wget

# Instalar dockerize para inyectar variables en arranque
ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && rm dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz

# Donde serviremos los estáticos
ENV PUBLIC_HTML=/var/www/public/

# Config de Nginx del proyecto
COPY .docker/nginx /etc/nginx/

# Copiar el build de Vite (carpeta dist por defecto)
COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}

# Script que inyecta variables en tiempo de arranque
COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh

EXPOSE 80
