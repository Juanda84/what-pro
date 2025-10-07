# ============== Builder ==============
FROM node:20-bullseye AS build
WORKDIR /usr/src/app

# Evitar que puppeteer intente descargar Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Toolchain para node-gyp y dependencias nativas
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copiamos manifests primero para cache
COPY package*.json ./

# Instalación tolerante (evita peer conflicts) + sin auditorías
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Resto del código y build de TypeScript
COPY . .
RUN npm run build

# ============== Runtime ==============
FROM node:20-bullseye
WORKDIR /usr/src/app

# dockerize para esperar la DB
ENV DOCKERIZE_VERSION=v0.6.1
RUN apt-get update && apt-get install -y wget ca-certificates --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && wget -O - https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 | tar -C /usr/local/bin -xzvf -

# Copiamos artefactos del build
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/scripts ./scripts

ENV PORT=8080
EXPOSE 8080

# Arranque: esperar DB -> migraciones -> seed admin -> server
CMD dockerize -wait tcp://${DB_HOST:-db}:3306 -timeout 60s \
  && npx sequelize db:migrate \
  && node scripts/seedAdmin.js \
  && node dist/server.js
