const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, generateToken, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.attivo) return res.status(401).json({ error: 'Credenziali non valide' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenziali non valide' });
    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, ruolo: user.ruolo }
    });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

router.post('/register', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, password, nome, cognome, ruolo, telefono } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email già registrata' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nome, cognome, ruolo, telefono }
    });
    res.status(201).json({ id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, ruolo: user.ruolo });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

router.get('/me', authenticate, async (req, res) => res.json(req.user));
module.exports = router;
