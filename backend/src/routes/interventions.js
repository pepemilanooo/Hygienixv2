const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { from, to, tecnicoId, stato, clientId } = req.query;
    const where = {};
    if (from || to) {
      where.dataProgrammata = {};
      if (from) where.dataProgrammata.gte = new Date(from);
      if (to) where.dataProgrammata.lte = new Date(to);
    }
    if (tecnicoId) where.tecnicoId = tecnicoId;
    if (stato) where.stato = stato;
    if (clientId) where.clientId = clientId;
    
    // Tecnici vedono solo i propri interventi
    if (req.user.ruolo === 'TECNICO') {
      where.tecnicoId = req.user.id;
    }
    
    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        client: { select: { id: true, ragioneSociale: true } },
        location: { select: { id: true, nomeSede: true, indirizzo: true, citta: true } },
        tecnico: { select: { id: true, nome: true, cognome: true } },
        photos: true,
        _count: { select: { photos: true } }
      },
      orderBy: { dataProgrammata: 'asc' }
    });
    res.json(interventions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero interventi' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        location: true,
        tecnico: { select: { id: true, nome: true, cognome: true, telefono: true } },
        photos: true
      }
    });
    if (!intervention) return res.status(404).json({ error: 'Intervento non trovato' });
    
    // Tecnici vedono solo i propri interventi
    if (req.user.ruolo === 'TECNICO' && intervention.tecnicoId !== req.user.id) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero intervento' });
  }
});

router.post('/', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const intervention = await prisma.intervention.create({
      data: req.body,
      include: {
        client: { select: { ragioneSociale: true } },
        location: { select: { nomeSede: true } },
        tecnico: { select: { nome: true, cognome: true } }
      }
    });
    res.status(201).json(intervention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione intervento' });
  }
});

router.put('/:id', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const data = req.body;
    delete data.id;
    const intervention = await prisma.intervention.update({
      where: { id: req.params.id },
      data
    });
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell aggiornamento intervento' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.intervention.delete({ where: { id: req.params.id } });
    res.json({ message: 'Intervento eliminato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell eliminazione intervento' });
  }
});

// Azioni tecnico
router.post('/:id/checkin', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const intervention = await prisma.intervention.update({
      where: { id: req.params.id },
      data: { 
        stato: 'IN_CORSO', 
        dataEsecuzione: new Date(),
        checkInLat: lat,
        checkInLng: lng
      }
    });
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Errore check-in' });
  }
});

router.post('/:id/checkout', async (req, res) => {
  try {
    const { lat, lng, noteTecnico, risultato } = req.body;
    const intervention = await prisma.intervention.update({
      where: { id: req.params.id },
      data: { 
        stato: 'COMPLETATO', 
        dataFine: new Date(),
        checkOutLat: lat,
        checkOutLng: lng,
        noteTecnico,
        risultato
      }
    });
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Errore check-out' });
  }
});

router.post('/:id/firma-cliente', async (req, res) => {
  try {
    const { firmaUrl, nomeFirma } = req.body;
    const intervention = await prisma.intervention.update({
      where: { id: req.params.id },
      data: { firmaClienteUrl: firmaUrl, nomeFirmaCliente: nomeFirma }
    });
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Errore salvataggio firma' });
  }
});

module.exports = router;
