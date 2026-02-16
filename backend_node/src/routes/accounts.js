import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { z } from 'zod';
import prisma from '../db/prisma.js';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const RESET_CODE_TTL_MINUTES = Number(process.env.RESET_CODE_TTL_MINUTES || 15);

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_ENABLED = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const mailer = SMTP_ENABLED
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendResetCodeEmail = async ({ to, code, isAdmin }) => {
  if (!mailer) {
    throw new Error('SMTP not configured');
  }
  const subject = isAdmin
    ? 'Code de reinitialisation administrateur'
    : 'Code de reinitialisation';
  const text = `Votre code de reinitialisation est: ${code}\nIl expire dans ${RESET_CODE_TTL_MINUTES} minutes.`;
  await mailer.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
  });
};

const users = [
  { id: 1, email: 'user@demo.com', role: 'user', name: 'Utilisateur Démo' },
  { id: 2, email: 'admin@demo.com', role: 'admin', name: 'Administrateur Démo' },
];

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ detail: 'Non authentifié' });

// PUT /api/accounts/users/:id/ - update a user (admin only)
router.put('/users/:id/', requireAuth, async (req, res) => {
  try {
    // Ensure current user is admin
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const current = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!current || !current.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ detail: 'ID invalide' });
    }

    const body = req.body || {};
    const updateData = {};
    if (typeof body.fullName === 'string' || typeof body.nom === 'string') {
      updateData.fullName = (body.fullName ?? body.nom).toString();
    }
    if (typeof body.email === 'string') {
      updateData.email = body.email.toLowerCase().trim();
    }
    if (typeof body.phone === 'string' || typeof body.telephone === 'string') {
      updateData.phone = (body.phone ?? body.telephone) || null;
    }
    if (typeof body.department === 'string' || typeof body.departement === 'string') {
      updateData.department = (body.department ?? body.departement) || null;
    }
    if (typeof body.isActive === 'boolean' || typeof body.actif === 'boolean') {
      // This route does not soft-delete, it just toggles active state
      // If you store an 'active' flag, map it here; fallback: ignore
    }

    try {
      const updated = await prisma.user.update({ where: { id }, data: updateData });
      return res.json({
        id: updated.id,
        email: updated.email,
        full_name: updated.fullName,
        nom: updated.fullName,
        telephone: updated.phone,
        phone: updated.phone,
        departement: updated.department,
        department: updated.department,
        is_admin: updated.isAdmin,
        is_staff: updated.isAdmin,
        is_superuser: updated.isAdmin,
        date_creation: updated.createdAt?.toISOString?.() ?? null,
      });
    } catch (e) {
      if ((e?.code || '').toString() === 'P2002') {
        return res.status(409).json({ detail: 'Email déjà utilisé' });
      }
      return res.status(500).json({ detail: 'Erreur serveur' });
    }
  } catch (e) {
    return res.status(401).json({ detail: 'Token invalide ou expiré' });
  }
});
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_e) {
    return res.status(401).json({ detail: 'Token invalide ou expiré' });
  }
}

router.get('/me/', requireAuth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const current = await prisma.user.findUnique({ where: { id: decoded.sub } });
    
    if (!current) return res.status(404).json({ detail: 'Utilisateur introuvable' });
    
    const createdAtIso = current.createdAt?.toISOString?.() ?? null;
    res.json({
      id: current.id,
      email: current.email,
      nom: current.fullName,
      username: current.fullName,
      role: current.isAdmin ? 'admin' : 'user',
      is_admin: current.isAdmin,
      is_staff: current.isAdmin,
      is_superuser: current.isAdmin,
      date_joined: createdAtIso,
      date_creation: createdAtIso,
    });
  } catch (e) {
    console.error('Erreur /me/:', e);
    return res.status(401).json({ detail: 'Token invalide' });
  }
});

router.get('/users/', requireAuth, (_req, res) => {
  res.json(users);
});

// GET /api/accounts/administrateurs/ - liste tous les utilisateurs (pour le dashboard admin)
router.get('/administrateurs/', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur connecté est bien admin
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Formater pour le frontend
    const formatted = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      nom: u.fullName,
      username: u.fullName,
      telephone: u.phone || '',
      phone: u.phone || '',
      departement: u.department || '',
      department: u.department || '',
      date_joined: u.createdAt.toISOString(),
      date_creation: u.createdAt.toISOString(),
      actif: true,
      is_admin: u.isAdmin,
      is_staff: u.isAdmin,
      is_superuser: u.isAdmin,
      role: u.isAdmin ? 'admin' : 'user',
      user_type: u.isAdmin ? 'admin' : 'core_utilisateur',
    }));

    return res.json(formatted);
  } catch (e) {
    console.error('Erreur /administrateurs/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// Registration schema for admin
const adminRegisterSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().or(z.literal('')),
});

