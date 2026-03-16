-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "telefono" TEXT,
    "ruolo" TEXT NOT NULL DEFAULT 'TECNICO',
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ragioneSociale" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'AZIENDA',
    "piva" TEXT,
    "codiceFiscale" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "telefonoSecondario" TEXT,
    "indirizzoLegale" TEXT,
    "citta" TEXT,
    "cap" TEXT,
    "provincia" TEXT,
    "referente" TEXT,
    "telefonoReferente" TEXT,
    "emailReferente" TEXT,
    "note" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "nomeSede" TEXT NOT NULL,
    "tipoStruttura" TEXT NOT NULL DEFAULT 'COMMERCIALE',
    "indirizzo" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "latitudine" REAL,
    "longitudine" REAL,
    "numeroPiani" INTEGER,
    "pianoSpecifico" TEXT,
    "scala" TEXT,
    "interno" TEXT,
    "mqTotali" REAL,
    "mqInterni" REAL,
    "mqEsterni" REAL,
    "tipoAccesso" TEXT NOT NULL DEFAULT 'PORTINERIA',
    "noteAccesso" TEXT,
    "contattoPortineria" TEXT,
    "telefonoPortineria" TEXT,
    "codiceAccesso" TEXT,
    "geofenceRadius" INTEGER NOT NULL DEFAULT 100,
    "noteStruttura" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "locations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "dataProgrammata" DATETIME NOT NULL,
    "dataEsecuzione" DATETIME,
    "dataFine" DATETIME,
    "stato" TEXT NOT NULL DEFAULT 'PIANIFICATO',
    "priorita" TEXT NOT NULL DEFAULT 'NORMALE',
    "tipoIntervento" TEXT,
    "descrizione" TEXT,
    "noteTecnico" TEXT,
    "noteInterne" TEXT,
    "risultato" TEXT,
    "temperatura" REAL,
    "umidita" REAL,
    "condizioniMeteo" TEXT,
    "checkInLat" REAL,
    "checkInLng" REAL,
    "checkOutLat" REAL,
    "checkOutLng" REAL,
    "firmaTecnicoUrl" TEXT,
    "firmaClienteUrl" TEXT,
    "nomeFirmaCliente" TEXT,
    "reportPdfUrl" TEXT,
    "datiSopralluogo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interventions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interventions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interventions_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interventionId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'DURANTE',
    "descrizione" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photos_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
