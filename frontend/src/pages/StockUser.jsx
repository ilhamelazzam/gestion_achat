"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Package, AlertTriangle, CheckCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const router = useRouter()

  const products = [
    {
      id: "PROD-001",
      name: "Ordinateur portable Dell Latitude 5520",
      category: "Informatique",
      stock: 12,
      minStock: 5,
      price: "1200 MAD",
      supplier: "Dell Technologies",
      location: "Entrepôt A - Étagère 3",
    },
    {
      id: "PROD-002",
      name: "Chaise de bureau ergonomique",
      category: "Mobilier",
      stock: 3,
      minStock: 8,
      price: "350 MAD",
      supplier: "Herman Miller",
      location: "Entrepôt B - Zone 1",
    },
    {
      id: "PROD-003",
      name: "Imprimante laser HP LaserJet Pro",
      category: "Informatique",
      stock: 8,
      minStock: 3,
      price: "450 MAD",
      supplier: "HP Inc.",
      location: "Entrepôt A - Étagère 1",
    },
    {
      id: "PROD-004",
      name: "Écran 27 pouces 4K",
      category: "Informatique",
      stock: 15,
      minStock: 10,
      price: "300 MAD",
      supplier: "Samsung",
      location: "Entrepôt A - Étagère 2",
    },
    {
      id: "PROD-005",
      name: "Ramettes papier A4",
      category: "Fournitures",
      stock: 2,
      minStock: 20,
      price: "5 MAD",
      supplier: "Office Depot",
      location: "Entrepôt C - Zone 2",
    },
    {
      id: "PROD-006",
      name: "Stylos bille bleus (lot de 50)",
      category: "Fournitures",
      stock: 45,
      minStock: 15,
      price: "12 MAD",
      supplier: "BIC",
      location: "Entrepôt C - Zone 1",
    },
    {
      id: "PROD-007",
      name: 'Tablette iPad Pro 12.9"',
      category: "Informatique",
      stock: 6,
      minStock: 5,
      price: "1200 MAD",
      supplier: "Apple",
      location: "Entrepôt A - Coffre-fort",
    },
    {
      id: "PROD-008",
      name: "Casque audio Bluetooth",
      category: "Informatique",
      stock: 1,
      minStock: 10,
      price: "80 MAD",
      supplier: "Sony",
      location: "Entrepôt A - Étagère 4",
    },
  ]

  const getStockStatus = (stock: number, minStock: number) => {
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

  const categories = ["all", "Informatique", "Mobilier", "Fournitures"]

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

  const handleDemandProduct = (product: any) => {
    router.push("/demande/nouvelle", {
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Image src="/images/bc-skills-logo.png" alt="BC SKILLS" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Consultation Stock</h1>
                <p className="text-sm text-muted-foreground">Inventaire en temps réel</p>
              </div>
            </div>

            <Link href="/demandes/nouvelle">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Faire une demande
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        <span className="text-xs">#{product.id}</span>
                      </CardDescription>
                    </div>
                    {stockStatus.icon}
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
      </main>
    </div>
  )
}
