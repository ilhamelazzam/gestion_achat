import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ detail: 'Non authentifié' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    return next()
  } catch (_e) {
    return res.status(401).json({ detail: 'Token invalide ou expiré' })
  }
}

function adminOnly(req, res, next) {
  // role is set to 'admin' in signAccessToken when isAdmin true
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' })
  }
  return next()
}

function toDTO(s) {
  return {
    id: s.id,
    nom: s.name,
    name: s.name,
    email: s.email || '',
    telephone: s.phone || '',
    phone: s.phone || '',
    adresse: s.address || '',
    address: s.address || '',
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

// GET /api/fournisseurs/
router.get('/fournisseurs/', requireAuth, async (_req, res) => {
  try {
    const list = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(list.map(toDTO))
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

// POST /api/fournisseurs/
router.post('/fournisseurs/', requireAuth, adminOnly, async (req, res) => {
  try {
    const { nom, name, email, telephone, phone, adresse, address } = req.body || {}
    const data = {
      name: (nom || name || '').toString().trim(),
      email: (email || null) ? String(email).toLowerCase().trim() : null,
      phone: (telephone ?? phone ?? null) ? String(telephone ?? phone).trim() : null,
      address: (adresse ?? address ?? null) ? String(adresse ?? address).trim() : null,
    }
    if (!data.name) return res.status(400).json({ detail: 'Nom requis' })

    const created = await prisma.supplier.create({ data })
    return res.status(201).json(toDTO(created))
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(400).json({ detail: 'Email déjà utilisé' })
    }
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

// PUT /api/fournisseurs/:id/
router.put('/fournisseurs/:id/', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' })

    const { nom, name, email, telephone, phone, adresse, address } = req.body || {}
    const data = {}
    if (typeof nom === 'string' || typeof name === 'string') data.name = String(nom || name).trim()
    if (email !== undefined) data.email = email ? String(email).toLowerCase().trim() : null
    if (telephone !== undefined || phone !== undefined) data.phone = (telephone ?? phone) ? String(telephone ?? phone).trim() : null
    if (adresse !== undefined || address !== undefined) data.address = (adresse ?? address) ? String(adresse ?? address).trim() : null

    const updated = await prisma.supplier.update({ where: { id }, data })
    return res.json(toDTO(updated))
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Fournisseur introuvable' })
    if (e?.code === 'P2002') return res.status(400).json({ detail: 'Email déjà utilisé' })
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

// DELETE /api/fournisseurs/:id/
router.delete('/fournisseurs/:id/', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' })
    await prisma.supplier.delete({ where: { id } })
    return res.status(204).send()
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ detail: 'Fournisseur introuvable' })
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

export default router
