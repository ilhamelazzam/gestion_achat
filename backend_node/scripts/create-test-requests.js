import prisma from '../src/db/prisma.js';

async function createTestRequests() {
  try {
    // Récupérer un utilisateur de test
    const user = await prisma.user.findFirst({
      where: { isAdmin: false }
    });

    if (!user) {
      console.error('❌ Aucun utilisateur non-admin trouvé. Créez d\'abord un utilisateur.');
      process.exit(1);
    }

    console.log(`✓ Utilisateur trouvé: ${user.email}`);

    // Récupérer quelques produits
    const products = await prisma.product.findMany({ take: 5 });

    if (products.length === 0) {
      console.error('❌ Aucun produit trouvé. Créez d\'abord des produits.');
      process.exit(1);
    }

    console.log(`✓ ${products.length} produits trouvés`);

    // Créer quelques demandes
    const requests = [
      {
        requestNumber: 'REQ-001',
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department || 'IT',
        productId: products[0]?.id,
        productName: products[0]?.name || 'Ordinateur portable Dell Latitude 5520',
        quantity: 2,
        urgency: 'Normale',
        justification: 'Remplacement matériel défaillant',
        estimatedCost: 2400,
        status: 'En attente',
      },
      {
        requestNumber: 'REQ-002',
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department || 'IT',
        productId: products[1]?.id,
        productName: products[1]?.name || 'Chaises de bureau ergonomiques Herman Miller',
        quantity: 5,
        urgency: 'Faible',
        justification: 'Extension de l\'équipe - nouveaux postes de travail',
        estimatedCost: 1750,
        status: 'Approuvée',
        approvedAt: new Date(),
      },
      {
        requestNumber: 'REQ-003',
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department || 'Administration',
        productId: products[2]?.id,
        productName: products[2]?.name || 'Ramettes papier A4',
        quantity: 150,
        urgency: 'Normale',
        justification: 'Stock épuisé',
        estimatedCost: 750,
        status: 'En cours',
      },
      {
        requestNumber: 'REQ-004',
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department || 'Logistique',
        productId: products[3]?.id,
        productName: products[3]?.name || 'Écran 27 pouces 4K',
        quantity: 3,
        urgency: 'Urgente',
        justification: 'Projet urgent nécessitant du matériel haute résolution',
        estimatedCost: 900,
        status: 'En attente',
      },
      {
        requestNumber: 'REQ-005',
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department || 'Logistique',
        productId: products[4]?.id,
        productName: products[4]?.name || 'Tablette iPad Pro 12.9"',
        quantity: 1,
        urgency: 'Normale',
        justification: 'Démonstrations clients',
        estimatedCost: 1200,
        status: 'Rejetée',
        rejectionReason: 'Budget insuffisant pour ce trimestre',
      },
    ];

    for (const reqData of requests) {
      const existing = await prisma.request.findUnique({
        where: { requestNumber: reqData.requestNumber }
      });

      if (existing) {
        console.log(`⊘ Demande ${reqData.requestNumber} existe déjà`);
        continue;
      }

      await prisma.request.create({ data: reqData });
      console.log(`✓ Demande créée: ${reqData.requestNumber} - ${reqData.productName} (${reqData.status})`);
    }

    console.log('\n✅ Demandes de test créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRequests();
