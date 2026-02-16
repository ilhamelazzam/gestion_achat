import express from 'express';
import prisma from '../db/prisma.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAdmin(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { ok: false, res: res.status(401).json({ detail: 'Non authentifié' }) };
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return { ok: false, res: res.status(401).json({ detail: 'Token invalide' }) };
    if (!decoded || decoded.role !== 'admin') return { ok: false, res: res.status(403).json({ detail: 'Admin requis' }) };
    return { ok: true, userId: decoded.sub };
  } catch (e) {
    return { ok: false, res: res.status(401).json({ detail: 'Token invalide ou expiré' }) };
  }
}

// Liste des départements
router.get('/departments/', async (_req, res) => {
  const items = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

// Création
router.post('/departments/', async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth.ok) return;
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ detail: 'Nom obligatoire' });
  try {
    const created = await prisma.department.create({ data: { name: name.trim() } });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ detail: 'Nom déjà existant' });
    res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Mise à jour
router.put('/departments/:id', async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth.ok) return;
  const id = Number(req.params.id);
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ detail: 'Nom obligatoire' });
  try {
    const updated = await prisma.department.update({
      where: { id },
      data: { name: name.trim() },
    });
    res.json(updated);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ detail: 'Nom déjà existant' });
    res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Suppression
router.delete('/departments/:id', async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth.ok) return;
  const id = Number(req.params.id);
  try {
    await prisma.department.delete({ where: { id } });
    res.json({ detail: 'Supprimé' });
  } catch (e) {
    res.status(500).json({ detail: 'Erreur serveur' });
  }
});

export default router;
