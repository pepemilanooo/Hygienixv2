#!/bin/sh
# Script di avvio per Railway - esegue migrazione e avvia server
echo "Starting Hygienix v2..."
echo "Running database migration..."
npx prisma migrate deploy
echo "Starting server..."
node src/server.js
