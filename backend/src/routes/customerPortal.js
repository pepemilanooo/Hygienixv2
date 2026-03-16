const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware autenticazione cliente
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Accesso riservato ai clienti' });
    }

    req.customerId = decoded.customerId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token non valido' });
  }
};

// POST /api/customer/login - Login cliente con email e password temporanea
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await prisma.client.findFirst({
      where: { email },
      include: { locations: true }
    });

    if (!client || !client.portalPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const valid = await bcrypt.compare(password, client.portalPassword);
    if (!valid) return res.status(401).json({ error: 'Credenziali non valide' });

    const token = jwt.sign(
      { customerId: client.id, email: client.email, type: 'CUSTOMER' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      customer: {
        id: client.id,
        ragioneSociale: client.ragioneSociale,
        email: client.email,
        telefono: client.telefono,
        piva: client.piva
      }
    });
  } catch (error) {
    console.error('Errore login cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customer/profile - Profilo cliente
router.get('/profile', authenticateCustomer, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.customerId },
      include: {
        locations: {
          where: { attivo: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) return res.status(404).json({ error: 'Cliente non trovato' });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customer/interventions - Storico interventi
router.get('/interventions', authenticateCustomer, async (req, res) => {
  try {
    const { status, from, to, page = 1, limit = 10 } = req.query;

    const where = { clientId: req.customerId };
    if (status) where.stato = status;
    if (from || to) {
      where.dataProgrammata = {};
      if (from) where.dataProgrammata.gte = new Date(from);
      if (to) where.dataProgrammata.lte = new Date(to);
    }

    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        location: true,
        technician: {
          select: {
            nome: true,
            cognome: true,
            telefono: true
          }
        },
        photos: true
      },
      orderBy: { dataProgrammata: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.intervention.count({ where });

    res.json({
      interventions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customer/interventions/:id - Dettaglio intervento
router.get('/interventions/:id', authenticateCustomer, async (req, res) => {
  try {
    const intervention = await prisma.intervention.findFirst({
      where: {
        id: req.params.id,
        clientId: req.customerId
      },
      include: {
        location: true,
        technician: {
          select: {
            nome: true,
            cognome: true,
            telefono: true,
            email: true
          }
        },
        photos: true
      }
    });

    if (!intervention) return res.status(404).json({ error: 'Intervento non trovato' });

    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customer/documents - Documenti/certificati
router.get('/documents', authenticateCustomer, async (req, res) => {
  try {
    const { type } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        clientId: req.customerId,
        tipo: type || undefined,
        visibileCliente: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customer/appointments - Richiedi nuovo appuntamento
router.post('/appointments', authenticateCustomer, async (req, res) => {
  try {
    const { locationId, dataPreferita, oraPreferita, tipoIntervento, note } = req.body;

    const request = await prisma.appointmentRequest.create({
      data: {
        clientId: req.customerId,
        locationId,
        dataPreferita: new Date(dataPreferita),
        oraPreferita,
        tipoIntervento,
        note,
        stato: 'RICHIESTO',
        createdAt: new Date()
      }
    });

    // Notifica admin via email (opzionale)
    res.json({
      success: true,
      message: 'Richiesta inviata con successo. Sarai contattato presto.',
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customer/change-password - Cambio password
router.post('/change-password', authenticateCustomer, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const client = await prisma.client.findUnique({
      where: { id: req.customerId }
    });

    const valid = await bcrypt.compare(oldPassword, client.portalPassword);
    if (!valid) return res.status(400).json({ error: 'Password attuale non corretta' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.client.update({
      where: { id: req.customerId },
      data: { portalPassword: hashed }
    });

    res.json({ success: true, message: 'Password aggiornata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
