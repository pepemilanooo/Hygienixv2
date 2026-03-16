# Hygienix v2 - Variabili d'Ambiente Railway

## Backend Variables (OBBLIGATORIE)

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
JWT_SECRET=hygienix-secret-key-2026-sicura
PORT=5000
NODE_ENV=production

# Frontend URL (per CORS)
FRONTEND_URL=https://hygienixv2.up.railway.app
```

## Backend Variables (Opzionali - per Notifiche)

```env
# Email SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=la-tua-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# SMS Twilio
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE=+393471234567

# Info Azienda
COMPANY_PHONE=0574-123456
COMPANY_NAME=Hygienix Srl
```

## Frontend Variables (OBBLIGATORIE)

```env
VITE_API_URL=https://backend-production-87a6.up.railway.app
```

---

## Istruzioni Deploy

### 1. Backend
- Vai su Railway → Settings → Variables
- Aggiungi tutte le variabili sopra
- Clicca "Redeploy"
- Verifica che risponda su `/api/health`

### 2. Frontend
- Assicurati che `VITE_API_URL` punti al backend
- Clicca "Redeploy"
- Verifica che risponda

---

## Features Attive

✅ **Core**: Auth, Clienti, Sedi, Interventi, Dashboard
✅ **Notifiche**: Email/SMS automatiche (richiede SMTP/Twilio)
✅ **Portale Clienti**: Accesso self-service per clienti
✅ **PWA**: Offline support, installabile su mobile
✅ **PDF**: Report e certificati
