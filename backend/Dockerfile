FROM node:20-slim

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
CMD npx prisma migrate deploy && node src/server.js
