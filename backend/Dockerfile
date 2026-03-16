FROM node:20-slim

# Installa OpenSSL e altre dipendenze di sistema richieste da Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia prima i file necessari
COPY package*.json ./
COPY prisma ./prisma/

# Installa dipendenze
RUN npm ci

# Genera Prisma client (dopo aver copiato i file prisma)
RUN npx prisma generate

# Copia il resto del codice
COPY . .

# Espone porta
EXPOSE 5000

# Comando di avvio
CMD npx prisma migrate deploy && node prisma/seed.js && node src/server.js
