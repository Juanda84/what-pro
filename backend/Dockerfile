# =========================
#  Builder
# =========================
FROM node:20-bullseye AS build

WORKDIR /usr/src/app

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el código
COPY . .

# Compila (si tu backend compila a dist)
RUN npm run build

# =========================
#  Runtime
# =========================
FROM node:20-bullseye

# utilidades
RUN apt-get update && apt-get install -y wget ca-certificates gnupg && rm -rf /var/lib/apt/lists/*

# dockerize para esperar a MySQL
ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -O - https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
  | tar -C /usr/local/bin -xzvf -

WORKDIR /usr/src/app

# Copiamos solo lo necesario desde build
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
# copiamos también el script de seed (se copió en build)
COPY --from=build /usr/src/app/scripts ./scripts

ENV PORT=8080
EXPOSE 8080

# IMPORTANTE: corre migraciones + seed y arranca
CMD dockerize -wait tcp://${DB_HOST:-db}:3306 -timeout 60s \
  && npx sequelize db:migrate \
  && node scripts/seedAdmin.js \
  && node dist/server.js

