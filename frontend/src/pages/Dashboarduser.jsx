import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Package, ShoppingCart, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { API_BASE_URL } from "../config"
import { getUserData } from "../utils/auth"

export default function Dashboard() {
  const [user, setUser] = useState({
    name: "Utilisateur",
    department: "",
    email: "",
  })
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    critical: 0,
    products: 0,
  })
  const [recentRequests, setRecentRequests] = useState([])

  const stats = [
    {
      title: "Demandes en cours",
      value: counts.pending,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Demandes approuvees",
      value: counts.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Stock critique",
      value: counts.critical,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Produits disponibles",
      value: counts.products,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const formatShortDate = (value) => {
    if (!value) return "-"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString("fr-FR")
  }

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  useEffect(() => {
    const storedUser = getUserData()
    const fallbackName = localStorage.getItem("userName") || "Utilisateur"
    setUser({
      name: storedUser?.nom || storedUser?.full_name || storedUser?.fullName || storedUser?.username || storedUser?.name || fallbackName,
      department: storedUser?.departement || storedUser?.department || "",
      email: storedUser?.email || "",
    })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    const loadDashboard = async () => {
      try {
        const [demandesRes, produitsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/demandes/`, { headers }),
          fetch(`${API_BASE_URL}/produits/`, { headers }),
        ])

        const demandesData = demandesRes.ok ? await demandesRes.json() : []
        const produitsData = produitsRes.ok ? await produitsRes.json() : []

        const demandes = Array.isArray(demandesData) ? demandesData : []
        const produits = Array.isArray(produitsData) ? produitsData : []

        const pendingCount = demandes.filter((req) => {
          const normalized = normalizeText(req.status || req.statut)
          return normalized.includes("attente") || normalized.includes("cours")
        }).length
        const approvedCount = demandes.filter((req) => normalizeText(req.status || req.statut).includes("approuv")).length

        const criticalCount = produits.filter((product) => {
          const quantity = Number(product.quantity ?? product.quantite ?? 0)
          const threshold = Number(product.minThreshold ?? product.seuil_alerte ?? 0)
          if (!Number.isFinite(quantity) || !Number.isFinite(threshold)) return false
          return threshold > 0 && quantity <= threshold
        }).length

        const recent = demandes.slice(0, 3).map((req) => ({
          id: req.requestNumber || req.numero_demande || String(req.id || ""),
          product: req.productName || req.product_name || req.produit || "Produit",
          quantity: req.quantity ?? req.quantite ?? 1,
          status: req.status || req.statut || "En attente",
          date: formatShortDate(req.createdAt || req.created_at || req.date),
          urgency: req.urgency || req.urgence || "Normale",
        }))

        setCounts({
          pending: pendingCount,
          approved: approvedCount,
          critical: criticalCount,
          products: produits.length,
        })
        setRecentRequests(recent)
      } catch (error) {
        console.error("Erreur chargement dashboard:", error)
      }
    }

    loadDashboard()
  }, [])

  const getStatusBadge = (status) => {
    const normalized = normalizeText(status)
    if (normalized.includes("attente")) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          En attente
        </Badge>
      )
    }
    if (normalized.includes("approuv")) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Approuvee
        </Badge>
      )
    }
    if (normalized.includes("cours")) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          En cours
        </Badge>
      )
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const getUrgencyBadge = (urgency) => {
    const normalized = normalizeText(urgency)
    if (normalized.includes("eleve") || normalized.includes("urgent")) {
      return <Badge variant="destructive">Urgent</Badge>
    }
    if (normalized.includes("faible")) {
      return <Badge variant="outline">Faible</Badge>
    }
    return <Badge variant="secondary">Normale</Badge>
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src="/bc-skills-logo.jpeg" alt="BC SKILLS" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">BC SKILLS</h1>
                <p className="text-sm text-muted-foreground">Tableau de bord</p>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <Link to="/stock">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Stock
                </Button>
              </Link>
              <Link to="/demandes">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Demandes
                </Button>
              </Link>
              <Link to="/profil">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Profil
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bonjour, {user.name} 👋</h2>
          <p className="text-muted-foreground">{user.department} • Voici un aperçu de votre activité</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Demandes récentes
              </CardTitle>
              <CardDescription>Vos dernières demandes d'achat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{request.product}</p>
                        {getUrgencyBadge(request.urgency)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {request.quantity} • {request.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(request.status)}
                      <p className="text-xs text-muted-foreground">{request.id}</p>
                    </div>
                  </div>
                ))}
                {recentRequests.length === 0 && (
                  <div className="text-sm text-muted-foreground">Aucune demande recente.</div>
                )}
              </div>
              <div className="mt-4">
                <Link to="/demandes">
                  <Button variant="outline" className="w-full bg-transparent">
                    Voir toutes les demandes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Actions rapides
              </CardTitle>
              <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/demandes/nouvelle">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Nouvelle demande d'achat
                </Button>
              </Link>

              <Link to="/stock">
                <Button variant="outline" className="w-full bg-transparent">
                  <Package className="w-4 h-4 mr-2" />
                  Consulter le stock
                </Button>
              </Link>

              <Link to="/demandes">
                <Button variant="outline" className="w-full bg-transparent">
                  <Clock className="w-4 h-4 mr-2" />
                  Suivre mes demandes
                </Button>
              </Link>

              <Link to="/profil">
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Modifier mon profil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
