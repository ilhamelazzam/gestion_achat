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

router.get('/stats/', requireAuth, (_req, res) => {
  res.json({
    demandesEnCours: 3,
    demandesApprouvees: 12,
    stockCritique: 5,
    produitsDisponibles: 247,
  });
});

// GET /api/reports/commandes/
// Query params: dateFrom, dateTo (ISO date strings, optional)
router.get('/reports/commandes/', requireAuth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {};
    const where = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(String(dateFrom));
      if (dateTo) where.date.lte = new Date(String(dateTo));
    }

    const orders = await prisma.order.findMany({ where, orderBy: { date: 'asc' } });

    const totalOrders = orders.length;
    let totalAmount = 0;
    let totalItems = 0;
    const byStatus = {};
    const timeline = {};

    for (const o of orders) {
      totalAmount += Number(o.total || 0);
      totalItems += Number(o.items || 0);
      const st = (o.status || 'En attente');
      byStatus[st] = (byStatus[st] || 0) + 1;
      const day = (o.date instanceof Date ? o.date : new Date(o.date)).toISOString().slice(0, 10);
      if (!timeline[day]) timeline[day] = { date: day, count: 0, total: 0 };
      timeline[day].count += 1;
      timeline[day].total += Number(o.total || 0);
    }

    // Sort timeline by date asc and convert totals to numbers with 2 decimals
    const timelineArr = Object.values(timeline)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      .map(t => ({ date: t.date, count: t.count, total: Number(t.total) }));

    return res.json({
      totalOrders,
      totalAmount,
      totalItems,
      byStatus,
      timeline: timelineArr,
      // French aliases for convenience
      total_commandes: totalOrders,
      montant_total: totalAmount,
      articles_total: totalItems,
      repartition_par_statut: byStatus,
    });
  } catch (e) {
    console.error('GET /reports/commandes/ error:', e);
    return res.status(500).json({ detail: 'Erreur serveur' });
  }
});

// GET /api/reports/produits/
// Optional query: department (filter)
router.get('/reports/produits/', requireAuth, async (req, res) => {
  try {
    const { department } = req.query || {}
    const where = {}
    if (department) where.department = String(department)

    const products = await prisma.product.findMany({
      where,
      select: { quantity: true, minThreshold: true, price: true, department: true },
    })

    let lowStockCount = 0
    let outOfStockCount = 0
    let totalQuantity = 0
    let estimatedValue = 0

    for (const p of products) {
      const qty = Number(p.quantity || 0)
      const thr = Number(p.minThreshold || 0)
      const price = Number(p.price || 0)
      totalQuantity += qty
      estimatedValue += qty * price
      if (qty === 0) outOfStockCount += 1
      else if (qty < thr) lowStockCount += 1
    }

    const needRestockCount = lowStockCount + outOfStockCount

    return res.json({
      lowStockCount,
      outOfStockCount,
      totalQuantity,
      estimatedValue,
      needRestockCount,
      // French aliases
      sous_seuil: lowStockCount,
      ruptures: outOfStockCount,
      quantite_totale: totalQuantity,
      valeur_estimee: estimatedValue,
      a_reapprovisionner: needRestockCount,
    })
  } catch (e) {
    console.error('GET /reports/produits/ error:', e)
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

// GET /api/reports/charts/
// Returns datasets to power Graphiques & Statistiques
// Query: dateFrom, dateTo (optional)
router.get('/reports/charts/', requireAuth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {}
    const whereOrders = {}
    const whereUsers = {}
    if (dateFrom || dateTo) {
      const gte = dateFrom ? new Date(String(dateFrom)) : undefined
      const lte = dateTo ? new Date(String(dateTo)) : undefined
      if (gte || lte) {
        whereOrders.date = {}
        whereUsers.createdAt = {}
        if (gte) { whereOrders.date.gte = gte; whereUsers.createdAt.gte = gte }
        if (lte) { whereOrders.date.lte = lte; whereUsers.createdAt.lte = lte }
      }
    }

    const [orders, users, products] = await Promise.all([
      prisma.order.findMany({ where: whereOrders, orderBy: { date: 'asc' } }),
      prisma.user.findMany({ where: whereUsers, orderBy: { createdAt: 'asc' } }),
      prisma.product.findMany({ select: { department: true, quantity: true, price: true } }),
    ])

    // Orders pie by status
    const statusCounts = {}
    for (const o of orders) {
      const st = o.status || 'En attente'
      statusCounts[st] = (statusCounts[st] || 0) + 1
    }
    const ordersPie = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

    // Users activity per day from createdAt
    const byDay = {}
    for (const u of users) {
      const d = (u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt)).toISOString().slice(0,10)
      byDay[d] = (byDay[d] || 0) + 1
    }
    const usersActivity = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a,b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    // Stock by department snapshot
    const depAgg = {}
    for (const p of products) {
      const dep = p.department || 'Autre'
      const qty = Number(p.quantity || 0)
      const value = qty * Number(p.price || 0)
      if (!depAgg[dep]) depAgg[dep] = { department: dep, quantity: 0, value: 0 }
      depAgg[dep].quantity += qty
      depAgg[dep].value += value
    }
    const stockByDepartment = Object.values(depAgg)
      .map(r => ({ department: r.department, quantity: r.quantity, value: Number(r.value) }))
      .sort((a,b) => b.quantity - a.quantity)

    return res.json({ ordersPie, usersActivity, stockByDepartment })
  } catch (e) {
    console.error('GET /reports/charts/ error:', e)
    return res.status(500).json({ detail: 'Erreur serveur' })
  }
})

export default router;


