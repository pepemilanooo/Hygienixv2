# Hygienix v2 - Pest Control Management System

Gestionale completo per aziende di disinfestazione e pest control con funzionalità 2026.

## Caratteristiche

- **Backend**: Node.js + Express + Prisma + SQLite
- **Frontend**: React + Vite + Tailwind CSS
- **Autenticazione**: JWT con ruoli (Admin/Operatore/Tecnico)
- **Mobile**: PWA-ready per tecnici sul campo
- **AI**: Pronto per riconoscimento peste via foto
- **IoT**: Webhook per smart traps

## Deploy su Railway

### Backend
1. Crea nuovo progetto su Railway
2. Collega repository GitHub
3. Aggiungi variabili ambiente:
   - `DATABASE_URL` = `file:/data/dev.db`
   - `JWT_SECRET` = chiave segreta
   - `FRONTEND_URL` = URL frontend Railway
4. Aggiungi volume: Mount `/data` su `/data`
5. Deploy!

### Frontend
1. Crea nuovo progetto su Railway
2. Collega repository GitHub
3. Aggiungi variabili:
   - `VITE_API_URL` = URL backend + `/api`

## Credenziali Default

- Email: `admin@hygienix.it`
- Password: `admin123`

## Struttura Progetto

```
hygienix-v2/
├── backend/          # API Node.js
│   ├── prisma/       # Schema database
│   ├── src/routes/   # API endpoints
│   └── uploads/      # File caricati
└── frontend/         # React app
    ├── src/pages/    # Pagine
    └── src/components/
```

## API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/clients` - Lista clienti
- `POST /api/clients` - Crea cliente
- `PUT /api/clients/:id` - Aggiorna cliente
- `GET /api/interventions` - Lista interventi
- `POST /api/interventions` - Crea intervento
- `POST /api/upload/image` - Upload immagine
