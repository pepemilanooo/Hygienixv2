const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { generateInterventionReport } = require('../utils/pdfGenerator');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/intervention/:id/pdf', async (req, res) => {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: req.params.id },
      include: { client: true, location: true, tecnico: true, photos: true }
    });
    if (!intervention) return res.status(404).json({ error: 'Intervento non trovato' });
    const pdfUrl = await generateInterventionReport(intervention);
    await prisma.intervention.update({ where: { id: req.params.id }, data: { reportPdfUrl: pdfUrl } });
    res.json({ success: true, pdfUrl, message: 'Report generato con successo' });
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: 'Errore nella generazione del PDF' });
  }
});

module.exports = router;
