import prisma from '../src/db/prisma.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { isAdmin: true }
    });
    console.log(`✓ User ${user.email} is now an admin`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`✗ User with email ${email} not found`);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
