import prisma from '../src/db/prisma.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    // Créer un utilisateur non-admin
    const passwordHash = await bcrypt.hash('User#2025', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'user@demo.local' },
      update: {
        passwordHash,
        fullName: 'Utilisateur Test',
        department: 'Achats',
        isAdmin: false
      },
      create: {
        email: 'user@demo.local',
        passwordHash,
        fullName: 'Utilisateur Test',
        phone: '+212 6 12 34 56 78',
        department: 'Achats',
        isAdmin: false
      }
    });

    console.log('✓ Utilisateur non-admin créé:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Mot de passe: User#2025`);
    console.log(`  isAdmin: ${user.isAdmin}`);
    console.log(`  Département: ${user.department}`);
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
