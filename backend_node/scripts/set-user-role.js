import prisma from '../src/db/prisma.js';

const email = process.argv[2];
const isAdmin = process.argv[3] === 'true';

if (!email) {
  console.error('Usage: node scripts/set-user-role.js <email> <true|false>');
  console.error('Exemple: node scripts/set-user-role.js user@demo.local false');
  process.exit(1);
}

async function setUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { isAdmin: isAdmin }
    });
    console.log(`✓ Utilisateur ${user.email} mis à jour`);
    console.log(`  - isAdmin: ${user.isAdmin}`);
    console.log(`  - Nom: ${user.fullName}`);
    console.log(`  - Département: ${user.department}`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`✗ Utilisateur avec email ${email} introuvable`);
    } else {
      console.error('Erreur:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

setUserRole();
