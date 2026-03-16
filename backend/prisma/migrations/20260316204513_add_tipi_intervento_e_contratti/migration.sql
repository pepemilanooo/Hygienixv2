-- CreateTable
CREATE TABLE "tipi_intervento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "colore" TEXT NOT NULL DEFAULT '#2563eb',
    "schedaPdfUrl" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contratti" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "oggetto" TEXT NOT NULL,
    "dataInizio" DATETIME NOT NULL,
    "dataFine" DATETIME,
    "importo" REAL,
    "frequenza" TEXT NOT NULL DEFAULT 'MENSILE',
    "note" TEXT,
    "fileUrl" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratti_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CERTIFICATO',
    "fileUrl" TEXT NOT NULL,
    "dataDocumento" DATETIME,
    "visibileCliente" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointment_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "locationId" TEXT,
    "dataPreferita" DATETIME NOT NULL,
    "oraPreferita" TEXT,
    "tipoIntervento" TEXT,
    "note" TEXT,
    "stato" TEXT NOT NULL DEFAULT 'RICHIESTO',
    "rispostaAdmin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointment_requests_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clients" (
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
    "portalPassword" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_clients" ("attivo", "cap", "citta", "codiceFiscale", "createdAt", "email", "emailReferente", "id", "indirizzoLegale", "note", "piva", "provincia", "ragioneSociale", "referente", "telefono", "telefonoReferente", "telefonoSecondario", "tipo", "updatedAt") SELECT "attivo", "cap", "citta", "codiceFiscale", "createdAt", "email", "emailReferente", "id", "indirizzoLegale", "note", "piva", "provincia", "ragioneSociale", "referente", "telefono", "telefonoReferente", "telefonoSecondario", "tipo", "updatedAt" FROM "clients";
DROP TABLE "clients";
ALTER TABLE "new_clients" RENAME TO "clients";
CREATE TABLE "new_interventions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "tipoInterventoId" TEXT,
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
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interventions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interventions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interventions_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "interventions_tipoInterventoId_fkey" FOREIGN KEY ("tipoInterventoId") REFERENCES "tipi_intervento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_interventions" ("checkInLat", "checkInLng", "checkOutLat", "checkOutLng", "clientId", "condizioniMeteo", "createdAt", "dataEsecuzione", "dataFine", "dataProgrammata", "datiSopralluogo", "descrizione", "firmaClienteUrl", "firmaTecnicoUrl", "id", "locationId", "nomeFirmaCliente", "noteInterne", "noteTecnico", "priorita", "reportPdfUrl", "risultato", "stato", "tecnicoId", "temperatura", "tipoIntervento", "umidita", "updatedAt") SELECT "checkInLat", "checkInLng", "checkOutLat", "checkOutLng", "clientId", "condizioniMeteo", "createdAt", "dataEsecuzione", "dataFine", "dataProgrammata", "datiSopralluogo", "descrizione", "firmaClienteUrl", "firmaTecnicoUrl", "id", "locationId", "nomeFirmaCliente", "noteInterne", "noteTecnico", "priorita", "reportPdfUrl", "risultato", "stato", "tecnicoId", "temperatura", "tipoIntervento", "umidita", "updatedAt" FROM "interventions";
DROP TABLE "interventions";
ALTER TABLE "new_interventions" RENAME TO "interventions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "tipi_intervento_codice_key" ON "tipi_intervento"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "contratti_numero_key" ON "contratti"("numero");
