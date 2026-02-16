import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Alert, AlertDescription } from "../components/ui/alert"
import { ArrowLeft, ShoppingCart, AlertTriangle, Package, Hash } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { API_BASE_URL } from "../config"
import { getAccessToken, logout } from "../utils/auth"

export default function NouvelleDemandePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    produitId: "",
    nomProduit: "",
    stockActuel: 0,
    prixUnitaire: "",
    seuilMinimum: 0,
    quantiteSouhaitee: 1,
    justification: "",
    urgence: "normale",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showCriticalAlert, setShowCriticalAlert] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    // Try to get data from location state first
    const state = location.state
    
    if (state && state.produitId && state.nomProduit) {
      const stock = Number.parseInt(state.stockActuel || "0")
      const seuil = Number.parseInt(state.seuilMinimum || "0")

      setFormData((prev) => ({
        ...prev,
        produitId: state.produitId,
        nomProduit: state.nomProduit,
        stockActuel: stock,
        prixUnitaire: state.prixUnitaire || "",
        seuilMinimum: seuil,
      }))

      setShowCriticalAlert(stock < seuil)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nomProduit || !formData.justification) return

    setIsLoading(true)
    setSubmitError("")

    try {
      const token = getAccessToken()
      if (!token) {
        logout()
        return
      }

      const quantity = Math.max(1, Number.parseInt(formData.quantiteSouhaitee, 10) || 1)
      const priceValue = Number.parseFloat(
        String(formData.prixUnitaire || "")
          .replace(",", ".")
          .replace(/[^0-9.]/g, "")
      )
      const estimatedCost = Number.isFinite(priceValue) ? priceValue * quantity : 0

      const urgencyMap = {
        faible: "Faible",
        normale: "Normale",
        elevee: "Elevee",
        critique: "Critique",
      }

      const payload = {
        productId: formData.produitId ? Number.parseInt(formData.produitId, 10) : null,
        productName: formData.nomProduit,
        quantity: quantity,
        urgency: urgencyMap[formData.urgence] || "Normale",
        justification: formData.justification,
        estimatedCost: estimatedCost,
      }

      const response = await fetch(`${API_BASE_URL}/demandes/`, {
        method: "POST",
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
        throw new Error(`HTTP ${response.status}`)
      }

      const created = await response.json().catch(() => null)
      setIsLoading(false)
      navigate("/demandes?success=true", { state: { created } })
    } catch (_err) {
      setSubmitError("Erreur lors de l'envoi de la demande")
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (value) => {
    const quantity = Number.parseInt(value) || 1
    setFormData((prev) => ({ ...prev, quantiteSouhaitee: Math.max(1, quantity) }))
  }

  const formatCurrency = (value) => {
    const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "")
    const amount = Number.parseFloat(normalized)
    if (Number.isFinite(amount)) return `${amount} MAD`
    return "-"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/stock">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au stock
                </Button>
              </Link>
              <img src="/bc-skills-logo.jpeg" alt="BC SKILLS" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Nouvelle Demande</h1>
                <p className="text-sm text-muted-foreground">Formulaire de demande d'achat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Stock Alert */}
        {showCriticalAlert && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Attention :</strong> ce produit est en stock critique. La demande pourrait être refusée.
            </AlertDescription>
          </Alert>
        )}
        {submitError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Information Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Produit sélectionné
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.nomProduit ? (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Nom du produit</Label>
                      <p className="font-medium text-foreground">{formData.nomProduit}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Référence:</span>
                      <span className="font-mono text-sm">{formData.produitId}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Stock actuel</Label>
                        <p className="font-semibold text-lg">{formData.stockActuel}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Prix unitaire</Label>
                        <p className="font-semibold text-lg text-primary">{formatCurrency(formData.prixUnitaire)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Label className="text-xs text-muted-foreground">Estimation totale</Label>
                      <p className="font-bold text-xl text-primary">
                        {(
                          Number.parseFloat(String(formData.prixUnitaire || "").replace(/[^0-9.]/g, "")) *
                          formData.quantiteSouhaitee
                        ).toFixed(2)}
                        {" "}MAD
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun produit sélectionné</p>
                    <Link to="/stock">
                      <Button variant="outline" className="mt-4 bg-transparent">
                        Choisir un produit
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Demand Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Détails de la demande
                </CardTitle>
                <CardDescription>Remplissez les informations nécessaires pour votre demande d'achat</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité souhaitée *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantiteSouhaitee}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="bg-background"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Minimum: 1 unité</p>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label htmlFor="urgence">Niveau d'urgence</Label>
                    <select
                      id="urgence"
                      value={formData.urgence}
                      onChange={(e) => setFormData((prev) => ({ ...prev, urgence: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="faible">Faible - Pas pressé</option>
                      <option value="normale">Normale - Dans les temps</option>
                      <option value="elevee">Élevée - Urgent</option>
                      <option value="critique">Critique - Très urgent</option>
                    </select>
                  </div>

                  {/* Justification */}
                  <div className="space-y-2">
                    <Label htmlFor="justification">Justification de la demande *</Label>
                    <Textarea
                      id="justification"
                      placeholder="Expliquez pourquoi vous avez besoin de ce produit..."
                      value={formData.justification}
                      onChange={(e) => setFormData((prev) => ({ ...prev, justification: e.target.value }))}
                      className="bg-background min-h-[100px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Décrivez l'usage prévu et la nécessité de cette demande
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <Link to="/stock" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent">
                        Annuler
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading || !formData.nomProduit || !formData.justification}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Envoi en cours...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Valider ma demande
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
