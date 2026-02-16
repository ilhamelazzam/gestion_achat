import React, { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Building, Calendar, ClipboardList, DollarSign, Package, User } from "lucide-react"
import { API_BASE_URL } from "../config"

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const formatDate = (value) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("fr-FR")
}

const displayValue = (value) => {
  if (value === null || value === undefined) return "-"
  const text = String(value).trim()
  return text.length > 0 ? text : "-"
}

const formatCurrency = (value) => {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "")
  const amount = Number.parseFloat(normalized)
  if (Number.isFinite(amount)) return `${amount} MAD`
  return displayValue(value)
}

const normalizeDemande = (raw) => {
  if (!raw) return null
  return {
    id: raw.requestNumber || raw.numero_demande || raw.id || "",
    product: raw.productName || raw.product_name || raw.produit || raw.product || "Produit",
    quantity: raw.quantity ?? raw.quantite ?? 1,
    status: raw.status || raw.statut || "En attente",
    urgency: raw.urgency || raw.urgence || "Normale",
    date: raw.createdAt || raw.created_at || raw.date || raw.date_creation || "",
    department: raw.userDepartment || raw.user_department || raw.departement || raw.department || "",
    requestedBy: raw.userName || raw.user_name || raw.requestedBy || raw.demandeur || "",
    motif: raw.justification || raw.motif || "",
      estimatedCost: raw.estimatedCost ?? raw.estimated_cost ?? raw.cout_estime ?? raw.estimatedCost,
    unitPrice: raw.unitPrice || raw.prix_unitaire || raw.unit_price || "",
    category: raw.category || raw.categorie || "",
    location: raw.location || raw.localisation || "",
    history: Array.isArray(raw.history) ? raw.history : [],
  }
}

export default function DemandeDetails() {
  const { id } = useParams()
  const location = useLocation()
  const initialDemande = useMemo(() => normalizeDemande(location.state?.demande), [location.state])
  const [demande, setDemande] = useState(initialDemande)
  const [loading, setLoading] = useState(!initialDemande)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token || !id) {
      if (!initialDemande) {
        setError("Non authentifie")
        setLoading(false)
      }
      return
    }

    let isActive = true
    const headers = { Authorization: `Bearer ${token}` }

    const findFromList = (list) =>
      list.find(
        (item) =>
          String(item.requestNumber || item.numero_demande || item.id || "") === id ||
          String(item.id || "") === id
      )

    const loadDemande = async () => {
      setLoading(true)
      setError("")
      try {
        let data = null
        if (/^\d+$/.test(id)) {
          const res = await fetch(`${API_BASE_URL}/demandes/${id}/`, { headers })
          if (res.ok) {
            data = await res.json()
          }
        }

        if (!data) {
          const listRes = await fetch(`${API_BASE_URL}/demandes/`, { headers })
          if (listRes.ok) {
            const list = await listRes.json()
            data = findFromList(Array.isArray(list) ? list : [])
          }
        }

        if (!isActive) return
        if (!data) {
          setError("Demande introuvable")
          setDemande(null)
        } else {
          setDemande(normalizeDemande(data))
        }
      } catch (err) {
        if (!isActive) return
        setError("Erreur lors du chargement de la demande")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    if (!initialDemande || String(initialDemande.id) !== String(id)) {
      loadDemande()
    } else {
      setLoading(false)
    }

    return () => {
      isActive = false
    }
  }, [id, initialDemande])

  const statusBadge = (status) => {
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
    if (normalized.includes("refus")) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Refusee
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

  const urgencyBadge = (urgency) => {
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
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/demandes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <img src="/bc-skills-logo.jpeg" alt="BC SKILLS" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Details de la demande</h1>
                <p className="text-sm text-muted-foreground">Information complete de la demande</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-sm text-muted-foreground">Chargement...</CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && demande && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    {demande.product}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {urgencyBadge(demande.urgency)}
                    {statusBadge(demande.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Numero</p>
                      <p className="text-sm font-medium text-foreground">{displayValue(demande.id)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(demande.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Quantite</p>
                      <p className="text-sm font-medium text-foreground">{displayValue(demande.quantity)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Departement</p>
                      <p className="text-sm font-medium text-foreground">{displayValue(demande.department)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Demande par</p>
                      <p className="text-sm font-medium text-foreground">{displayValue(demande.requestedBy)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Cout estime</p>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(demande.estimatedCost)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Motif</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {displayValue(demande.motif)}
              </CardContent>
            </Card>

            {(demande.unitPrice || demande.category || demande.location) && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Informations complementaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-sm">
                      <p className="text-xs uppercase text-muted-foreground">Prix unitaire</p>
                      <p className="font-medium text-foreground">{displayValue(demande.unitPrice)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs uppercase text-muted-foreground">Categorie</p>
                      <p className="font-medium text-foreground">{displayValue(demande.category)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs uppercase text-muted-foreground">Localisation</p>
                      <p className="font-medium text-foreground">{displayValue(demande.location)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {demande.history.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Historique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demande.history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{displayValue(item.status)}</p>
                        <p className="text-xs text-muted-foreground">{displayValue(item.comment)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
