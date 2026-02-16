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

function toDTO(o) {
  return {
    id: o.id,
    code: String(o.id),
    customer: o.customer,
    demandeur: o.customer,
    email: o.email || '',
    date: o.date?.toISOString?.() ?? null,
    status: o.status,
    statut: o.status,
    items: o.items,
    nombre_articles: o.items,
    total: o.total,
    montant: o.total,
    productId: o.productId ?? o.product_id ?? null,
    product_id: o.productId ?? null,
    productName: o.product?.name ?? null,
    product_name: o.product?.name ?? null,
    createdAt: o.createdAt?.toISOString?.() ?? null,
  };
}

// GET /api/commandes/
router.get('/commandes/', requireAuth, async (_req, res) => {
  try {
    const list = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { product: true } });
    return res.json(list.map(toDTO));
  } catch (e) {
    console.error('GET /commandes/ error:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// POST /api/commandes/
router.post('/commandes/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const _customer = b.customer ?? b.demandeur ?? b.client;
    if (!_customer) return res.status(400).json({ detail: 'client/demandeur requis' });
    let product = null;
    if (b.productId || b.product_id) {
      const pid = Number.parseInt(b.productId ?? b.product_id, 10);
      if (Number.isFinite(pid)) {
        product = await prisma.product.findUnique({ where: { id: pid } });
        if (!product) return res.status(400).json({ detail: 'Produit introuvable' });
      }
    }

    const created = await prisma.order.create({
      data: {
        customer: String(_customer),
        email: b.email ? String(b.email) : null,
        date: b.date ? new Date(b.date) : undefined,
        status: String(b.status ?? b.statut ?? 'En attente'),
        items: Number.parseInt((b.items ?? b.nombre_articles) ?? 1, 10),
        total: Number.parseFloat(b.total ?? b.montant ?? 0),
        productId: product?.id ?? null,
      },
      include: { product: true },
    });
    return res.status(201).json(toDTO(created));
  } catch (e) {
    console.error('POST /commandes/ error:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// PUT /api/commandes/:id/
router.put('/commandes/:id/', requireAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });
    const b = req.body || {};
    const data = {};
    if (b.customer !== undefined || b.demandeur !== undefined || b.client !== undefined) data.customer = String(b.customer ?? b.demandeur ?? b.client);
    if (b.email !== undefined) data.email = b.email ? String(b.email) : null;
    if (b.date !== undefined) data.date = new Date(b.date);
    if (b.status !== undefined || b.statut !== undefined) data.status = String(b.status ?? b.statut);
    if (b.items !== undefined || b.nombre_articles !== undefined) data.items = Number.parseInt((b.items ?? b.nombre_articles) || 0, 10);
    if (b.total !== undefined || b.montant !== undefined) data.total = Number.parseFloat((b.total ?? b.montant) || 0);

    let product = null;
    if (b.productId || b.product_id) {
      const pid = Number.parseInt(b.productId ?? b.product_id, 10);
      if (Number.isFinite(pid)) {
        product = await prisma.product.findUnique({ where: { id: pid } });
        if (!product) return res.status(400).json({ detail: 'Produit introuvable' });
        data.productId = product.id;
      }
    }

    const updated = await prisma.order.update({ where: { id }, data, include: { product: true } });
    return res.json(toDTO(updated));
  } catch (e) {
    console.error('PUT /commandes/:id/ error:', e);
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Commande introuvable' });
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// DELETE /api/commandes/:id/
router.delete('/commandes/:id/', requireAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });
    await prisma.order.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    console.error('DELETE /commandes/:id/ error:', e);
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Commande introuvable' });
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

export default router;
