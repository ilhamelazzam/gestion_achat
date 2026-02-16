"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ShoppingCart, AlertTriangle, Package, Calendar, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NouvelleDemandePage() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    produitNom: searchParams?.get("produitNom") || "",
    quantite: searchParams?.get("quantite") || "",
    motif: "",
    dateSouhaitee: "",
    departement: "Ressources Humaines",
    urgence: "Normale",
    stockActuel: searchParams?.get("stockActuel") || "",
    prixUnitaire: searchParams?.get("prixUnitaire") || "",
    produitId: searchParams?.get("produitId") || "",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(!formData.produitNom);

  // Mock product search
  const mockProducts = [
    { id: "PROD-001", nom: "Ordinateur portable Dell Latitude 5520", stock: 15, prix: 1200, seuil: 5 },
    { id: "PROD-002", nom: "Chaise de bureau ergonomique", stock: 8, prix: 350, seuil: 10 },
    { id: "PROD-003", nom: "Imprimante laser couleur HP", stock: 3, prix: 450, seuil: 5 },
    { id: "PROD-004", nom: "Écran 24 pouces Samsung", stock: 12, prix: 280, seuil: 8 },
    { id: "PROD-005", nom: "Clavier mécanique Logitech", stock: 25, prix: 120, seuil: 15 },
  ];

  const handleProductSearch = (query) => {
    if (query.length > 2) {
      const results = mockProducts.filter((product) => product.nom.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectProduct = (product) => {
    setFormData({
      ...formData,
      produitNom: product.nom,
      produitId: product.id,
      stockActuel: String(product.stock),
      prixUnitaire: String(product.prix),
    });
    setSearchResults([]);
    setShowSearch(false);
  };

  const calculateTotal = () => {
    const quantite = Number.parseInt(formData.quantite) || 0;
    const prix = Number.parseFloat(formData.prixUnitaire) || 0;
    return quantite * prix;
  };

  const isStockCritique = () => {
    const stock = Number.parseInt(formData.stockActuel) || 0;
    const seuil = (mockProducts.find((p) => p.id === formData.produitId) || {}).seuil || 5;
    return stock <= seuil;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: appeler ton backend ici

    await new Promise((resolve) => setTimeout(resolve, 2000));
    window.location.href = "/demandes?success=nouvelle-demande";
  };

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
              <Image src="/images/bc-skills-logo.png" alt="BC SKILLS" width={32} height={32} className="rounded-lg" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Nouvelle Demande</h1>
                <p className="text-sm text-muted-foreground">Créer une demande d'achat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert for critical stock */}
          {formData.produitNom && isStockCritique() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Attention : Stock critique</h3>
                <p className="text-sm text-red-700 mt-1">
                  Ce produit est en stock critique. La demande pourrait être refusée ou retardée.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Informations du produit
                  </CardTitle>
                  <CardDescription>Sélectionnez le produit et spécifiez la quantité</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="produit">Nom du produit *</Label>
                    {showSearch ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher un produit..."
                            className="pl-10"
                            onChange={(e) => handleProductSearch(e.target.value)}
                          />
                        </div>
                        {searchResults.length > 0 && (
                          <div className="border rounded-lg bg-card max-h-60 overflow-y-auto">
                            {searchResults.map((product) => (
                              <div
                                key={product.id}
                                className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => selectProduct(product)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{product.nom}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Stock: {product.stock} • Prix: {product.prix} MAD
                                    </p>
                                  </div>
                                  {product.stock <= product.seuil && (
                                    <Badge variant="destructive" className="text-xs">
                                      Stock critique
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{formData.produitNom}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                          Changer
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantite">Quantité souhaitée *</Label>
                      <Input
                        id="quantite"
                        type="number"
                        min="1"
                        value={formData.quantite}
                        onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgence">Niveau d'urgence</Label>
                      <Select
                        value={formData.urgence}
                        onValueChange={(value) => setFormData({ ...formData, urgence: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faible">Faible</SelectItem>
                          <SelectItem value="Normale">Normale</SelectItem>
                          <SelectItem value="Élevée">Élevée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motif">Motif de la demande *</Label>
                    <Textarea
                      id="motif"
                      placeholder="Expliquez pourquoi vous avez besoin de ce produit..."
                      value={formData.motif}
                      onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateSouhaitee">Date souhaitée</Label>
                      <Input
                        id="dateSouhaitee"
                        type="date"
                        value={formData.dateSouhaitee}
                        onChange={(e) => setFormData({ ...formData, dateSouhaitee: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departement">Département</Label>
                      <Select
                        value={formData.departement}
                        onValueChange={(value) => setFormData({ ...formData, departement: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Ventes">Ventes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Résumé de la demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.produitNom && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Produit</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{formData.produitNom}</p>
                      </div>

                      {formData.stockActuel && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Stock actuel</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">{formData.stockActuel} unités</p>
                        </div>
                      )}

                      {formData.prixUnitaire && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Prix unitaire</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">{formData.prixUnitaire} MAD</p>
                        </div>
                      )}

                      {formData.quantite && formData.prixUnitaire && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Coût total estimé</span>
                          </div>
                          <p className="text-lg font-bold text-primary pl-6">{calculateTotal()} MAD</p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Département</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{formData.departement}</p>
                  </div>

                  {formData.dateSouhaitee && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Date souhaitée</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {new Date(formData.dateSouhaitee).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!formData.produitNom || !formData.quantite || !formData.motif || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Valider ma demande
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
