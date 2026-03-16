const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un report PDF per un intervento
 * @param {Object} intervention - Dati intervento
 * @param {String} outputPath - Path output (opzionale)
 * @returns {Promise<String>} - URL del PDF generato
 */
async function generateInterventionReport(intervention, outputPath = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Nome file
      const filename = outputPath || `report_${intervention.id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).font('Helvetica-Bold');
      doc.text('HYGIENIX - Report Intervento', 50, 50);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 50, 75);
      doc.text(`Report ID: ${intervention.id}`, 50, 90);
      
      // Linea separatrice
      doc.moveTo(50, 110).lineTo(550, 110).stroke();
      
      // Sezione Cliente
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('DATI CLIENTE', 50, 130);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Ragione Sociale: ${intervention.client?.ragioneSociale || 'N/D'}`, 50, 155);
      doc.text(`Tipo: ${intervention.client?.tipo || 'N/D'}`, 50, 170);
      doc.text(`Indirizzo: ${intervention.client?.indirizzoLegale || 'N/D'}`, 50, 185);
      doc.text(`${intervention.client?.cap || ''} ${intervention.client?.citta || ''} (${intervention.client?.provincia || ''})`, 50, 200);
      
      // Sezione Sede
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('SEDE INTERVENTO', 50, 230);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nome Sede: ${intervention.location?.nomeSede || 'N/D'}`, 50, 255);
      doc.text(`Indirizzo: ${intervention.location?.indirizzo || 'N/D'}`, 50, 270);
      doc.text(`${intervention.location?.cap || ''} ${intervention.location?.citta || ''}`, 50, 285);
      doc.text(`Tipo Struttura: ${intervention.location?.tipoStruttura || 'N/D'}`, 50, 300);
      if (intervention.location?.pianoSpecifico) {
        doc.text(`Piano/Interno: ${intervention.location.pianoSpecifico}${intervention.location.interno ? ' - ' + intervention.location.interno : ''}`, 50, 315);
      }
      
      // Sezione Intervento
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('DETTAGLI INTERVENTO', 50, 350);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Data Programmata: ${new Date(intervention.dataProgrammata).toLocaleDateString('it-IT')}`, 50, 375);
      if (intervention.dataEsecuzione) {
        doc.text(`Data Esecuzione: ${new Date(intervention.dataEsecuzione).toLocaleString('it-IT')}`, 50, 390);
      }
      if (intervention.dataFine) {
        doc.text(`Data Completamento: ${new Date(intervention.dataFine).toLocaleString('it-IT')}`, 50, 405);
      }
      
      doc.text(`Tipo Intervento: ${intervention.tipoIntervento || 'N/D'}`, 50, 425);
      doc.text(`Stato: ${intervention.stato}`, 50, 440);
      doc.text(`Tecnico: ${intervention.tecnico?.nome || ''} ${intervention.tecnico?.cognome || ''}`, 50, 455);
      
      // Condizioni ambientali
      if (intervention.temperatura || intervention.umidita) {
        doc.text(`Temperatura: ${intervention.temperatura || 'N/D'}°C    Umidità: ${intervention.umidita || 'N/D'}%`, 50, 480);
      }
      
      // Note tecniche
      if (intervention.noteTecnico) {
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('NOTE TECNICHE', 50, 520);
        doc.fontSize(11).font('Helvetica');
        doc.text(intervention.noteTecnico, 50, 545, { width: 500 });
      }
      
      // Risultato
      if (intervention.risultato) {
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('ESITO INTERVENTO', 50, intervention.noteTecnico ? 620 : 520);
        doc.fontSize(11).font('Helvetica');
        doc.text(intervention.risultato, 50, intervention.noteTecnico ? 645 : 545, { width: 500 });
      }
      
      // Firme
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('FIRME', 50, 50);
      
      if (intervention.firmaTecnicoUrl) {
        doc.fontSize(11).font('Helvetica');
        doc.text('Firma Tecnico:', 50, 80);
        try {
          const firmaTecnicoPath = path.join(__dirname, '../..', intervention.firmaTecnicoUrl);
          if (fs.existsSync(firmaTecnicoPath)) {
            doc.image(firmaTecnicoPath, 50, 100, { width: 200 });
          }
        } catch (e) {
          doc.text('[Firma non disponibile]', 50, 100);
        }
      }
      
      if (intervention.firmaClienteUrl) {
        doc.fontSize(11).font('Helvetica');
        doc.text(`Firma Cliente (${intervention.nomeFirmaCliente || 'Cliente'}):`, 300, 80);
        try {
          const firmaClientePath = path.join(__dirname, '../..', intervention.firmaClienteUrl);
          if (fs.existsSync(firmaClientePath)) {
            doc.image(firmaClientePath, 300, 100, { width: 200 });
          }
        } catch (e) {
          doc.text('[Firma non disponibile]', 300, 100);
        }
      }
      
      // Footer
      doc.fontSize(9).font('Helvetica');
      doc.text('Hygienix - Gestionale Pest Control', 50, 750);
      doc.text('Documento generato automaticamente dal sistema', 50, 765);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/uploads/${filename}`);
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInterventionReport };
