# -------- build --------
FROM node:20-alpine AS build
WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Usa npm ci si hay lockfile; si no, o si falla, usa npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund || npm install --no-audit --no-fund --legacy-peer-deps ; \
    else \
      npm install --no-audit --no-fund --legacy-peer-deps ; \
    fi

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build \
 && if [ -d build ]; then mv build dist; fi

# -------- runtime --------
# ---- runtime ----
# ---- runtime ----
FROM nginx:alpine
ENV PUBLIC_HTML=/usr/share/nginx/html

RUN rm -f /etc/nginx/conf.d/default.conf \
 && printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  # === WebSocket / Socket.IO ===' \
'  location /socket.io/ {' \
'    proxy_pass http://backend:8080;' \
'    proxy_http_version 1.1;' \
'    proxy_set_header Upgrade $http_upgrade;' \
'    proxy_set_header Connection "Upgrade";' \
'    proxy_set_header Host $host;' \
'  }' \
'' \
'  # === Endpoints REST que el frontend llama sin prefijo /api ===' \
'  location ^~ /auth/          { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /users          { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /settings       { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /whatsapp       { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /queues         { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /quickAnswers   { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /tickets        { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /messages       { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /contacts       { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'  location ^~ /media          { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'' \
'  # (si tu backend también expone /api, lo dejamos cubierto igual)' \
'  location ^~ /api/           { proxy_pass http://backend:8080; proxy_set_header Host $host; }' \
'' \
'  # === SPA: todo lo demás sirve index.html ===' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/default.conf


COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}
EXPOSE 80

