const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/client/:clientId', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { clientId: req.params.clientId },
      orderBy: { nomeSede: 'asc' }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero sedi' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: { client: true, interventions: { orderBy: { dataProgrammata: 'desc' }, take: 5 } }
    });
    if (!location) return res.status(404).json({ error: 'Sede non trovata' });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero sede' });
  }
});

router.post('/', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const location = await prisma.location.create({ data: req.body });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione sede' });
  }
});

router.put('/:id', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const data = req.body;
    delete data.id;
    const location = await prisma.location.update({
      where: { id: req.params.id },
      data
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell aggiornamento sede' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sede eliminata' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell eliminazione sede' });
  }
});

module.exports = router;
