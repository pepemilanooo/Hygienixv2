#!/bin/bash

REPO_URL="https://github.com/pepemilanooo/Hygienixv2.git"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     PUSH AUTOMATICO SU:                                    ║"
echo "║     $REPO_URL"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configura git
git config user.email "deploy@hygienix.it"
git config user.name "Hygienix Deploy"

# Rimuovi remote esistente e aggiungi nuovo
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo "📡 Remote configurato:"
git remote -v
echo ""

# Push
echo "🚀 Eseguendo push..."
if git push -u origin main --force; then
    echo ""
    echo "✅ SUCCESSO!"
    echo ""
    echo "🔗 Repository: $REPO_URL"
    echo ""
    echo "Prossimi passi:"
    echo "  1. Vai su Railway: https://railway.app"
    echo "  2. New Project → Deploy from GitHub"
    echo "  3. Seleziona 'Hygienixv2'"
    echo ""
else
    echo ""
    echo "❌ PUSH FALLITO"
    echo ""
    echo "Cause comuni:"
    echo "  • Repository non esiste su GitHub"
    echo "  • Permessi insufficienti (devi essere owner)"
    echo "  • Autenticazione richiesta"
    echo ""
    echo "Soluzione:"
    echo "  1. Verifica che la repo esista:"
    echo "     https://github.com/pepemilanooo/Hygienixv2"
    echo ""
    echo "  2. Se hai 2FA, usa token:"
    echo "     git remote set-url origin https://USERNAME:TOKEN@github.com/..."
    echo ""
fi
