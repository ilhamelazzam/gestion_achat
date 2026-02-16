import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../db/prisma.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ACCESS_TTL_SECONDS = 60 * 60 * 24; // 24 heures pour éviter les expirations rapides en front
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Simple fake user store (for demo only, used as fallback if DB empty)
const demoUsers = [
  { id: 1, email: 'user@demo.com', password: 'password', role: 'user', name: 'Utilisateur Démo' },
  { id: 2, email: 'admin@demo.com', password: 'password', role: 'admin', name: 'Administrateur Démo' },
];

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL_SECONDS });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TTL_SECONDS });
}

router.post('/token/', async (req, res) => {
  const { email, password } = req.body || {};
  const normalized = (email || '').toLowerCase().trim();
  // Try DB first
  const dbUser = await prisma.user.findUnique({ where: { email: normalized } }).catch(() => null);
  if (dbUser) {
    const ok = await bcrypt.compare(password || '', dbUser.passwordHash);
    if (!ok) return res.status(401).json({ detail: 'Identifiants invalides' });
    const access = signAccessToken({ id: dbUser.id, email: dbUser.email, role: dbUser.isAdmin ? 'admin' : 'user' });
    const refresh = signRefreshToken({ id: dbUser.id });
    return res.json({ access, refresh });
  }
  // Fallback demo
  const user = demoUsers.find(u => u.email === normalized && u.password === password);
  if (!user) return res.status(401).json({ detail: 'Identifiants invalides' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  return res.json({ access, refresh });
});

router.post('/token/refresh/', (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) return res.status(400).json({ detail: 'Refresh token requis' });
  try {
    const decoded = jwt.verify(refresh, JWT_SECRET);
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');
    const user = demoUsers.find(u => u.id === decoded.sub);
    if (!user) return res.status(401).json({ detail: 'Utilisateur introuvable' });
    const access = signAccessToken(user);
    // Optionally rotate refresh
    return res.json({ access });
  } catch (_e) {
    return res.status(401).json({ detail: 'Refresh token invalide ou expiré' });
  }
});

// Compatibility route with current frontend form
router.post('/utilisateurs/login/', async (req, res) => {
  const { email, password } = req.body || {};
  const normalized = (email || '').toLowerCase().trim();
  const dbUser = await prisma.user.findUnique({ where: { email: normalized } }).catch(() => null);
  if (dbUser) {
    const ok = await bcrypt.compare(password || '', dbUser.passwordHash);
    if (!ok) return res.status(401).json({ detail: 'Identifiants invalides' });
    
    console.log('🔐 User login:', { email: dbUser.email, isAdmin: dbUser.isAdmin });
    
    const access = signAccessToken({ id: dbUser.id, email: dbUser.email, role: dbUser.isAdmin ? 'admin' : 'user' });
    const refresh = signRefreshToken({ id: dbUser.id });
    
    const createdAtIso = dbUser.createdAt?.toISOString?.() ?? null
    const response = {
      tokens: { access, refresh },
      user: {
        id: dbUser.id,
        email: dbUser.email,
        nom: dbUser.fullName,
        departement: dbUser.department,
        is_admin: dbUser.isAdmin,
        date_joined: createdAtIso,
        date_creation: createdAtIso,
      },
      user_id: dbUser.id,
      email: dbUser.email,
      nom: dbUser.fullName,
      departement: dbUser.department,
      date_joined: createdAtIso,
      date_creation: createdAtIso,
    };
    
    console.log('📤 Login response:', JSON.stringify(response, null, 2));
    
    return res.json(response);
  }
  // Fallback demo
  const user = demoUsers.find(u => u.email === normalized && u.password === password);
  if (!user) return res.status(401).json({ detail: 'Identifiants invalides' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  const demoDate = new Date().toISOString()
  return res.json({
    tokens: { access, refresh },
    user: {
      id: user.id,
      email: user.email,
      nom: user.name,
      departement: 'Ressources Humaines',
      is_admin: user.role === 'admin',
      date_joined: demoDate,
      date_creation: demoDate,
    },
    user_id: user.id,
    date_joined: demoDate,
    date_creation: demoDate,
  });
});

// Registration
const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  password: z.string().min(6),
});

router.post('/utilisateurs/register/', async (req, res) => {
  const parse = registerSchema.safeParse(req.body || {});
  if (!parse.success) {
    return res.status(400).json({ detail: 'Données invalides', errors: parse.error.flatten() });
  }
  const { fullName, email, phone, department, password } = parse.data;
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) return res.status(409).json({ detail: 'Email déjà utilisé' });
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      fullName,
      phone: phone || null,
      department: department || null,
      isAdmin: false,
    },
  });
  const access = signAccessToken({ id: created.id, email: created.email, role: 'user' });
  const refresh = signRefreshToken({ id: created.id });
  const createdAtIso = created.createdAt?.toISOString?.() ?? null
  return res.status(201).json({
    tokens: { access, refresh },
    user: {
      id: created.id,
      email: created.email,
      nom: created.fullName,
      departement: created.department,
      is_admin: created.isAdmin,
      date_joined: createdAtIso,
      date_creation: createdAtIso,
    },
    user_id: created.id,
    date_joined: createdAtIso,
    date_creation: createdAtIso,
  });
});

export default router;


