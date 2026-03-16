const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search, tipo, attivo } = req.query;
    const where = {};
    if (tipo) where.tipo = tipo;
    if (attivo !== undefined) where.attivo = attivo === 'true';
    if (search) {
      where.OR = [
        { ragioneSociale: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search } }
      ];
    }
    const clients = await prisma.client.findMany({
      where,
      include: { locations: true, _count: { select: { interventions: true } } },
      orderBy: { ragioneSociale: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero clienti' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { 
        locations: true, 
        interventions: { orderBy: { dataProgrammata: 'desc' }, take: 10 },
        contratti: true
      }
    });
    if (!client) return res.status(404).json({ error: 'Cliente non trovato' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero cliente' });
  }
});

router.post('/', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const data = req.body;
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione cliente' });
  }
});

router.put('/:id', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  try {
    const data = req.body;
    delete data.id; // Prevent ID update
    delete data.createdAt;
    delete data.updatedAt;
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell aggiornamento cliente' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cliente eliminato' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell eliminazione cliente' });
  }
});

module.exports = router;
