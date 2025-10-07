# ============== Builder ==============
FROM node:20-bullseye AS build
WORKDIR /usr/src/app

# Solo copiamos los manifests para aprovechar la cache
COPY package*.json ./

# Antes usábamos `npm ci` (requiere package-lock perfecto).
# Usamos npm install para evitar fallo por lockfile.
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Ahora sí el resto del código
COPY . .
RUN npm run build

# ============== Runtime ==============
FROM node:20-bullseye

# dockerize para esperar a MySQL
ENV DOCKERIZE_VERSION=v0.6.1
RUN apt-get update && apt-get install -y wget ca-certificates && rm -rf /var/lib/apt/lists/* \
 && wget -O - https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 | tar -C /usr/local/bin -xzvf -

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/scripts ./scripts

ENV PORT=8080
EXPOSE 8080

CMD dockerize -wait tcp://${DB_HOST:-db}:3306 -timeout 60s \
  && npx sequelize db:migrate \
  && node scripts/seedAdmin.js \
  && node dist/server.js
