# 🚀 Deploy Hygienix v2 su Railway - Guida Completa

## ⚡ METODO VELOCE (3 minuti)

### Step 1: Backend
1. Vai su https://railway.app/dashboard
2. Clicca **"New Project"**
3. Seleziona **"Deploy from GitHub repo"**
4. Scegli il tuo repository `Hygienixv2`
5. Clicca sull'icona ⚙️ (Settings) del servizio
6. In **"Root Directory"** scrivi: `backend`
7. Vai su **"Variables"** e aggiungi:

```env
DATABASE_URL=file:/data/dev.db
JWT_SECRET=hygienix-super-secret-2026-safe-key
FRONTEND_URL=https://hygienixv2-frontend.up.railway.app
PORT=5000
NODE_ENV=production
```

8. Vai su **"Volumes"** e clicca **"New Volume"**:
   - Mount Path: `/data`
   - Name: `database`

9. Clicca **"Deploy"** ✅

### Step 2: Frontend  
1. Nello stesso progetto, clicca **"New"** → **"Service"**
2. Seleziona **"Deploy from GitHub repo"**
3. Scegli `Hygienixv2`
4. In **"Root Directory"** scrivi: `frontend`
5. Vai su **"Variables"** e aggiungi:

```env
VITE_API_URL=https://hygienixv2-backend.up.railway.app/api
```

6. Clicca **"Deploy"** ✅

### Step 3: Configura Dominio
1. Nel servizio **frontend**, vai su **"Settings"** → **"Public Networking"**
2. Clicca **"Generate Domain"** (o usa il tuo dominio)
3. Copia l'URL e aggiorna la variabile `FRONTEND_URL` nel backend
4. Redeploy backend

---

## 🔧 IMPOSTAZIONI DETTAGLIATE

### Backend - Environment Variables

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `DATABASE_URL` | `file:/data/dev.db` | Path database SQLite sul volume |
| `JWT_SECRET` | stringa casuale lunga | Chiave per i token JWT |
| `FRONTEND_URL` | URL frontend | Per CORS |
| `PORT` | `5000` | Porta del server |
| `NODE_ENV` | `production` | Modalità produzione |

### Backend - Build Command
```bash
npx prisma migrate deploy && npm start
```

Questo comando:
1. Applica le migrazioni al database
2. Avvia il server Node.js

### Frontend - Build Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (default)
- **Start Command**: `npx serve -s dist -l $PORT`
- **Output Directory**: `dist`

---

## 🐛 RISOLUZIONE PROBLEMI

### Errore: "P3009 migrate found failed migrations"
**Soluzione**: Il volume `/data` è già configurato correttamente. Se hai problemi:
1. Vai su Volumes in Railway
2. Elimina il volume esistente
3. Ricrea con Mount Path `/data`
4. Redeploy

### Errore: "Cannot find module"
**Soluzione**: 
1. Vai in Settings del servizio
2. Clicca **"Clear Build Cache"**
3. Redeploy

### Errore CORS
**Soluzione**: Verifica che `FRONTEND_URL` nel backend corrisponda esattamente all'URL del frontend (con https://)

### Database non persistente
**Soluzione**: Assicurati di aver creato il Volume con Mount Path `/data` (non `/app/data`)

---

## ✅ VERIFICA DEPLOY

Dopo il deploy, verifica:

1. **Health Check Backend**:
   ```
   https://TUO-BACKEND.up.railway.app/api/health
   ```
   Deve rispondere: `{"status":"ok"}`

2. **Login API**:
   ```bash
   curl -X POST https://TUO-BACKEND.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hygienix.it","password":"admin123"}'
   ```

3. **Frontend**: Apri l'URL del frontend e prova a fare login

---

## 🔄 REDEPLOY AUTOMATICO

Ogni volta che fai `git push` su GitHub, Railway ricostruisce automaticamente!

Per forzare un redeploy manuale:
1. Vai su Railway Dashboard
2. Seleziona il servizio
3. Clicca **"Redeploy"**

---

## 💰 COSTI

Railway offre:
- **$5/mese** credito gratuito (studenti/open source)
- Poi ~$5/mese per progetto piccolo
- Paghi solo quando usi (sleep automatico)

---

## 📞 SUPPORTO

Se hai problemi:
1. Controlla i logs in Railway (tab "Deployments")
2. Verifica le variabili d'ambiente
3. Controlla che il volume sia montato correttamente
