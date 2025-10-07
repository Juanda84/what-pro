# Etapa de build (Node moderno + Vite)
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# Instalar herramientas de compilación (por si hay deps nativas)
RUN apk add --no-cache python3 make g++

# Instalar deps y compilar
COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps
COPY . .
# Vite genera por defecto en /dist
RUN npm run build

# Etapa de runtime (Nginx en Alpine)
FROM nginx:alpine

# Utilidades necesarias + dockerize
RUN apk add --no-cache jq openssl wget

ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && rm dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz

# Donde serviremos los estáticos
ENV PUBLIC_HTML=/var/www/public/

# Config de Nginx del proyecto
COPY .docker/nginx /etc/nginx/

# Copiar el build de Vite
COPY --from=build /usr/src/app/build ${PUBLIC_HTML}

# Script que inyecta variables en arranque (si tu proyecto lo usa)
COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh

EXPOSE 80

