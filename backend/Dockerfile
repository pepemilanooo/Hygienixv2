FROM node:20-slim

WORKDIR /app

# Installa dipendenze
COPY package*.json ./
RUN npm ci

# Copia codice
COPY . .

# Genera Prisma client
RUN npx prisma generate

# Espone porta
EXPOSE 5000

# Comando di avvio
CMD npx prisma migrate deploy && node src/server.js
