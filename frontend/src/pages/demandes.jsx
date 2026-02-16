import React, { useEffect, useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Search, Filter, Plus, Eye, ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"
import { getAccessToken, logout } from "../utils/auth"

export default function DemandesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const navigate = useNavigate()

  const [demandes, setDemandes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [editForm, setEditForm] = useState({
    productId: "",
    product: "",
    quantity: 1,
    urgency: "normale",
    motif: "",
  })

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  const formatShortDate = (value) => {
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

  const parseNumericValue = (value) => {
    const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "")
    const amount = Number.parseFloat(normalized)
    return Number.isFinite(amount) ? amount : 0
  }

  const isPendingStatus = (status) => normalizeText(status).includes("attente")

  const mapUrgencyToSelectValue = (urgency) => {
    const normalized = normalizeText(urgency)
    if (normalized.includes("critique")) return "critique"
    if (normalized.includes("eleve") || normalized.includes("urgent")) return "elevee"
    if (normalized.includes("faible")) return "faible"
    return "normale"
  }

  const mapUrgencyToApiValue = (urgencyValue) => {
    if (urgencyValue === "critique") return "Critique"
    if (urgencyValue === "elevee") return "Elevee"
    if (urgencyValue === "faible") return "Faible"
    return "Normale"
  }

  const extractErrorMessage = async (response, fallbackMessage) => {
    try {
      const data = await response.json()
      if (typeof data === "string" && data.trim()) return data
      if (data?.detail) return String(data.detail)
      if (data?.error) return String(data.error)
      const firstValue = Object.values(data || {}).find((value) => value)
      if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
      if (firstValue) return String(firstValue)
      return fallbackMessage
    } catch (_err) {
      return fallbackMessage
    }
  }

  const resolveApiId = (demande) => {
    if (demande?.apiId !== null && demande?.apiId !== undefined && String(demande.apiId).trim() !== "") {
      return String(demande.apiId)
    }
    const fallback = String(demande?.id || "")
      .replace(/^#/, "")
      .trim()
    return fallback || null
  }

  const loadDemandes = async (showLoader = true) => {
    const token = getAccessToken()
    if (!token) {
      logout()
      return
    }

    if (showLoader) setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE_URL}/demandes/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        logout()
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const mapped = (Array.isArray(data) ? data : []).map((item) => {
        const estimatedCostValue = parseNumericValue(item.estimatedCost ?? item.estimated_cost ?? item.cout_estime)
        return {
          apiId: item.id ?? item.demande_id ?? item.demandeId ?? null,
          id: item.requestNumber || item.numero_demande || String(item.id || ""),
          productId: item.productId ?? item.product_id ?? item.produit_id ?? null,
          product: item.productName || item.product_name || item.produit || "",
          quantity: item.quantity ?? item.quantite ?? 1,
          status: item.status || item.statut || "En attente",
          urgency: item.urgency || item.urgence || "Normale",
          date: formatShortDate(item.createdAt || item.created_at || item.date),
          motif: item.justification || item.motif || "",
          estimatedCostValue,
          estimatedCost: formatCurrency(estimatedCostValue),
          department: item.userDepartment || item.user_department || item.departement || item.department || "",
          requestedBy: item.userName || item.user_name || "",
        }
      })

      setDemandes(mapped)
    } catch (_err) {
      setError("Erreur lors du chargement des demandes")
    } finally {
      if (showLoader) setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    const token = getAccessToken()
    if (!token) return

    setIsLoadingProducts(true)
    try {
      const response = await fetch(`${API_BASE_URL}/produits/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        logout()
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const mapped = (Array.isArray(data) ? data : [])
        .map((item) => ({
          id: String(item.id ?? item.code ?? item.sku ?? ""),
          name: String(item.name ?? item.nom ?? "").trim(),
        }))
        .filter((item) => item.id && item.name)

      setProducts(mapped)
    } catch (_err) {
      setProducts([])
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadDemandes()
    loadProducts()
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

  const getUrgencyBadge = (urgency) => {
    const normalized = normalizeText(urgency)
    if (normalized.includes("eleve") || normalized.includes("critique") || normalized.includes("urgent")) {
      return <Badge variant="destructive">Urgent</Badge>
    }
    if (normalized.includes("faible")) {
      return <Badge variant="outline">Faible</Badge>
    }
    return <Badge variant="secondary">Normale</Badge>
  }
  const filteredDemandes = demandes.filter((demande) => {
    const search = normalizeText(searchTerm)
    const matchesSearch =
      normalizeText(demande.product).includes(search) ||
      normalizeText(demande.id).includes(search)
    const matchesStatus = statusFilter === "all" || normalizeText(demande.status) === normalizeText(statusFilter)
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (demande) => {
    navigate(`/demande/details/${demande.id}`, { state: { demande } })
  }

  const resetEditState = () => {
    setIsEditModalOpen(false)
    setSelectedDemande(null)
    setEditForm({
      productId: "",
      product: "",
      quantity: 1,
      urgency: "normale",
      motif: "",
    })
  }

  const handleOpenEdit = (demande) => {
    if (!isPendingStatus(demande.status)) {
      setActionError("Seules les demandes en attente peuvent etre modifiees.")
      return
    }
    if (products.length === 0) {
      loadProducts()
    }
    const selectedById = products.find((product) => String(product.id) === String(demande.productId ?? ""))
    const selectedByName = products.find(
      (product) => normalizeText(product.name) === normalizeText(demande.product)
    )
    const selectedProduct = selectedById || selectedByName || null

    setActionError("")
    setSelectedDemande(demande)
    setEditForm({
      productId: selectedProduct ? String(selectedProduct.id) : String(demande.productId ?? ""),
      product: selectedProduct ? selectedProduct.name : demande.product || "",
      quantity: Number(demande.quantity) || 1,
      urgency: mapUrgencyToSelectValue(demande.urgency),
      motif: demande.motif || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateDemande = async (event) => {
    event.preventDefault()
    if (!selectedDemande) return

    const token = getAccessToken()
    if (!token) {
      logout()
      return
    }

    const apiId = resolveApiId(selectedDemande)
    if (!apiId) {
      setActionError("Impossible de modifier cette demande: identifiant introuvable.")
      return
    }

    const quantity = Math.max(1, Number.parseInt(editForm.quantity, 10) || 1)
    const previousQuantity = Math.max(1, Number.parseInt(selectedDemande.quantity, 10) || 1)
    const unitEstimatedCost = selectedDemande.estimatedCostValue > 0 ? selectedDemande.estimatedCostValue / previousQuantity : 0
    const payload = {
      productId: editForm.productId ? Number.parseInt(editForm.productId, 10) : null,
      productName: editForm.product,
      quantity,
      urgency: mapUrgencyToApiValue(editForm.urgency),
      justification: editForm.motif,
    }
    if (unitEstimatedCost > 0) {
      payload.estimatedCost = Number((unitEstimatedCost * quantity).toFixed(2))
    }

    setIsSaving(true)
    setActionError("")
    try {
      const response = await fetch(`${API_BASE_URL}/demandes/${apiId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        logout()
        return
      }

      if (!response.ok) {
        const message = await extractErrorMessage(response, "Erreur lors de la modification de la demande")
        throw new Error(message)
      }

      await loadDemandes(false)
      resetEditState()
    } catch (requestError) {
      setActionError(requestError.message || "Erreur lors de la modification de la demande")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDemande = async (demande) => {
    if (!isPendingStatus(demande.status)) {
      setActionError("Seules les demandes en attente peuvent etre supprimees.")
      return
    }

    const confirmed = window.confirm("Voulez-vous vraiment supprimer cette demande ?")
    if (!confirmed) return

    const token = getAccessToken()
    if (!token) {
      logout()
      return
    }

    const apiId = resolveApiId(demande)
    if (!apiId) {
      setActionError("Impossible de supprimer cette demande: identifiant introuvable.")
      return
    }

    setIsDeleting(true)
    setActionError("")
    try {
      const response = await fetch(`${API_BASE_URL}/demandes/${apiId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        logout()
        return
      }

      if (!response.ok) {
        const message = await extractErrorMessage(response, "Erreur lors de la suppression de la demande")
        throw new Error(message)
      }

      await loadDemandes(false)
      if (selectedDemande && String(resolveApiId(selectedDemande)) === String(apiId)) {
        resetEditState()
      }
    } catch (requestError) {
      setActionError(requestError.message || "Erreur lors de la suppression de la demande")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboarduser">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <img src="/bc-skills-logo.jpeg" alt="BC SKILLS" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Mes Demandes</h1>
                <p className="text-sm text-muted-foreground">Gestion des demandes d'achat</p>
              </div>
            </div>

            <Link to="/demandes/nouvelle">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle demande
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher par produit ou numéro de demande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Approuvée">Approuvée</SelectItem>
                    <SelectItem value="Refusée">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && error && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {!isLoading && !error && actionError && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-4 text-sm text-red-600">{actionError}</CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredDemandes.length} demande{filteredDemandes.length > 1 ? "s" : ""} trouvée
            {filteredDemandes.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Demandes List */}
        <div className="space-y-4">
          {filteredDemandes.map((demande) => (
            <Card key={demande.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{demande.product}</h3>
                          {getUrgencyBadge(demande.urgency)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>#{demande.id}</span>
                          <span>Quantité: {demande.quantity}</span>
                          <span>{demande.date}</span>
                          <span>{demande.department}</span>
                        </div>
                      </div>
                      {getStatusBadge(demande.status)}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Motif:</span> {displayValue(demande.motif)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Coût estimé:</span> {displayValue(demande.estimatedCost)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(demande)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(demande)}
                      disabled={!isPendingStatus(demande.status) || isSaving || isDeleting}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteDemande(demande)}
                      disabled={!isPendingStatus(demande.status) || isSaving || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDemandes.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucune demande trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou créez une nouvelle demande.
              </p>
              <Link to="/demandes/nouvelle">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une demande
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        </>
        )}
      </main>

      {isEditModalOpen && selectedDemande && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Modifier la demande</h3>
              <form className="space-y-4" onSubmit={handleUpdateDemande}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Produit</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    value={editForm.productId}
                    onChange={(e) => {
                      const selected = products.find((product) => String(product.id) === String(e.target.value))
                      setEditForm((prev) => ({
                        ...prev,
                        productId: e.target.value,
                        product: selected ? selected.name : prev.product,
                      }))
                    }}
                    required
                  >
                    {!editForm.productId && <option value="">Selectionner un produit</option>}
                    {isLoadingProducts && <option value="">Chargement des produits...</option>}
                    {!isLoadingProducts &&
                      products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Quantite</label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, quantity: Math.max(1, Number.parseInt(e.target.value, 10) || 1) }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Urgence</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    value={editForm.urgency}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, urgency: e.target.value }))}
                  >
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="elevee">Elevee</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Motif</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
                    value={editForm.motif}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, motif: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetEditState} disabled={isSaving}>
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
