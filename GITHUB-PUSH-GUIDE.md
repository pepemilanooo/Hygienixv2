# 🚀 Push Hygienix v2 su GitHub

## Metodo 1: Script Automatico (Consigliato)

```bash
cd /home/user/hygienix-v2

# Se hai già creato la repository su GitHub:
./push-to-github.sh TUO-USERNAME

# Se hai autenticazione a 2 fattori (richiede token):
./push-to-github.sh TUO-USERNAME TUO-TOKEN
```

## Metodo 2: Manuale Passo-Passo

### Step 1: Crea Repository su GitHub

1. Vai su https://github.com/new
2. **Repository name**: `hygienix`
3. **Description**: `Gestionale Pest Control - Hygienix v2`
4. Seleziona **Public** o **Private**
5. ⚠️ **IMPORTANTE**: NON spuntare "Add a README file"
6. Clicca **Create repository**

### Step 2: Push dal Terminale

```bash
cd /home/user/hygienix-v2

# Configura remote
git remote add origin https://github.com/TUO-USERNAME/hygienix.git

# Push
git push -u origin main --force
```

### Se ti chiede password e hai 2FA:

Devi usare un **Personal Access Token**:

1. Vai su https://github.com/settings/tokens
2. Clicca **Generate new token (classic)**
3. Dai un nome (es: "Hygienix Deploy")
4. Seleziona scope: **repo** (full control)
5. Clicca **Generate token**
6. **COPIA IL TOKEN** (non si vede più dopo!)

Poi pusha con token:

```bash
cd /home/user/hygienix-v2
git remote remove origin
git remote add origin https://TUO-USERNAME:TUO-TOKEN@github.com/TUO-USERNAME/hygienix.git
git push -u origin main --force
```

## ✅ Verifica

Dopo il push, dovresti vedere:
- ✅ 55 file caricati
- ✅ Commit: "Hygienix v2.0 - Ricostruzione completa..."
- ✅ Branch: main

Visita: `https://github.com/TUO-USERNAME/hygienix`

## 🛤️ Deploy su Railway

Una volta su GitHub, deploy su Railway:

### Backend
1. https://railway.app → New Project
2. Deploy from GitHub repo
3. Imposta **Root Directory**: `backend`
4. Environment Variables:
   ```
   DATABASE_URL=file:/data/dev.db
   JWT_SECRET=hygienix-secret-key-2026
   FRONTEND_URL=https://hygienixprivate.up.railway.app
   ```
5. Aggiungi **Volume**:
   - Mount Path: `/data`
6. Deploy

### Frontend
1. New Project → Deploy from GitHub
2. Imposta **Root Directory**: `frontend`
3. Environment Variables:
   ```
   VITE_API_URL=https://privatebackend.up.railway.app/api
   ```
4. Deploy

## 🔑 Credenziali Accesso

- **Email**: `admin@hygienix.it`
- **Password**: `admin123`

## ❌ Risoluzione Problemi

### Errore: "Repository not found"
→ Crea prima la repo su GitHub (Step 1)

### Errore: "Authentication failed"
→ Usa il Personal Access Token se hai 2FA

### Errore: "Permission denied"
→ Verifica di essere owner della repository

### Errore: "Updates were rejected"
→ Aggiungi `--force` al comando push