// POST /api/accounts/register/admin/ - create an admin user
router.post('/register/admin/', async (req, res) => {
  try {
    const parsed = adminRegisterSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten().fieldErrors);
    }
    const { full_name, email, password, phone } = parsed.data;
    const normalized = email.toLowerCase().trim();

    // Allow creating the first admin even without authentication
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });

    // If at least one admin exists, require Authorization header with a valid admin
    if (adminCount > 0) {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) return res.status(401).json({ detail: 'Non authentifié' });
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const current = await prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!current || !current.isAdmin) {
          return res.status(403).json({ detail: 'Accès refusé' });
        }
      } catch (_e) {
        return res.status(401).json({ detail: 'Token invalide ou expiré' });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) return res.status(400).json({ email: ['Email déjà utilisé'] });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        fullName: full_name,
        phone: phone || null,
        isAdmin: true,
      },
    });

    return res.status(201).json({
      id: created.id,
      email: created.email,
      full_name: created.fullName,
      phone: created.phone,
      is_admin: created.isAdmin,
    });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

const resetRequestSchema = z.object({
  email: z.string().email(),
});

const resetConfirmSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  password: z.string().min(6),
});

const createResetCode = async (userId) => {
  const code = generateResetCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
  await prisma.passwordResetCode.deleteMany({ where: { userId } });
  await prisma.passwordResetCode.create({
    data: {
      userId,
      codeHash,
      expiresAt,
    },
  });
  return code;
};

const verifyResetCode = async (userId, code) => {
  const record = await prisma.passwordResetCode.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return false;
  return bcrypt.compare(code, record.codeHash);
};

// POST /api/accounts/reset-password/request/ - send reset code (user)
router.post('/reset-password/request/', async (req, res) => {
  try {
    const parsed = resetRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten().fieldErrors);
    }
    if (!SMTP_ENABLED) {
      return res.status(500).json({ detail: 'SMTP non configure' });
    }
    const normalized = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(404).json({ detail: 'Utilisateur introuvable' });
    if (user.isAdmin) {
      return res.status(403).json({ detail: 'Compte admin - utilisez /reset-admin-password/request/' });
    }
    const code = await createResetCode(user.id);
    await sendResetCodeEmail({ to: user.email, code, isAdmin: false });
    return res.json({ detail: 'Code envoye' });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// POST /api/accounts/reset-password/confirm/ - confirm reset (user)
router.post('/reset-password/confirm/', async (req, res) => {
  try {
    const parsed = resetConfirmSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten().fieldErrors);
    }
    const normalized = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(404).json({ detail: 'Utilisateur introuvable' });
    if (user.isAdmin) {
      return res.status(403).json({ detail: 'Compte admin - utilisez /reset-admin-password/confirm/' });
    }
    const codeOk = await verifyResetCode(user.id, String(parsed.data.code).trim());
    if (!codeOk) {
      return res.status(400).json({ detail: 'Code invalide ou expire' });
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetCode.deleteMany({ where: { userId: user.id } });
    return res.json({ detail: 'Mot de passe mis a jour' });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// POST /api/accounts/reset-admin-password/request/ - send reset code (admin)
router.post('/reset-admin-password/request/', async (req, res) => {
  try {
    const parsed = resetRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten().fieldErrors);
    }
    if (!SMTP_ENABLED) {
      return res.status(500).json({ detail: 'SMTP non configure' });
    }
    const normalized = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(404).json({ detail: 'Utilisateur introuvable' });
    if (!user.isAdmin) {
      return res.status(403).json({ detail: 'Compte utilisateur - utilisez /reset-password/request/' });
    }
    const code = await createResetCode(user.id);
    await sendResetCodeEmail({ to: user.email, code, isAdmin: true });
    return res.json({ detail: 'Code envoye' });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// POST /api/accounts/reset-admin-password/confirm/ - confirm reset (admin)
router.post('/reset-admin-password/confirm/', async (req, res) => {
  try {
    const parsed = resetConfirmSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten().fieldErrors);
    }
    const normalized = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(404).json({ detail: 'Utilisateur introuvable' });
    if (!user.isAdmin) {
      return res.status(403).json({ detail: 'Compte utilisateur - utilisez /reset-password/confirm/' });
    }
    const codeOk = await verifyResetCode(user.id, String(parsed.data.code).trim());
    if (!codeOk) {
      return res.status(400).json({ detail: 'Code invalide ou expire' });
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetCode.deleteMany({ where: { userId: user.id } });
    return res.json({ detail: 'Mot de passe admin mis a jour' });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

export default router;


