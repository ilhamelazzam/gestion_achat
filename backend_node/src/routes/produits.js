import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PUBLIC_BASE_URL = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 8000}`;

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

function toDTO(p) {
  const resolveImage = (val) => {
    if (!val) return null;
    if (val.startsWith('data:')) return val; // data URI (base64)
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    return `${PUBLIC_BASE_URL}${val}`;
  };
  // Expose champs en FR et EN pour compat frontend
  return {
    id: p.id,
    code: String(p.id),
    sku: String(p.id),
    name: p.name,
    nom: p.name,
    department: p.department || '',
    departement: p.department || '',
    quantity: p.quantity,
    quantite: p.quantity,
    minThreshold: p.minThreshold,
    seuil_alerte: p.minThreshold,
    supplier: p.supplier || '',
    fournisseur: p.supplier || '',
    dateAdded: p.dateAdded?.toISOString?.() ?? null,
    date_ajout: p.dateAdded?.toISOString?.() ?? null,
    price: p.price,
    prix: p.price,
    image: resolveImage(p.image),
    createdAt: p.createdAt?.toISOString?.() ?? null,
  };
}

// GET /api/produits/
router.get('/produits/', requireAuth, async (_req, res) => {
  try {
    // Prisma client sur ce poste n'a pas été régénéré (EPERM), on passe par du SQL brut pour inclure la colonne image
    const list = await prisma.$queryRaw`SELECT * FROM "Product" ORDER BY "createdAt" DESC`;
    return res.json(list.map(toDTO));
  } catch (e) {
    console.error('GET /produits/ error:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// POST /api/produits/
router.post('/produits/', requireAuth, async (req, res) => {
  try {
    const { nom, name, prix, price, quantite, quantity, seuil_alerte, minThreshold, departement, department, fournisseur, supplier, date_ajout, dateAdded, image, imageUrl } = req.body || {};
    const _name = name ?? nom;
    if (!_name) return res.status(400).json({ detail: 'nom requis' });
    const imageValue = imageUrl || image || null;
    const created = await prisma.product.create({
      data: {
        name: String(_name),
        price: Number.parseFloat((price ?? prix) || 0),
        quantity: Number.parseInt((quantity ?? quantite) || 0, 10),
        minThreshold: Number.parseInt((minThreshold ?? seuil_alerte) || 0, 10),
        department: (department ?? departement) || null,
        supplier: (supplier ?? fournisseur) || null,
        dateAdded: dateAdded ? new Date(dateAdded) : (date_ajout ? new Date(date_ajout) : undefined),
      }
    });
    if (imageValue !== null) {
      await prisma.$executeRaw`UPDATE "Product" SET "image" = ${imageValue} WHERE id = ${created.id};`;
      created.image = imageValue;
    }
    return res.status(201).json(toDTO(created));
  } catch (e) {
    console.error('POST /produits/ error:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// PUT /api/produits/:id/
router.put('/produits/:id/', requireAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });
    const { nom, name, prix, price, quantite, quantity, seuil_alerte, minThreshold, departement, department, fournisseur, supplier, date_ajout, dateAdded, image, imageUrl } = req.body || {};
    const data = {};
    if (nom || name) data.name = String(name ?? nom);
    if (prix !== undefined || price !== undefined) data.price = Number.parseFloat((price ?? prix) || 0);
    if (quantite !== undefined || quantity !== undefined) data.quantity = Number.parseInt((quantity ?? quantite) || 0, 10);
    if (seuil_alerte !== undefined || minThreshold !== undefined) data.minThreshold = Number.parseInt((minThreshold ?? seuil_alerte) || 0, 10);
    if (departement !== undefined || department !== undefined) data.department = (department ?? departement) || null;
    if (fournisseur !== undefined || supplier !== undefined) data.supplier = (supplier ?? fournisseur) || null;
    if (date_ajout || dateAdded) data.dateAdded = new Date(dateAdded ?? date_ajout);
    const imageValue = (image !== undefined || imageUrl !== undefined) ? (imageUrl || image || null) : undefined;
    const updated = await prisma.product.update({ where: { id }, data });
    if (imageValue !== undefined) {
      await prisma.$executeRaw`UPDATE "Product" SET "image" = ${imageValue} WHERE id = ${id};`;
      updated.image = imageValue;
    }
    return res.json(toDTO(updated));
  } catch (e) {
    console.error('PUT /produits/:id/ error:', e);
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Produit introuvable' });
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// DELETE /api/produits/:id/
router.delete('/produits/:id/', requireAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });
    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    console.error('DELETE /produits/:id/ error:', e);
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Produit introuvable' });
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

export default router;
