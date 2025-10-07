# Backend build/runtime (Debian bookworm con apt vigente)
FROM node:20-bookworm

# Evitar prompts y asegurar certificados
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates wget gnupg curl fonts-dejavu fonts-liberation fonts-freefont-ttf libxss1 \
  && rm -rf /var/lib/apt/lists/*

# Instalar dockerize (esperar DB en el entrypoint)
ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
  && rm dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz

# Instalar Google Chrome de forma compatible (keyring moderno)
RUN install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-linux.gpg \
  && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-linux.gpg] http://dl.google.com/linux/chrome/deb stable main" \
     | tee /etc/apt/sources.list.d/google-chrome.list > /dev/null \
  && apt-get update && apt-get install -y --no-install-recommends google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

# dumb-init (init simple para señales limpias)
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Puppeteer usará el Chrome del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=google-chrome-stable

WORKDIR /usr/src/app

# Dependencias y build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Variables por defecto (ajusta en Docker Compose)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init","--"]
CMD dockerize -wait tcp://${DB_HOST:-db}:3306 -timeout 120s \
  && npx sequelize db:migrate \
  && node dist/server.js
