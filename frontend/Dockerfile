# ---- build ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# toolchain por si hay deps nativas
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Pasar la URL del backend en build (Vite usa VITE_* en build)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build \
 && if [ -d build ]; then mv build dist; fi

# ---- runtime ----
FROM nginx:alpine

# Directorio estándar de Nginx para estáticos
ENV PUBLIC_HTML=/usr/share/nginx/html

# Crear un default.conf MUY simple y válido (SPA: react/vite)
RUN rm -f /etc/nginx/conf.d/default.conf \
 && printf 'server {\n  listen 80;\n  server_name _;\n  root %s;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' "$PUBLIC_HTML" > /etc/nginx/conf.d/default.conf

# Copiar build del frontend
COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}

EXPOSE 80
