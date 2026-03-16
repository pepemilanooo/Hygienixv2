const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications/send - Invia notifica manuale (solo admin)
router.post('/send', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { interventionId, type } = req.body;
    
    if (!interventionId || !type) {
      return res.status(400).json({ error: 'interventionId e type sono richiesti' });
    }

    switch (type) {
      case 'EMAIL_CONFIRMATION':
        await notificationService.sendAppointmentConfirmation(interventionId);
        break;
      case 'SMS_REMINDER':
        await notificationService.sendSMSReminder(interventionId);
        break;
      case 'TECHNICIAN_NOTIFY':
        await notificationService.notifyTechnician(interventionId);
        break;
      default:
        return res.status(400).json({ error: 'Tipo notifica non valido' });
    }

    res.json({ success: true, message: 'Notifica inviata con successo' });
  } catch (error) {
    console.error('Errore invio notifica:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/test - Test configurazione email/SMS (solo admin)
router.post('/test', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { type, to } = req.body;
    
    if (type === 'EMAIL') {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to || process.env.SMTP_USER,
        subject: 'Test Hygienix',
        html: '<h1>Test email configurazione riuscito!</h1>'
      });
      
      res.json({ success: true, message: 'Email di test inviata' });
    } 
    else if (type === 'SMS') {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      
      await client.messages.create({
        body: 'Test SMS Hygienix - Configurazione riuscita!',
        from: process.env.TWILIO_PHONE,
        to: to
      });
      
      res.json({ success: true, message: 'SMS di test inviato' });
    }
    else {
      res.status(400).json({ error: 'Tipo test non valido (EMAIL o SMS)' });
    }
  } catch (error) {
    console.error('Errore test notifica:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/status - Stato configurazione
router.get('/status', authenticate, async (req, res) => {
  const status = {
    email: {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER ? '***' : null
    },
    sms: {
      configured: !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_PHONE),
      phone: process.env.TWILIO_PHONE ? '***' : null
    },
    scheduler: {
      enabled: true,
      timezone: 'Europe/Rome'
    }
  };
  
  res.json(status);
});

module.exports = router;
