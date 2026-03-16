#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     SETUP AUTOMATICO RAILWAY - HYGIENIX v2               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verifica installazione Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installando Railway CLI..."
    npm install -g @railway/cli
fi

# Login
echo "🔐 Login su Railway..."
railway login

# Chiedi nome progetto
echo ""
read -p "Nome progetto Railway (es: hygienix-v2): " PROJECT_NAME

# Inizializza progetto
echo ""
echo "🚀 Inizializzazione progetto..."
cd backend
railway init --name "$PROJECT_NAME-backend"

# Configura variabili
echo ""
echo "⚙️  Configurazione variabili ambiente..."
railway variables set DATABASE_URL="file:/data/dev.db"
railway variables set JWT_SECRET="hygienix-$(openssl rand -hex 32)"
railway variables set PORT="5000"
railway variables set NODE_ENV="production"

echo ""
echo "✅ Backend configurato!"
echo ""
echo "🔧 Ora devi:"
echo "  1. Aggiungere il Volume /data su Railway Dashboard"
echo "  2. Impostare FRONTEND_URL dopo aver deployato il frontend"
echo "  3. Deploy con: railway up"
echo ""

# Setup frontend
echo "🎨 Configurazione Frontend..."
cd ../frontend
railway init --name "$PROJECT_NAME-frontend"

echo ""
echo "⚙️  Configurazione variabili frontend..."
read -p "URL Backend (es: https://hygienix-backend.up.railway.app): " BACKEND_URL
railway variables set VITE_API_URL="${BACKEND_URL}/api"

echo ""
echo "✅ FRONTEND configurato!"
echo ""
echo "🚀 Per deployare:"
echo "  cd backend && railway up"
echo "  cd frontend && railway up"
echo ""
