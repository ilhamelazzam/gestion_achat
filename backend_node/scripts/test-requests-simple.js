import prisma from '../src/db/prisma.js';

async function testRequests() {
  console.log('\n🧪 Test de la table Request');
  console.log('═'.repeat(50));

  try {
    // Test 1: Compter les demandes
    const count = await prisma.request.count();
    console.log(`\n📊 Total de demandes: ${count}`);

    // Test 2: Récupérer toutes les demandes
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📋 Liste des demandes:`);
    console.log('─'.repeat(50));
    
    requests.forEach((req, index) => {
      console.log(`\n${index + 1}. ${req.requestNumber} - ${req.productName}`);
      console.log(`   👤 Utilisateur: ${req.userName} (${req.userEmail})`);
      console.log(`   📦 Quantité: ${req.quantity}`);
      console.log(`   ⚡ Urgence: ${req.urgency}`);
      console.log(`   📊 Statut: ${req.status}`);
      console.log(`   💰 Coût estimé: ${req.estimatedCost}€`);
      console.log(`   📝 Justification: ${req.justification}`);
      console.log(`   📅 Créée le: ${req.createdAt.toLocaleDateString('fr-FR')}`);
      
      if (req.rejectionReason) {
        console.log(`   ❌ Motif de rejet: ${req.rejectionReason}`);
      }
      
      if (req.approvedAt) {
        console.log(`   ✅ Approuvée le: ${req.approvedAt.toLocaleDateString('fr-FR')}`);
      }
    });

    // Test 3: Statistiques par statut
    console.log(`\n\n📈 Statistiques par statut:`);
    console.log('─'.repeat(50));
    
    const statuses = await prisma.request.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    statuses.forEach(stat => {
      const emoji = 
        stat.status === 'En attente' ? '⏳' :
        stat.status === 'Approuvée' ? '✅' :
        stat.status === 'Rejetée' ? '❌' :
        stat.status === 'En cours' ? '🔄' :
        stat.status === 'Livrée' ? '📦' : '📋';
      
      console.log(`   ${emoji} ${stat.status}: ${stat._count.status}`);
    });

    // Test 4: Statistiques par utilisateur
    console.log(`\n\n👥 Statistiques par utilisateur:`);
    console.log('─'.repeat(50));
    
    const users = await prisma.request.groupBy({
      by: ['userId', 'userName'],
      _count: { userId: true },
      _sum: { estimatedCost: true }
    });

    users.forEach(user => {
      console.log(`   👤 ${user.userName}:`);
      console.log(`      - ${user._count.userId} demandes`);
      console.log(`      - Coût total: ${user._sum.estimatedCost || 0}€`);
    });

    // Test 5: Demandes urgentes
    console.log(`\n\n⚡ Demandes urgentes:`);
    console.log('─'.repeat(50));
    
    const urgentRequests = await prisma.request.findMany({
      where: {
        urgency: { in: ['Urgente', 'Très urgente'] },
        status: 'En attente'
      }
    });

    if (urgentRequests.length === 0) {
      console.log('   Aucune demande urgente en attente');
    } else {
      urgentRequests.forEach(req => {
        console.log(`   ${req.requestNumber} - ${req.productName} (${req.urgency})`);
      });
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Tests terminés avec succès !');
    console.log('═'.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRequests();
