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
FROM nginx:1.27-alpine

ENV PUBLIC_HTML=/usr/share/nginx/html

RUN rm -f /etc/nginx/conf.d/default.conf \
 && printf '%s\n' \
   'resolver 127.0.0.11 ipv6=off valid=10s;' \
   'set $backend http://backend:8080;' \
   '' \
   'server {' \
   '  listen 80;' \
   '  server_name _;' \
   '  root /usr/share/nginx/html;' \
   '  index index.html;' \
   '' \
   '  location /socket.io/ {' \
   '    proxy_pass $backend/socket.io/;' \
   '    proxy_http_version 1.1;' \
   '    proxy_set_header Upgrade $http_upgrade;' \
   '    proxy_set_header Connection "Upgrade";' \
   '    proxy_set_header Host $host;' \
   '    proxy_read_timeout 600s;' \
   '    proxy_send_timeout 600s;' \
   '  }' \
   '' \
   '  location ~ ^/(auth|users|tickets|contacts|whatsapp|settings|queues|messages|media|uploads)(/|$) {' \
   '    proxy_pass $backend$request_uri;' \
   '    proxy_set_header Host $host;' \
   '    proxy_set_header X-Real-IP $remote_addr;' \
   '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
   '    proxy_set_header X-Forwarded-Proto $scheme;' \
   '  }' \
   '' \
   '  location /assets/ { try_files $uri =404; access_log off; }' \
   '  location / { try_files $uri /index.html; }' \
   '}' > /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist ${PUBLIC_HTML}
EXPOSE 80

