# ---- build ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# toolchain por si hay deps nativas
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# copia todo y compila
COPY . .
RUN npm run build \
 && if [ -d build ]; then mv build dist; fi

# ---- runtime ----
FROM nginx:alpine

RUN apk add --no-cache jq openssl wget

ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
 && rm dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz

ENV PUBLIC_HTML=/var/www/public/

COPY .docker/nginx /etc/nginx/
COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}

COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh

EXPOSE 80

