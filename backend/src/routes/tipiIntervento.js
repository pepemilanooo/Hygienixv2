const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/schede');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scheda-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo file PDF sono permessi'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const tipi = await prisma.tipoIntervento.findMany({
      where: { attivo: true },
      orderBy: { codice: 'asc' }
    });
    res.json(tipi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const tipo = await prisma.tipoIntervento.findUnique({ where: { id: req.params.id } });
    if (!tipo) return res.status(404).json({ error: 'Tipo intervento non trovato' });
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { codice, nome, descrizione, colore } = req.body;
    if (!codice || !nome) return res.status(400).json({ error: 'Codice e nome sono obbligatori' });
    const tipo = await prisma.tipoIntervento.create({ data: { codice, nome, descrizione, colore } });
    res.status(201).json(tipo);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Codice già esistente' });
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { codice, nome, descrizione, colore, attivo } = req.body;
    const tipo = await prisma.tipoIntervento.update({
      where: { id: req.params.id },
      data: { codice, nome, descrizione, colore, attivo }
    });
    res.json(tipo);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Codice già esistente' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.tipoIntervento.update({ where: { id: req.params.id }, data: { attivo: false } });
    res.json({ message: 'Tipo intervento disattivato' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/scheda', authenticate, requireRole('ADMIN'), upload.single('scheda'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nessun file caricato' });
    const schedaUrl = `/uploads/schede/${req.file.filename}`;
    const tipo = await prisma.tipoIntervento.update({
      where: { id: req.params.id },
      data: { schedaPdfUrl: schedaUrl }
    });
    res.json({ message: 'Scheda tecnica caricata', tipo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
