const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class JobScheduler {
  constructor() {
    this.jobs = [];
  }

  start() {
    console.log('🕐 Avvio scheduler notifiche...');

    // Promemoria giornalieri alle 17:00 (per interventi del giorno dopo)
    const reminderJob = cron.schedule('0 17 * * *', async () => {
      console.log('📧 Invio promemoria giornalieri...');
      await this.sendDailyReminders();
    }, {
      scheduled: true,
      timezone: "Europe/Rome"
    });

    // Alert scadenze contratti (primo giorno del mese)
    const contractJob = cron.schedule('0 9 1 * *', async () => {
      console.log('📋 Controllo scadenze contratti...');
      await this.checkContractExpirations();
    }, {
      scheduled: true,
      timezone: "Europe/Rome"
    });

    // Report settimanale ai manager (lunedì mattina)
    const reportJob = cron.schedule('0 8 * * 1', async () => {
      console.log('📊 Generazione report settimanale...');
      await this.sendWeeklyReport();
    }, {
      scheduled: true,
      timezone: "Europe/Rome"
    });

    this.jobs.push(reminderJob, contractJob, reportJob);
    console.log('✅ Scheduler avviato con successo');
  }

  async sendDailyReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const interventions = await prisma.intervention.findMany({
        where: {
          date: {
            gte: tomorrow,
            lt: dayAfter
          },
          status: { in: ['SCHEDULED', 'PENDING'] },
          reminderSent: false
        },
        include: {
          client: true,
          location: true,
          technician: { include: { user: true } }
        }
      });

      for (const intervention of interventions) {
        // Invia SMS al cliente
        if (intervention.client.phone) {
          await notificationService.sendSMSReminder(intervention.id);
        }

        // Invia email al cliente
        if (intervention.client.email) {
          await this.sendEmailReminder(intervention);
        }

        // Notifica al tecnico
        if (intervention.technician?.user.email) {
          await notificationService.notifyTechnician(intervention.id);
        }

        // Marca come inviato
        await prisma.intervention.update({
          where: { id: intervention.id },
          data: { reminderSent: true }
        });
      }

      console.log(`✅ Inviati ${interventions.length} promemoria`);
    } catch (error) {
      console.error('❌ Errore invio promemoria:', error);
    }
  }

  async sendEmailReminder(intervention) {
    const date = new Date(intervention.date).toLocaleDateString('it-IT');
    const time = intervention.time || 'da concordare';

    const emailHtml = `
      <h2>Promemoria Appuntamento - Hygienix</h2>
      <p>Gentile ${intervention.client.name},</p>
      <p>Le ricordiamo l'appuntamento per <strong>domani ${date} alle ${time}</strong>.</p>
      <p><strong>Sede:</strong> ${intervention.location?.name || 'Sede principale'}</p>
      <p><strong>Indirizzo:</strong> ${intervention.location?.address || 'Da confermare'}</p>
      <p>Per modifiche: ${process.env.COMPANY_PHONE || '0574-XXX-XXX'}</p>
    `;

    // Implementazione nodemailer qui o chiamata al service
    console.log(`📧 Email reminder programmata per ${intervention.client.email}`);
  }

  async checkContractExpirations() {
    try {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const clients = await prisma.client.findMany({
        where: {
          contractExpiry: {
            lte: threeMonthsFromNow,
            gte: new Date()
          }
        }
      });

      for (const client of clients) {
        // Notifica operatore scadenza contratto
        console.log(`⚠️ Contratto ${client.name} in scadenza: ${client.contractExpiry}`);
      }
    } catch (error) {
      console.error('❌ Errore controllo scadenze:', error);
    }
  }

  async sendWeeklyReport() {
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
        FROM Intervention
        WHERE date >= ${lastWeek}
      `;

      console.log('📊 Report settimanale:', stats);
      // Qui invierei email riepilogativa agli admin
    } catch (error) {
      console.error('❌ Errore report settimanale:', error);
    }
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('🛑 Scheduler fermato');
  }
}

module.exports = new JobScheduler();
