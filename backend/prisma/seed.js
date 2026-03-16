const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizializzazione database...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@hygienix.it' }
  });

  if (existingAdmin) {
    console.log('✓ Utente admin già esistente');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hygienix.it',
      password: hashedPassword,
      nome: 'Amministratore',
      cognome: 'Hygienix',
      ruolo: 'ADMIN',
      attivo: true
    }
  });

  console.log('✓ Utente admin creato:', admin.email);
  console.log('  Credenziali: admin@hygienix.it / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Errore seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
