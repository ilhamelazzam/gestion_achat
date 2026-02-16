import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ detail: 'Non authentifié' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_e) {
    return res.status(401).json({ detail: 'Token invalide ou expiré' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
  }
  return next();
}

function normalizeStatus(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0000-\u001F\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function generateRequestNumber() {
  const count = await prisma.request.count();
  const number = count + 1;
  return `REQ-${number.toString().padStart(3, '0')}`;
}

function toDTO(request) {
  return {
    id: request.id,
    requestNumber: request.requestNumber,
    numero_demande: request.requestNumber,
    userId: request.userId,
    user_id: request.userId,
    userEmail: request.userEmail,
    user_email: request.userEmail,
    userName: request.userName,
    user_name: request.userName,
    userDepartment: request.userDepartment,
    user_department: request.userDepartment,
    departement: request.userDepartment,
    productId: request.productId,
    product_id: request.productId,
    productName: request.productName,
    product_name: request.productName,
    produit: request.productName,
    quantity: request.quantity,
    quantite: request.quantity,
    urgency: request.urgency,
    urgence: request.urgency,
    justification: request.justification,
    estimatedCost: request.estimatedCost,
    estimated_cost: request.estimatedCost,
    cout_estime: request.estimatedCost,
    status: request.status,
    statut: request.status,
    rejectionReason: request.rejectionReason,
    rejection_reason: request.rejectionReason,
    motif_rejet: request.rejectionReason,
    approvedBy: request.approvedBy,
    approved_by: request.approvedBy,
    approvedAt: request.approvedAt?.toISOString?.() ?? null,
    approved_at: request.approvedAt?.toISOString?.() ?? null,
    createdAt: request.createdAt?.toISOString?.() ?? null,
    created_at: request.createdAt?.toISOString?.() ?? null,
    date: request.createdAt?.toISOString?.() ?? null,
    updatedAt: request.updatedAt?.toISOString?.() ?? null,
    updated_at: request.updatedAt?.toISOString?.() ?? null,
  };
}

// Admin: toutes les demandes. User: ses propres demandes.
router.get('/demandes/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.sub;
    const where = isAdmin ? {} : { userId };
    if (req.query.status) where.status = String(req.query.status);

    const requests = await prisma.request.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(requests.map(toDTO));
  } catch (e) {
    console.error('Erreur GET /demandes/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Mes demandes (user)
router.get('/demandes/my', requireAuth, async (req, res) => {
  try {
    const where = { userId: req.user?.sub };
    if (req.query.status) where.status = String(req.query.status);
    const requests = await prisma.request.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(requests.map(toDTO));
  } catch (e) {
    console.error('Erreur GET /demandes/my:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Toutes les demandes (admin)
router.get('/demandes/admin', requireAuth, adminOnly, async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = String(req.query.status);
    const requests = await prisma.request.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(requests.map(toDTO));
  } catch (e) {
    console.error('Erreur GET /demandes/admin:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Détails d'une demande
router.get('/demandes/:id/', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ detail: 'Demande non trouvée' });

    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.sub;
    if (!isAdmin && request.userId !== userId) return res.status(403).json({ detail: 'Accès refusé' });

    return res.json(toDTO(request));
  } catch (e) {
    console.error('Erreur GET /demandes/:id/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Créer une demande
router.post('/demandes/', requireAuth, async (req, res) => {
  try {
    const {
      productId,
      product_id,
      productName,
      product_name,
      produit,
      quantity,
      quantite,
      urgency,
      urgence,
      justification,
      estimatedCost,
      estimated_cost,
      cout_estime,
    } = req.body || {};

    const userId = req.user?.sub;
    const userEmail = req.user?.email;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ detail: 'Utilisateur non trouvé' });

    const finalProductName = productName || product_name || produit || '';
    const finalQuantity = parseInt(quantity || quantite || 1, 10);
    const finalUrgency = urgency || urgence || 'Normale';
    const finalJustification = (justification || '').trim();
    const finalEstimatedCost = parseFloat(estimatedCost || estimated_cost || cout_estime || 0);
    const finalProductId = productId || product_id || null;

    if (!finalProductName) return res.status(400).json({ detail: 'Nom du produit requis' });
    if (finalQuantity < 1) return res.status(400).json({ detail: 'Quantité doit être >= 1' });
    if (!finalJustification) return res.status(400).json({ detail: 'Justification requise' });

    const requestNumber = await generateRequestNumber();

    const newRequest = await prisma.request.create({
      data: {
        requestNumber,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userDepartment: user.department,
        productId: finalProductId,
        productName: finalProductName,
        quantity: finalQuantity,
        urgency: finalUrgency,
        justification: finalJustification,
        estimatedCost: finalEstimatedCost,
        status: 'En attente',
      },
    });

    console.log(`Demande créée: ${requestNumber} par ${user.fullName}`);
    return res.status(201).json(toDTO(newRequest));
  } catch (e) {
    console.error('Erreur POST /demandes/:', e);
    if (e?.code === 'P2002') return res.status(400).json({ detail: 'Numéro de demande déjà utilisé' });
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Mettre à jour une demande
router.put('/demandes/:id/', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ detail: 'Demande non trouvée' });

    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.sub;
    if (!isAdmin && request.userId !== userId) return res.status(403).json({ detail: 'Accès refusé' });

    const {
      status,
      statut,
      rejectionReason,
      rejection_reason,
      motif_rejet,
      productId,
      product_id,
      productName,
      product_name,
      produit,
      quantity,
      quantite,
      urgency,
      urgence,
      justification,
      estimatedCost,
      estimated_cost,
      cout_estime,
    } = req.body || {};

    const updates = {};
    const nextStatusRaw = status || statut || null;

    if (isAdmin) {
      if (nextStatusRaw) updates.status = nextStatusRaw;
      if (rejectionReason || rejection_reason || motif_rejet) updates.rejectionReason = rejectionReason || rejection_reason || motif_rejet;
      if (normalizeStatus(updates.status) === 'approuvee') {
        updates.approvedBy = userId;
        updates.approvedAt = new Date();
      }
    }

    if (!isAdmin && request.status === 'En attente') {
      const nextProductName = String(productName || product_name || produit || '').trim();
      if (nextProductName) updates.productName = nextProductName;
      if (productId !== undefined || product_id !== undefined) {
        const parsedProductId = parseInt(productId ?? product_id, 10);
        updates.productId = Number.isFinite(parsedProductId) ? parsedProductId : null;
      }
      if (quantity || quantite) updates.quantity = parseInt(quantity || quantite, 10);
      if (urgency || urgence) updates.urgency = urgency || urgence;
      if (justification) updates.justification = justification;
      if (estimatedCost !== undefined || estimated_cost !== undefined || cout_estime !== undefined) {
        const parsedEstimatedCost = parseFloat(estimatedCost ?? estimated_cost ?? cout_estime);
        if (Number.isFinite(parsedEstimatedCost) && parsedEstimatedCost >= 0) updates.estimatedCost = parsedEstimatedCost;
      }
    }

    const previousStatusNorm = normalizeStatus(request.status);
    const nextStatusNorm = normalizeStatus(nextStatusRaw);
    const shouldCreateOrder = isAdmin && nextStatusRaw && nextStatusNorm === 'approuvee' && previousStatusNorm !== 'approuvee';

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.request.update({ where: { id }, data: updates });

      let generatedOrder = null;
      if (shouldCreateOrder) {
        let product = null;
        if (request.productId) {
          product = await tx.product.findUnique({ where: { id: request.productId } });
        }
        const quantity = Number(request.quantity) || 1;
        const totalFromProduct = Number(product?.price || 0) * quantity;
        const totalFromEstimate = Number(request.estimatedCost || 0);
        const total = Number.isFinite(totalFromProduct) && totalFromProduct > 0 ? totalFromProduct : totalFromEstimate;

        generatedOrder = await tx.order.create({
          data: {
            customer: request.userName || request.userEmail || 'Demandeur',
            email: request.userEmail || null,
            date: new Date(),
            status: 'En cours',
            items: quantity,
            total: Number.isFinite(total) ? total : 0,
            productId: request.productId || null,
          },
        });
      }

      return { updatedRequest, generatedOrder };
    });

    console.log(`Demande ${request.requestNumber || id} mise à jour par ${req.user?.sub || 'inconnu'}`);
    return res.json({ ...toDTO(result.updatedRequest), generatedOrderId: result.generatedOrder?.id ?? null });
  } catch (e) {
    console.error('Erreur PUT /demandes/:id/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Supprimer une demande
router.delete('/demandes/:id/', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ detail: 'Demande non trouvée' });

    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.sub;
    if (!isAdmin && request.userId !== userId) return res.status(403).json({ detail: 'Accès refusé' });
    if (!isAdmin && request.status !== 'En attente') return res.status(403).json({ detail: 'Impossible de supprimer une demande approuvée ou en cours' });

    await prisma.request.delete({ where: { id } });
    console.log(`Demande ${request.requestNumber || id} supprimée par ${req.user?.sub || 'inconnu'}`);
    return res.status(204).send();
  } catch (e) {
    console.error('Erreur DELETE /demandes/:id/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

export default router;
