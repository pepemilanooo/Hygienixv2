# Istruzioni per Push su GitHub

## Opzione 1: Push su Repository Esistente

```bash
# Inizializza git
cd /home/user/hygienix-v2
git init

# Aggiungi remote (sostituisci con il tuo repo)
git remote add origin https://github.com/TUO-USERNAME/hygienix.git

# Se il repo ha già contenuto, fai pull prima
git pull origin main --allow-unrelated-histories

# Oppure forza push (ATTENZIONE: sovrascrive tutto!)
git add .
git commit -m "Hygienix v2 - Ricostruzione completa con SQLite"
git push -f origin main
```

## Opzione 2: Crea Nuovo Repository

1. Vai su https://github.com/new
2. Crea repository "hygienix" (senza README)
3. Esegui:

```bash
cd /home/user/hygienix-v2
git init
git add .
git commit -m "Initial commit: Hygienix v2"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/hygienix.git
git push -u origin main
```

## Deploy su Railway

### Backend
1. Dashboard Railway → New Project → Deploy from GitHub
2. Seleziona repository hygienix
3. Imposta root directory: `backend`
4. Aggiungi Environment Variables:
   - `DATABASE_URL` = `file:/data/dev.db`
   - `JWT_SECRET` = `hygienix-secret-key-2026`
   - `FRONTEND_URL` = `https://hygienixprivate.up.railway.app`
5. Aggiungi Volume:
   - Mount path: `/data`
   - Nome: `database`
6. Deploy!

### Frontend
1. New Project → Deploy from GitHub
2. Imposta root directory: `frontend`
3. Environment Variables:
   - `VITE_API_URL` = `https://privatebackend.up.railway.app/api`
4. Deploy!

## Credenziali Accesso

- **Email**: admin@hygienix.it
- **Password**: admin123

## Verifica Funzionamento

1. Backend health check: `https://TUO-BACKEND.railway.app/api/health`
2. Login API: `POST /api/auth/login`
3. Frontend: `https://TUO-FRONTEND.railway.app`
