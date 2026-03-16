#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         HYGIENIX v2 - PUSH SU GITHUB AUTOMATICO          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verifica argomenti
if [ -z "$1" ]; then
    echo "❌ ERRORE: Devi specificare il tuo username GitHub"
    echo ""
    echo "Uso:"
    echo "  ./push-to-github.sh TUO-USERNAME        (per repo pubblica)"
    echo "  ./push-to-github.sh TUO-USERNAME TOKEN  (con token)"
    echo ""
    echo "Per creare un token:"
echo "  1. Vai su https://github.com/settings/tokens"
    echo "  2. Clicca 'Generate new token (classic)'"
    echo "  3. Seleziona scope 'repo'"
    echo "  4. Copia il token e usalo qui"
    exit 1
fi

USERNAME=$1
TOKEN=$2
REPO_NAME="hygienix"

# Configura git
git config user.email "deploy@hygienix.local"
git config user.name "Hygienix Deploy"

# Rimuovi remote esistenti se presenti
git remote remove origin 2>/dev/null

# Configura remote
if [ -n "$TOKEN" ]; then
    echo "🔐 Configurazione con token..."
    git remote add origin "https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
else
    echo "🔗 Configurazione senza token (chiederà password)..."
    git remote add origin "https://github.com/${USERNAME}/${REPO_NAME}.git"
fi

# Verifica connessione
echo ""
echo "📡 Verifica connessione a GitHub..."
if ! git ls-remote origin &>/dev/null; then
    echo "⚠️  ATTENZIONE: Repository remota non trovata o non accessibile"
    echo ""
    echo "Devi creare la repository su GitHub prima:"
    echo "  1. Vai su https://github.com/new"
    echo "  2. Nome repository: ${REPO_NAME}"
    echo "  3. NON inizializzare con README"
    echo "  4. Clicca 'Create repository'"
    echo ""
    read -p "Premi INVIO dopo aver creato la repository..."
fi

# Push
echo ""
echo "🚀 Push in corso..."
if git push -u origin main --force; then
    echo ""
    echo "✅ SUCCESSO!"
    echo ""
    echo "📎 Repository: https://github.com/${USERNAME}/${REPO_NAME}"
    echo ""
    echo "Prossimi passi per Railway:"
    echo "  1. Vai su https://railway.app"
    echo "  2. New Project → Deploy from GitHub"
    echo "  3. Seleziona '${REPO_NAME}'"
    echo "  4. Configura Backend e Frontend"
else
    echo ""
    echo "❌ ERRORE nel push"
    echo ""
    echo "Possibili cause:"
    echo "  - Repository non esiste su GitHub"
    echo "  - Token non valido o scaduto"
    echo "  - Username errato"
    echo ""
    echo "Soluzione:"
    echo "  1. Crea repo su https://github.com/new"
    echo "  2. Verifica username: ${USERNAME}"
    echo "  3. Se hai 2FA, usa il token personale"
fi
