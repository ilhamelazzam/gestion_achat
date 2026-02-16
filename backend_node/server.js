import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './src/routes/auth.js';
import accountsRouter from './src/routes/accounts.js';
import statsRouter from './src/routes/stats.js';
import produitsRouter from './src/routes/produits.js';
import fournisseursRouter from './src/routes/fournisseurs.js';
import commandesRouter from './src/routes/commandes.js';
import demandesRouter from './src/routes/demandes.js';
import departmentsRouter from './src/routes/departments.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './src/db/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ACCESS_TTL_SECONDS = 60 * 60 * 24;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.isAdmin ? 'admin' : 'user' }, JWT_SECRET, { expiresIn: ACCESS_TTL_SECONDS });
}

// DELETE /api/accounts/users/:id/ - supprimer un utilisateur (admin requis)
app.delete('/api/accounts/users/:id/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    // Not found or other error -> respond 404 to match frontend expectations
    if (e?.code === 'P2025') {
      return res.status(404).json({ detail: 'Utilisateur introuvable' });
    }
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TTL_SECONDS });
}

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api', statsRouter);
app.use('/api', produitsRouter);
app.use('/api', commandesRouter);
app.use('/api', fournisseursRouter);
app.use('/api', demandesRouter);
app.use('/api', departmentsRouter);

// CSRF compatibility endpoints (frontend expects these to set csrftoken)
function setCsrfCookie(_req, res) {
  const token = Math.random().toString(36).slice(2);
  res.cookie('csrftoken', token, { httpOnly: false, sameSite: 'lax' });
  return res.json({ csrfToken: token });
}
app.get('/accounts/csrf/', setCsrfCookie);
app.get('/api/accounts/csrf/', setCsrfCookie);

// Admin login compatibility endpoint (frontend posts to /login/)
app.post('/login/', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalized = (email || '').toLowerCase().trim();
    if (!normalized || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const dbUser = await prisma.user.findUnique({ where: { email: normalized } });
    if (!dbUser) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const ok = await bcrypt.compare(password, dbUser.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    const access = signAccessToken(dbUser);
    const refresh = signRefreshToken(dbUser);
    const createdAtIso = dbUser.createdAt?.toISOString?.() ?? null;
    return res.json({
      access,
      refresh,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.fullName || dbUser.email,
        is_staff: !!dbUser.isAdmin,
        is_superuser: !!dbUser.isAdmin,
        date_joined: createdAtIso,
        date_creation: createdAtIso,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/administrateurs/ - liste tous les utilisateurs (pour le dashboard admin)
app.get('/api/administrateurs/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

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
    console.error('Erreur /api/administrateurs/:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

app.put('/api/utilisateurs/:id/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    const { nom, email, telephone, departement } = req.body || {};
    const data = {};
    if (typeof nom === 'string' && nom.trim()) data.fullName = nom.trim();
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim();
    if (typeof telephone === 'string') data.phone = telephone.trim() || null;
    if (typeof departement === 'string') data.department = departement.trim() || null;

    const updated = await prisma.user.update({ where: { id }, data });

    return res.json({
      id: updated.id,
      email: updated.email,
      nom: updated.fullName,
      username: updated.fullName,
      telephone: updated.phone || '',
      phone: updated.phone || '',
      departement: updated.department || '',
      department: updated.department || '',
      date_joined: updated.createdAt.toISOString(),
      date_creation: updated.createdAt.toISOString(),
      actif: true,
      is_admin: updated.isAdmin,
      is_staff: updated.isAdmin,
      is_superuser: updated.isAdmin,
      role: updated.isAdmin ? 'admin' : 'user',
      user_type: updated.isAdmin ? 'admin' : 'core_utilisateur',
    });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

app.put('/api/administrateurs/:id/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ detail: 'Non authentifié' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ detail: 'Accès refusé - Admin uniquement' });
    }

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ detail: 'ID invalide' });

    const { nom, email, telephone, departement } = req.body || {};
    const data = { isAdmin: true };
    if (typeof nom === 'string' && nom.trim()) data.fullName = nom.trim();
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim();
    if (typeof telephone === 'string') data.phone = telephone.trim() || null;
    if (typeof departement === 'string') data.department = departement.trim() || null;

    const updated = await prisma.user.update({ where: { id }, data });

    return res.json({
      id: updated.id,
      email: updated.email,
      nom: updated.fullName,
      username: updated.fullName,
      telephone: updated.phone || '',
      phone: updated.phone || '',
      departement: updated.department || '',
      department: updated.department || '',
      date_joined: updated.createdAt.toISOString(),
      date_creation: updated.createdAt.toISOString(),
      actif: true,
      is_admin: updated.isAdmin,
      is_staff: updated.isAdmin,
      is_superuser: updated.isAdmin,
      role: 'admin',
      user_type: 'admin',
    });
  } catch (e) {
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ detail: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});


