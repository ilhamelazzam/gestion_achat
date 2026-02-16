import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Search, Filter, Package, AlertTriangle, CheckCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from '../config'
import { getAccessToken, logout } from "../utils/auth"

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Charger les produits depuis l'API
  const loadProducts = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        navigate('/loginuser');
        return;
      }

      const url = `${API_BASE_URL}/produits/`;
      console.log('🔍 Chargement des produits depuis:', url);
      console.log('🔑 API_BASE_URL:', API_BASE_URL);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Produits chargés:', data.length);
        const mapped = (Array.isArray(data) ? data : []).map((p) => ({
          id: String(p.id ?? ''),
          name: p.name ?? p.nom ?? '',
          category: p.department ?? p.departement ?? 'Non catégorisé',
          stock: Number.isFinite(p.quantity) ? p.quantity : parseInt(p.quantite ?? 0, 10),
          minStock: Number.isFinite(p.minThreshold) ? p.minThreshold : parseInt(p.seuil_alerte ?? 0, 10),
          price: `${Number.isFinite(p.price) ? p.price : parseFloat(p.prix ?? 0)} MAD`,
          supplier: p.supplier ?? p.fournisseur ?? 'Non renseigné',
          location: 'Entrepôt principal',
          image: p.image || p.image_url || p.photo || '',
        }));
        setProducts(mapped);
      } else {
        console.error(`❌ Erreur HTTP ${response.status} lors du chargement des produits`);
        const errorText = await response.text();
        console.error('Détails:', errorText);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return {
        badge: <Badge variant="destructive">Rupture</Badge>,
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      }
    } else if (stock <= minStock) {
      return {
        badge: (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Stock faible
          </Badge>
        ),
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      }
    } else {
      return {
        badge: (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Disponible
          </Badge>
        ),
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      }
    }
  }

  // Extraire les catégories uniques des produits
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const stockStats = {
    total: products.length,
    available: products.filter((p) => p.stock > p.minStock).length,
    lowStock: products.filter((p) => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  }

  const handleDemandProduct = (product) => {
    navigate("/demandes/nouvelle", {
      state: {
        produitId: product.id,
        nomProduit: product.name,
        stockActuel: product.stock,
        prixUnitaire: product.price,
        seuilMinimum: product.minStock,
      },
    })
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
                <h1 className="text-xl font-bold text-foreground">Consultation Stock</h1>
                <p className="text-sm text-muted-foreground">Inventaire en temps réel</p>
              </div>
            </div>

            <Link to="/demandes/nouvelle">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Faire une demande
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && (
          <>
        {/* Stock Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total produits</p>
                  <p className="text-3xl font-bold text-foreground">{stockStats.total}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Disponibles</p>
                  <p className="text-3xl font-bold text-foreground">{stockStats.available}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Stock faible</p>
                  <p className="text-3xl font-bold text-foreground">{stockStats.lowStock}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ruptures</p>
                  <p className="text-3xl font-bold text-foreground">{stockStats.outOfStock}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom, référence ou fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.minStock)
            return (
              <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        <span className="text-xs">#{product.id}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover border border-border"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                          📦
                        </div>
                      )}
                      {stockStatus.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stock actuel</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.stock}</span>
                      {stockStatus.badge}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seuil minimum</span>
                    <span className="font-medium">{product.minStock}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prix unitaire</span>
                    <span className="font-semibold text-primary">{product.price}</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Fournisseur</span>
                      <span className="text-xs font-medium">{product.supplier}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Localisation</span>
                      <span className="text-xs font-medium">{product.location}</span>
                    </div>
                  </div>

                  {/* Updated onClick to use new demand handler */}
                  <Button
                    className="w-full mt-4"
                    variant={product.stock > 0 ? "default" : "secondary"}
                    disabled={product.stock === 0}
                    onClick={() => handleDemandProduct(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock > 0 ? "Demander ce produit" : "Produit indisponible"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </main>
    </div>
  )
}


