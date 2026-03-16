FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia codice sorgente
COPY . .

# Build applicazione
RUN npm run build

# Espone porta
EXPOSE 3000

# Serve con npx serve
CMD ["npx", "serve", "-s", "dist", "-p", "3000"]
