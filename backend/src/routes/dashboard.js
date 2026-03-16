const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todayCount, weekCount, monthCount, pendingCount, totalClients] = await Promise.all([
      prisma.intervention.count({ where: { dataProgrammata: { gte: today, lt: tomorrow } } }),
      prisma.intervention.count({ where: { dataProgrammata: { gte: weekStart } } }),
      prisma.intervention.count({ where: { dataProgrammata: { gte: monthStart } } }),
      prisma.intervention.count({ where: { stato: 'PIANIFICATO' } }),
      prisma.client.count({ where: { attivo: true } })
    ]);
    
    res.json({ today: todayCount, week: weekCount, month: monthCount, pending: pendingCount, clients: totalClients });
  } catch (error) {
    res.status(500).json({ error: 'Errore statistiche' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const interventions = await prisma.intervention.findMany({
      where: { 
        dataProgrammata: { gte: new Date() },
        stato: { in: ['PIANIFICATO', 'IN_CORSO'] }
      },
      include: {
        client: { select: { ragioneSociale: true } },
        location: { select: { nomeSede: true, citta: true } }
      },
      orderBy: { dataProgrammata: 'asc' },
      take: 10
    });
    res.json(interventions);
  } catch (error) {
    res.status(500).json({ error: 'Errore prossimi interventi' });
  }
});

module.exports = router;
