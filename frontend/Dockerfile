FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa serve globalmente
RUN npm install -g serve

# Installa dipendenze
RUN npm install

# Copia tutto il codice
COPY . .

# Build
RUN npm run build

# Espone porta
EXPOSE 3000

# Usa shell per espandere $PORT correttamente
CMD sh -c "serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"
