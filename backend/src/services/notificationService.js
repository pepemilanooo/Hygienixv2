const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configurazione email (usa variabili d'ambiente)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Configurazione Twilio SMS
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

class NotificationService {
  // Invia email di conferma appuntamento al cliente
  async sendAppointmentConfirmation(interventionId) {
    try {
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: {
          client: true,
          location: true,
          tecnico: true
        }
      });

      if (!intervention || !intervention.client.email) return;

      const date = new Date(intervention.dataProgrammata).toLocaleDateString('it-IT');
      const time = intervention.dataProgrammata?.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) || 'da concordare';

      const emailHtml = `
        <h2>Conferma Appuntamento - Hygienix</h2>
        <p>Gentile ${intervention.client.ragioneSociale},</p>
        <p>Le confermiamo l'appuntamento per:</p>
        <ul>
          <li><strong>Data:</strong> ${date}</li>
          <li><strong>Ora:</strong> ${time}</li>
          <li><strong>Sede:</strong> ${intervention.location?.nomeSede || 'Sede principale'}</li>
          <li><strong>Indirizzo:</strong> ${intervention.location?.indirizzo || 'Da confermare'}</li>
          <li><strong>Tecnico:</strong> ${intervention.tecnico?.nome || 'Da assegnare'}</li>
        </ul>
        <p>Per qualsiasi modifica contatti il numero: ${process.env.COMPANY_PHONE || '0574-XXX-XXX'}</p>
        <p>Grazie per aver scelto Hygienix!</p>
      `;

      await emailTransporter.sendMail({
        from: `"Hygienix" <${process.env.SMTP_USER}>`,
        to: intervention.client.email,
        subject: `Conferma Appuntamento - ${date}`,
        html: emailHtml
      });

      console.log(`Email conferma inviata a ${intervention.client.email}`);
    } catch (error) {
      console.error('Errore invio email:', error);
    }
  }

  // Invia SMS reminder 24h prima
  async sendSMSReminder(interventionId) {
    try {
      if (!twilioClient || !process.env.TWILIO_PHONE) return;

      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: {
          client: true,
          location: true
        }
      });

      if (!intervention || !intervention.client.telefono) return;

      const date = new Date(intervention.dataProgrammata).toLocaleDateString('it-IT');
      const message = `Hygienix: Promemoria intervento domani ${date} presso ${intervention.location?.nomeSede || 'sua sede'}. Per modifiche: ${process.env.COMPANY_PHONE || '0574-XXX-XXX'}`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: intervention.client.telefono
      });

      console.log(`SMS inviato a ${intervention.client.telefono}`);
    } catch (error) {
      console.error('Errore invio SMS:', error);
    }
  }

  // Invia notifica al tecnico assegnato
  async notifyTechnician(interventionId) {
    try {
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: {
          client: true,
          location: true,
          tecnico: true
        }
      });

      if (!intervention?.tecnico?.email) return;

      const date = new Date(intervention.dataProgrammata).toLocaleDateString('it-IT');
      const time = intervention.dataProgrammata?.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) || 'da concordare';

      const emailHtml = `
        <h2>Nuovo Intervento Assegnato</h2>
        <p><strong>Data:</strong> ${date} - ${time}</p>
        <p><strong>Cliente:</strong> ${intervention.client.ragioneSociale}</p>
        <p><strong>Indirizzo:</strong> ${intervention.location?.indirizzo || 'N/A'}</p>
        <p><strong>Note:</strong> ${intervention.noteTecnico || 'Nessuna nota'}</p>
        <p>Accedi all'app per confermare: ${process.env.FRONTEND_URL || 'https://hygienix.app'}</p>
      `;

      await emailTransporter.sendMail({
        from: `"Hygienix" <${process.env.SMTP_USER}>`,
        to: intervention.tecnico.email,
        subject: `Nuovo Intervento - ${intervention.client.ragioneSociale}`,
        html: emailHtml
      });

      console.log(`Notifica tecnico inviata a ${intervention.tecnico.email}`);
    } catch (error) {
      console.error('Errore notifica tecnico:', error);
    }
  }

  // Controlla e invia promemoria giornalieri (da chiamare con cron)
  async sendDailyReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const interventions = await prisma.intervention.findMany({
        where: {
          dataProgrammata: {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          },
          stato: { not: 'COMPLETATO' }
        },
        include: {
          client: true
        }
      });

      for (const intervention of interventions) {
        await this.sendSMSReminder(intervention.id);
        await this.sendAppointmentConfirmation(intervention.id);
      }

      console.log(`Inviati ${interventions.length} promemoria`);
    } catch (error) {
      console.error('Errore promemoria giornalieri:', error);
    }
  }

  // Email con report PDF allegato
  async sendReportWithPDF(interventionId, pdfBuffer) {
    try {
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
        include: { client: true }
      });

      if (!intervention || !intervention.client.email) return;

      await emailTransporter.sendMail({
        from: `"Hygienix" <${process.env.SMTP_USER}>`,
        to: intervention.client.email,
        subject: `Report Intervento - ${new Date(intervention.dataProgrammata).toLocaleDateString('it-IT')}`,
        html: `<p>Gentile ${intervention.client.ragioneSociale},</p><p>In allegato il report dell'intervento effettuato.</p>`,
        attachments: [{
          filename: `report-intervento-${interventionId}.pdf`,
          content: pdfBuffer
        }]
      });

      console.log(`Report PDF inviato a ${intervention.client.email}`);
    } catch (error) {
      console.error('Errore invio report:', error);
    }
  }
}

module.exports = new NotificationService();
