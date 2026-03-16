FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa serve globalmente per evitare problemi
RUN npm install -g serve

# Installa dipendenze
RUN npm ci

# Copia tutto il codice
COPY . .

# Build
RUN npm run build

# Espone la porta (Railway setterà $PORT)
EXPOSE 3000

# Usa serve diretto
CMD ["serve", "-s", "dist", "-l", "3000"]
