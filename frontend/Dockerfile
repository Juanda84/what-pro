# ---- build ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# (opcional) deja esto por si en el futuro el bundle usa variables de vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build \
 && if [ -d build ]; then mv build dist; fi

# ---- runtime ----
FROM nginx:alpine

ENV PUBLIC_HTML=/usr/share/nginx/html

# Default.conf con SPA + PROXY a backend
RUN rm -f /etc/nginx/conf.d/default.conf \
 && printf '%s\n' \
   'server {' \
   '  listen 80;' \
   '  server_name _;' \
   '  root /usr/share/nginx/html;' \
   '  index index.html;' \
   '' \
   '  # WebSocket/socket.io -> backend' \
   '  location /socket.io/ {' \
   '    proxy_pass http://backend:8080;' \
   '    proxy_http_version 1.1;' \
   '    proxy_set_header Upgrade $http_upgrade;' \
   '    proxy_set_header Connection "Upgrade";' \
   '    proxy_set_header Host $host;' \
   '  }' \
   '' \
   '  # API/Auth -> backend' \
   '  location /auth/ {' \
   '    proxy_pass http://backend:8080/auth/;' \
   '    proxy_set_header Host $host;' \
   '    proxy_set_header X-Real-IP $remote_addr;' \
   '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
   '    proxy_set_header X-Forwarded-Proto $scheme;' \
   '  }' \
   '  location /api/ {' \
   '    proxy_pass http://backend:8080/api/;' \
   '    proxy_set_header Host $host;' \
   '    proxy_set_header X-Real-IP $remote_addr;' \
   '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
   '    proxy_set_header X-Forwarded-Proto $scheme;' \
   '  }' \
   '' \
   '  # Resto de rutas: SPA' \
   '  location / {' \
   '    try_files $uri /index.html;' \
   '  }' \
   '}' > /etc/nginx/conf.d/default.conf

# Copia del build
COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}

EXPOSE 80
