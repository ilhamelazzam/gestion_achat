"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Printer,
  Info,
  AlertTriangle,
  PieChart,
  Building2,
  Truck,
  Shield,
  Building,
  Globe,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState("Tous")
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("Tous les départements")
  const [statusFilter, setStatusFilter] = useState("Tous les statuts")
  const [roleFilter, setRoleFilter] = useState("Tous les rôles")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const usersPerPage = 10

  const navigationItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "products", label: "Produits", icon: Package },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
    { id: "reports", label: "Rapports", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  const statsCards = [
    {
      title: "Utilisateurs totaux",
      value: "2,543",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Commandes",
      value: "1,234",
      change: "+8%",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Revenus",
      value: "45,678 MAD",
      change: "+23%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Produits",
      value: "892",
      change: "+5%",
      icon: Package,
      color: "text-orange-600",
    },
  ]

  const suppliers = [
    "Dell Technologies",
    "BIC France",
    "Herman Miller",
    "HP Inc.",
    "Clairefontaine",
    "Samsung Electronics",
    "Canon",
    "Epson",
    "Logitech",
    "Microsoft",
  ]

  const categories = ["Électronique", "Papeterie", "Mobilier", "Informatique", "Bureautique"]

  const departments = [
    "Direction Générale",
    "Administration",
    "Ressources Humaines (RH)",
    "Finance / Comptabilité",
    "Achats",
    "Ventes / Commercial",
    "Marketing",
    "Production",
    "Logistique / Stock",
    "Informatique (IT)",
    "Qualité",
    "Maintenance",
    "Support / Service client",
    "Projets",
    "Juridique",
    "Recherche & Développement (R&D)",
    "Sécurité",
    "Environnement / HSE",
  ]

  const [products, setProducts] = useState([
    {
      id: "P001",
      name: "Ordinateur portable Dell",
      department: "Informatique (IT)",
      stock: 25,
      minThreshold: 10,
      supplier: "Dell Technologies",
      dateAdded: "2024-01-15",
    },
    {
      id: "P002",
      name: "Stylos BIC bleus",
      department: "Administration",
      stock: 150,
      minThreshold: 50,
      supplier: "BIC France",
      dateAdded: "2024-01-20",
    },
    {
      id: "P003",
      name: "Chaise de bureau ergonomique",
      department: "Ressources Humaines (RH)",
      stock: 8,
      minThreshold: 15,
      supplier: "Herman Miller",
      dateAdded: "2024-02-01",
    },
    {
      id: "P004",
      name: "Imprimante laser HP",
      department: "Informatique (IT)",
      stock: 3,
      minThreshold: 5,
      supplier: "HP Inc.",
      dateAdded: "2024-02-10",
    },
    {
      id: "P005",
      name: "Ramettes papier A4",
      department: "Administration",
      stock: 0,
      minThreshold: 20,
      supplier: "Clairefontaine",
      dateAdded: "2024-02-15",
    },
    {
      id: "P006",
      name: "Écran 24 pouces Samsung",
      department: "Informatique (IT)",
      stock: 12,
      minThreshold: 8,
      supplier: "Samsung Electronics",
      dateAdded: "2024-02-20",
    },
  ])

  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)

  const [productFilters, setProductFilters] = useState({
    name: "",
    department: "",
    stockStatus: "",
    supplier: "",
    dateFrom: "",
    dateTo: "",
    belowThreshold: false,
  })
  const [showProductFilters, setShowProductFilters] = useState(false)

  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [showOrderFilters, setShowOrderFilters] = useState(false)
  const [orderFilters, setOrderFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    customer: "",
    minAmount: "",
    maxAmount: "",
  })
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)

  const [showValidateOrderModal, setShowValidateOrderModal] = useState(false)
  const [showRefuseOrderModal, setShowRefuseOrderModal] = useState(false)
  const [orderToValidate, setOrderToValidate] = useState(null)
  const [orderToRefuse, setOrderToRefuse] = useState(null)

  const [reportType, setReportType] = useState("orders")

  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: "CMD001",
      customer: "Marie Dubois",
      email: "marie.dubois@email.com",
      date: "2024-01-15",
      status: "Livrée",
      total: 1250.0,
      items: 3,
      address: "123 Rue de la Paix, Paris",
    },
    {
      id: "CMD002",
      customer: "Jean Martin",
      email: "jean.martin@email.com",
      date: "2024-01-14",
      status: "En cours",
      total: 890.5,
      items: 2,
      address: "456 Avenue des Champs, Lyon",
    },
    {
      id: "CMD003",
      customer: "Sophie Laurent",
      email: "sophie.laurent@email.com",
      date: "2024-01-13",
      status: "En attente",
      total: 2100.75,
      items: 5,
      address: "789 Boulevard Saint-Germain, Marseille",
    },
    {
      id: "CMD004",
      customer: "Pierre Moreau",
      email: "pierre.moreau@email.com",
      date: "2024-01-12",
      status: "Annulée",
      total: 450.25,
      items: 1,
      address: "321 Rue Victor Hugo, Toulouse",
    },
    {
      id: "CMD005",
      customer: "Claire Rousseau",
      email: "claire.rousseau@email.com",
      date: "2024-01-11",
      status: "Livrée",
      total: 1680.9,
      items: 4,
      address: "654 Place de la République, Nice",
    },
  ])

  const handleValidateOrder = (order) => {
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: "Validée" } : o)))
    setShowValidateOrderModal(false)
    setOrderToValidate(null)
  }

  const handleRefuseOrder = (order) => {
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: "Refusée" } : o)))
    setShowRefuseOrderModal(false)
    setOrderToRefuse(null)
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearchTerm.toLowerCase())

    const matchesStatus = !orderFilters.status || order.status === orderFilters.status
    const matchesCustomer =
      !orderFilters.customer || order.customer.toLowerCase().includes(orderFilters.customer.toLowerCase())

    const orderDate = new Date(order.date)
    const matchesDateFrom = !orderFilters.dateFrom || orderDate >= new Date(orderFilters.dateFrom)
    const matchesDateTo = !orderFilters.dateTo || orderDate <= new Date(orderFilters.dateTo)

    const matchesMinAmount = !orderFilters.minAmount || order.total >= Number.parseFloat(orderFilters.minAmount)
    const matchesMaxAmount = !orderFilters.maxAmount || order.total <= Number.parseFloat(orderFilters.maxAmount)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCustomer &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesMinAmount &&
      matchesMaxAmount
    )
  })

  const activeOrderFiltersCount = Object.values(orderFilters).filter((value) => value !== "").length

  const allUsers = [
    {
      id: 1,
      name: "Marie Dubois",
      email: "marie@example.com",
      date: "2024-01-15",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 12 34 56 78",
      department: "Ressources Humaines (RH)",
    },
    {
      id: 2,
      name: "Pierre Martin",
      email: "pierre@example.com",
      date: "2024-01-14",
      status: "Inactif",
      role: "Administrateur",
      phone: "+212 6 23 45 67 89",
      department: "Direction Générale",
    },
    {
      id: 3,
      name: "Sophie Laurent",
      email: "sophie@example.com",
      date: "2024-01-13",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 34 56 78 90",
      department: "Marketing",
    },
    {
      id: 4,
      name: "Jean Moreau",
      email: "jean@example.com",
      date: "2024-01-12",
      status: "Actif",
      role: "Modérateur",
      phone: "+212 6 45 67 89 01",
      department: "Informatique (IT)",
    },
    {
      id: 5,
      name: "Claire Rousseau",
      email: "claire@example.com",
      date: "2024-01-11",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 56 78 90 12",
      department: "Finance / Comptabilité",
    },
    {
      id: 6,
      name: "Michel Durand",
      email: "michel@example.com",
      date: "2024-01-10",
      status: "Inactif",
      role: "Utilisateur",
      phone: "+212 6 67 89 01 23",
      department: "Production",
    },
    {
      id: 7,
      name: "Isabelle Leroy",
      email: "isabelle@example.com",
      date: "2024-01-09",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 78 90 12 34",
      department: "Ventes / Commercial",
    },
    {
      id: 8,
      name: "François Petit",
      email: "francois@example.com",
      date: "2024-01-08",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 89 01 23 45",
      department: "Logistique / Stock",
    },
    {
      id: 9,
      name: "Nathalie Roux",
      email: "nathalie@example.com",
      date: "2024-01-07",
      status: "Inactif",
      role: "Utilisateur",
      phone: "+212 6 90 12 34 56",
      department: "Support / Service client",
    },
    {
      id: 10,
      name: "Olivier Blanc",
      email: "olivier@example.com",
      date: "2024-01-06",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 01 23 45 67",
      department: "Qualité",
    },
    {
      id: 11,
      name: "Sylvie Moreau",
      email: "sylvie@example.com",
      date: "2024-01-05",
      status: "Actif",
      role: "Utilisateur",
      phone: "+212 6 12 34 56 78",
      department: "Achats",
    },
    {
      id: 12,
      name: "Alain Girard",
      email: "alain@example.com",
      date: "2024-01-04",
      status: "Inactif",
      role: "Utilisateur",
      phone: "+212 6 23 45 67 89",
      department: "Maintenance",
    },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesName =
      product.name.toLowerCase().includes(productFilters.name.toLowerCase()) ||
      product.id.toLowerCase().includes(productFilters.name.toLowerCase())
    const matchesCategory = !productFilters.category || product.category === productFilters.category
    const matchesSupplier = !productFilters.supplier || product.supplier === productFilters.supplier

    let matchesStock = true
    if (productFilters.stockStatus === "En stock") {
      matchesStock = product.stock > product.minThreshold
    } else if (productFilters.stockStatus === "Stock faible") {
      matchesStock = product.stock > 0 && product.stock <= product.minThreshold
    } else if (productFilters.stockStatus === "Rupture") {
      matchesStock = product.stock === 0
    }

    const matchesThreshold = !productFilters.belowThreshold || product.stock <= product.minThreshold

    let matchesDate = true
    if (productFilters.dateFrom) {
      matchesDate = matchesDate && new Date(product.dateAdded) >= new Date(productFilters.dateFrom)
    }
    if (productFilters.dateTo) {
      matchesDate = matchesDate && new Date(product.dateAdded) <= new Date(productFilters.dateTo)
    }

    return matchesName && matchesCategory && matchesSupplier && matchesStock && matchesThreshold && matchesDate
  })

  const activeProductFiltersCount = Object.values(productFilters).filter(
    (value) => value !== "" && value !== false,
  ).length

  const clearProductFilters = () => {
    setProductFilters({
      name: "",
      category: "",
      stockStatus: "",
      supplier: "",
      belowThreshold: false,
      dateFrom: "",
      dateTo: "",
    })
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteProductModal(true)
  }

  const confirmDeleteProduct = () => {
    setProducts(products.filter((p) => p.id !== productToDelete.id))
    setShowDeleteProductModal(false)
    setProductToDelete(null)
  }

  const getStockStatus = (product) => {
    if (product.stock === 0) return { text: "Rupture", color: "bg-red-100 text-red-800" }
    if (product.stock <= product.minThreshold) return { text: "Stock faible", color: "bg-yellow-100 text-yellow-800" }
    return { text: "En stock", color: "bg-green-100 text-green-800" }
  }

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())

    const matchesDepartment = !departmentFilter || user.department === departmentFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    const matchesRole = !roleFilter || user.role === roleFilter

    const matchesDateRange =
      (!dateFromFilter || user.date >= dateFromFilter) && (!dateToFilter || user.date <= dateToFilter)

    return matchesSearch && matchesDepartment && matchesStatus && matchesRole && matchesDateRange
  })

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)

  const [mockRoles, setMockRoles] = useState([
    { id: 1, nom: "Administrateur", permissions: ["Tous les modules"], description: "Accès complet au système" },
    {
      id: 2,
      nom: "Gestionnaire",
      permissions: ["Utilisateurs", "Produits", "Commandes"],
      description: "Gestion des opérations",
    },
    { id: 3, nom: "Employé", permissions: ["Consultation"], description: "Accès en lecture seule" },
  ])

  const [companySettings, setCompanySettings] = useState({
    nom: "Mon Entreprise SARL",
    adresse: "123 Rue de la Paix, Casablanca",
    email: "contact@monentreprise.ma",
    telephone: "+212 5 22 XX XX XX",
    devise: "MAD",
    langue: "Français",
    fuseauHoraire: "Africa/Casablanca",
  })

  const [stockSettings, setStockSettings] = useState({
    seuilGlobal: 10,
    alertesActives: true,
    alerteEmail: true,
  })

  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AdminPanel</h1>
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="mt-6 px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center px-3 py-3 mb-1 text-left rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${activeSection === item.id ? "text-blue-700" : "text-gray-500"}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )

  const notifications = [
    {
      id: 1,
      type: "Stock",
      message: 'Le stock du produit "Câble RJ45" est en dessous du seuil minimum.',
      timestamp: "01/09/2025 10:15",
      isRead: false,
      icon: "📦",
    },
    {
      id: 2,
      type: "Commande",
      message: "Une nouvelle commande (#CMD123) a été soumise.",
      timestamp: "01/09/2025 09:48",
      isRead: false,
      icon: "🛒",
    },
    {
      id: 3,
      type: "Utilisateur",
      message: 'L\'utilisateur "amine@erp.com" a été ajouté au département Achats.',
      timestamp: "01/09/2025 08:20",
      isRead: true,
      icon: "👤",
    },
    {
      id: 4,
      type: "Commande",
      message: "La commande #CMD456 a été acceptée.",
      timestamp: "31/08/2025 16:05",
      isRead: true,
      icon: "✅",
    },
    {
      id: 5,
      type: "Système",
      message: "⚠ Une erreur est survenue lors de la validation de la commande #CMD789.",
      timestamp: "31/08/2025 15:30",
      isRead: false,
      icon: "⚠️",
    },
    {
      id: 6,
      type: "Stock",
      message: 'Produit "Imprimante HP" ajouté avec succès.',
      timestamp: "31/08/2025 14:20",
      isRead: true,
      icon: "📦",
    },
    {
      id: 7,
      type: "Utilisateur",
      message: "Nouvel utilisateur inscrit: sarah@erp.com",
      timestamp: "31/08/2025 13:45",
      isRead: false,
      icon: "👤",
    },
    {
      id: 8,
      type: "Stock",
      message: 'Le produit "Souris optique" a été réapprovisionné.',
      timestamp: "30/08/2025 17:30",
      isRead: true,
      icon: "📦",
    },
    {
      id: 9,
      type: "Commande",
      message: "Commande #CMD321 en cours de livraison.",
      timestamp: "30/08/2025 16:15",
      isRead: true,
      icon: "🚚",
    },
    {
      id: 10,
      type: "Utilisateur",
      message: "Modification du profil utilisateur: mohamed@erp.com",
      timestamp: "30/08/2025 14:45",
      isRead: true,
      icon: "👤",
    },
    {
      id: 11,
      type: "Système",
      message: "Sauvegarde automatique effectuée avec succès.",
      timestamp: "30/08/2025 12:00",
      isRead: true,
      icon: "💾",
    },
    {
      id: 12,
      type: "Stock",
      message: 'Alerte: Stock critique pour "Clavier sans fil".',
      timestamp: "29/08/2025 18:20",
      isRead: true,
      icon: "⚠️",
    },
  ]

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const notificationTypes = ["Tous les types", "Stock", "Commande", "Utilisateur", "Système"]

  const filteredNotifications = notifications.filter((notification) => {
    if (notificationFilter === "Tous les types") return true
    return notification.type === notificationFilter
  })

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log("Marking all notifications as read")
  }

  const markAsRead = (notificationId) => {
    // In a real app, this would update the backend
    console.log(`Marking notification ${notificationId} as read`)
  }

  const displayedNotifications = showAllNotifications ? filteredNotifications : filteredNotifications.slice(0, 5)

  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {showAllNotifications ? "Toutes les notifications" : "Notifications"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {showAllNotifications && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllNotifications(false)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={notificationFilter}
                      onChange={(e) => setNotificationFilter(e.target.value)}
                      className="text-sm border border-gray-200 rounded px-2 py-1"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    {unreadNotifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Marquer tout comme lu
                      </Button>
                    )}
                  </div>
                </div>

                <div className={`overflow-y-auto ${showAllNotifications ? "max-h-96" : "max-h-80"}`}>
                  {displayedNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Aucune notification trouvée</div>
                  ) : (
                    displayedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{notification.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!notification.isRead ? "font-medium text-gray-900" : "text-gray-700"}`}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  notification.type === "Stock"
                                    ? "bg-orange-100 text-orange-800"
                                    : notification.type === "Commande"
                                      ? "bg-green-100 text-green-800"
                                      : notification.type === "Utilisateur"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            </div>
                          </div>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {filteredNotifications.length > 0 && !showAllNotifications && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllNotifications(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Voir toutes les notifications
                    </Button>
                  </div>
                )}

                {showAllNotifications && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <span className="text-sm text-gray-500">
                      {filteredNotifications.length} notification{filteredNotifications.length > 1 ? "s" : ""} au total
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-profile.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="hidden md:block font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>Profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("parametres")}>Paramètres</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} ce mois
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const Chart = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Statistiques des ventes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600">Graphique des ventes - Données factices</p>
            <p className="text-sm text-gray-500 mt-2">Intégration avec Chart.js ou Recharts recommandée</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const RecentUsersTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Utilisateurs récents</CardTitle>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowUserModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.slice(0, 4).map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell className="text-gray-600">{user.date}</TableCell>
                <TableCell className="text-gray-600">{user.department}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "Actif" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const RecentOrdersTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: "CMD001", client: "Marie Dubois", date: "2024-01-15", status: "Livré", amount: "1,250 MAD" },
              { id: "CMD002", client: "Pierre Martin", date: "2024-01-15", status: "En attente", amount: "890 MAD" },
              { id: "CMD003", client: "Sophie Laurent", date: "2024-01-14", status: "En cours", amount: "2,100 MAD" },
              { id: "CMD004", client: "Jean Moreau", date: "2024-01-14", status: "Livré", amount: "750 MAD" },
            ].map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="text-gray-600">{order.client}</TableCell>
                <TableCell className="text-gray-600">{order.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "Livré" ? "default" : order.status === "En cours" ? "secondary" : "outline"
                    }
                    className={
                      order.status === "Livré"
                        ? "bg-green-100 text-green-800"
                        : order.status === "En cours"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{order.amount}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un utilisateur</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowUserModal(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <Input placeholder="Entrez le nom complet" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" placeholder="Entrez l'email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <Input placeholder="Entrez le numéro de téléphone" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowUserModal(false)}>
            Annuler
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Ajouter</Button>
        </div>
      </div>
    </div>
  )

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un produit</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <Input placeholder="Entrez le nom du produit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
            <Input type="number" placeholder="Entrez le prix" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <Input placeholder="Entrez la catégorie" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
            <Input type="number" placeholder="Quantité en stock" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil minimal</label>
            <Input 
              type="number" 
              placeholder="Définir le seuil d'alerte"
              min="0"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sélectionner un fournisseur</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout</label>
            <Input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Description du produit..."
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowProductModal(false)}>
            Annuler
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">Ajouter</Button>
        </div>
      </div>
    </div>
  )

  const UsersSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Liste des utilisateurs</h1>
        <p className="text-gray-600">Gérez tous les utilisateurs de votre plateforme</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setShowUserModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            {/* Search bar */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  className="pl-10"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="ml-4">
                <Settings className="h-4 w-4 mr-2" />
                Filtres {showFilters ? "▲" : "▼"}
              </Button>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Department filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    <Select
                      value={departmentFilter}
                      onValueChange={(value) => {
                        setDepartmentFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les départements" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tous les départements">Tous les départements</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tous les statuts">Tous les statuts</SelectItem>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <Select
                      value={roleFilter}
                      onValueChange={(value) => {
                        setRoleFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les rôles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tous les rôles">Tous les rôles</SelectItem>
                        <SelectItem value="Administrateur">Administrateur</SelectItem>
                        <SelectItem value="Modérateur">Modérateur</SelectItem>
                        <SelectItem value="Utilisateur">Utilisateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date from filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription (de)</label>
                    <Input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => {
                        setDateFromFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>

                  {/* Date to filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription (à)</label>
                    <Input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => {
                        setDateToFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                </div>

                {/* Filter actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""} trouvé
                    {filteredUsers.length !== 1 ? "s" : ""}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Fermer les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.date}</TableCell>
                  <TableCell className="text-gray-600">{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Actif" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserDetailsModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteConfirmModal(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Affichage de {startIndex + 1} à {Math.min(startIndex + usersPerPage, filteredUsers.length)} sur{" "}
                {filteredUsers.length} utilisateurs
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const UserDetailsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Détails de l'utilisateur</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowUserDetailsModal(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <p className="text-gray-900 font-medium">{selectedUser.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <p className="text-gray-900">{selectedUser.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <p className="text-gray-900">{selectedUser.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <p className="text-gray-900">{selectedUser.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <Badge variant={selectedUser.status === "Actif" ? "default" : "secondary"}>{selectedUser.status}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
              <p className="text-gray-900">{selectedUser.date}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  )

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirmModal(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {selectedUser && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Êtes-vous sûr de vouloir supprimer l'utilisateur suivant ?</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{selectedUser.name}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
            <p className="text-sm text-red-600 mt-2">Cette action est irréversible.</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)}>
            Annuler
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              // Simulate deletion
              console.log("Utilisateur supprimé:", selectedUser)
              setShowDeleteConfirmModal(false)
              setSelectedUser(null)
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )

  const DashboardContent = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, Admin</h1>
        <p className="text-gray-600">Voici un aperçu de votre tableau de bord</p>
      </div>

      <StatsCards />
      <Chart />

      <div className="space-y-8">
        <RecentUsersTable />
        <RecentOrdersTable />
      </div>
    </div>
  )

  const ProductsSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Produits</h1>
        <p className="text-gray-600">Gérez tous les produits de votre inventaire</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produits ({filteredProducts.length})</CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setShowProductModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom ou référence..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={productFilters.name}
                onChange={(e) => setProductFilters({ ...productFilters, name: e.target.value })}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowProductFilters(!showProductFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {activeProductFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {activeProductFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showProductFilters ? "rotate-180" : ""}`} />
              </Button>

              {activeProductFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearProductFilters} className="text-gray-500 hover:text-gray-700">
                  Effacer les filtres
                </Button>
              )}
            </div>

            {showProductFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFilters.department}
                    onChange={(e) => setProductFilters({ ...productFilters, department: e.target.value })}
                  >
                    <option value="">Tous les départements</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFilters.stockStatus}
                    onChange={(e) => setProductFilters({ ...productFilters, stockStatus: e.target.value })}
                  >
                    <option value="">Tous les stocks</option>
                    <option value="En stock">En stock</option>
                    <option value="Stock faible">Stock faible</option>
                    <option value="Rupture">Rupture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFilters.supplier}
                    onChange={(e) => setProductFilters({ ...productFilters, supplier: e.target.value })}
                  >
                    <option value="">Tous les fournisseurs</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout (de)</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFilters.dateFrom}
                    onChange={(e) => setProductFilters({ ...productFilters, dateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout (à)</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFilters.dateTo}
                    onChange={(e) => setProductFilters({ ...productFilters, dateTo: e.target.value })}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="belowThreshold"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={productFilters.belowThreshold}
                    onChange={(e) => setProductFilters({ ...productFilters, belowThreshold: e.target.checked })}
                  />
                  <label htmlFor="belowThreshold" className="ml-2 text-sm text-gray-700">
                    Sous le seuil minimal
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock réel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seuil minimal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{product.stock}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.minThreshold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.dateAdded).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowProductDetailsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Aucun produit ne correspond aux critères de recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {showProductDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails du produit</h3>
              <button onClick={() => setShowProductDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nom:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Catégorie:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Stock réel:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.stock}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Seuil minimal:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.minThreshold}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fournisseur:</span>
                <span className="ml-2 text-gray-900">{selectedProduct.supplier}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date d'ajout:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(selectedProduct.dateAdded).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Statut:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStockStatus(selectedProduct).color}`}>
                  {getStockStatus(selectedProduct).text}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setShowProductDetailsModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {showDeleteProductModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
              <button onClick={() => setShowDeleteProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete.name}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteProductModal(false)}>
                Annuler
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteProduct}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const OrdersSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
        <p className="text-gray-600">
          Gérez toutes les commandes de votre plateforme. Utilisez les filtres pour affiner votre recherche et
          personnaliser l'affichage.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setShowOrderModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par client, ID commande ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowOrderFilters(!showOrderFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {activeOrderFiltersCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {activeOrderFiltersCount}
                  </span>
                )}
                {showOrderFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {activeOrderFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    setOrderFilters({
                      status: "",
                      dateFrom: "",
                      dateTo: "",
                      customer: "",
                      minAmount: "",
                      maxAmount: "",
                    })
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer les filtres
                </Button>
              )}
            </div>

            {showOrderFilters && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.status}
                      onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="En attente">En attente</option>
                      <option value="En cours">En cours</option>
                      <option value="Validée">Validée</option>
                      <option value="Refusée">Refusée</option>
                      <option value="Livrée">Livrée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      placeholder="Nom du client"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.customer}
                      onChange={(e) => setOrderFilters({ ...orderFilters, customer: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.dateFrom}
                      onChange={(e) => setOrderFilters({ ...orderFilters, dateFrom: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.dateTo}
                      onChange={(e) => setOrderFilters({ ...orderFilters, dateTo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant min (MAD)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.minAmount}
                      onChange={(e) => setOrderFilters({ ...orderFilters, minAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant max (MAD)</label>
                    <input
                      type="number"
                      placeholder="10000"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={orderFilters.maxAmount}
                      onChange={(e) => setOrderFilters({ ...orderFilters, maxAmount: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID Commande</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Articles</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-blue-600">{order.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(order.date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Livrée"
                            ? "bg-green-100 text-green-800"
                            : order.status === "En cours"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "En attente"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Validée"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "Refusée"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.items}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{order.total.toFixed(2)} MAD</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {order.status === "En attente" && (
                          <>
                            <button
                              onClick={() => {
                                setOrderToValidate(order)
                                setShowValidateOrderModal(true)
                              }}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Valider la commande"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setOrderToRefuse(order)
                                setShowRefuseOrderModal(true)
                              }}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Refuser la commande"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDetailsModal(true)
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order)
                            setShowDeleteOrderModal(true)
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails de la commande {selectedOrder.id}</h3>
              <button onClick={() => setShowOrderDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <p className="text-gray-900">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedOrder.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{new Date(selectedOrder.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === "Livrée"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "En cours"
                          ? "bg-blue-100 text-blue-800"
                          : selectedOrder.status === "En attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedOrder.status === "Validée"
                              ? "bg-emerald-100 text-emerald-800"
                              : selectedOrder.status === "Refusée"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Articles</label>
                  <p className="text-gray-900">{selectedOrder.items}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <p className="text-gray-900 font-semibold">{selectedOrder.total.toFixed(2)} MAD</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse de livraison</label>
                <p className="text-gray-900">{selectedOrder.address}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowOrderDetailsModal(false)} className="flex-1">
                Fermer
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Modifier le statut</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {showDeleteOrderModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Supprimer la commande</h3>
              <button onClick={() => setShowDeleteOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la commande <strong>{orderToDelete.id}</strong> de{" "}
              <strong>{orderToDelete.customer}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteOrderModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteOrderModal(false)
                  setOrderToDelete(null)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {showValidateOrderModal && orderToValidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">Valider la commande</h3>
              <button onClick={() => setShowValidateOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-gray-900 font-medium">Commande {orderToValidate.id}</p>
                <p className="text-gray-600 text-sm">Client: {orderToValidate.customer}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir valider cette commande ? Le client sera notifié et la commande passera en statut
              "Validée".
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowValidateOrderModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={() => handleValidateOrder(orderToValidate)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRefuseOrderModal && orderToRefuse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Refuser la commande</h3>
              <button onClick={() => setShowRefuseOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center mb-4">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-gray-900 font-medium">Commande {orderToRefuse.id}</p>
                <p className="text-gray-600 text-sm">Client: {orderToRefuse.customer}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motif du refus (optionnel)</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
                placeholder="Expliquez pourquoi cette commande est refusée..."
              />
            </div>
            <p className="text-gray-600 mb-6">Cette commande sera marquée comme refusée et le client sera notifié.</p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowRefuseOrderModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={() => handleRefuseOrder(orderToRefuse)} className="flex-1 bg-red-600 hover:bg-red-700">
                Refuser
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const ReportsSection = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Calculate statistics
    const totalOrders = mockOrders.length
    const totalOrderAmount = mockOrders.reduce((sum, order) => sum + order.montant, 0)
    const activeUsers = mockUsers.filter((user) => user.statut === "Actif").length
    const inactiveUsers = mockUsers.filter((user) => user.statut === "Inactif").length
    const lowStockProducts = mockProducts.filter((product) => product.stockReel < product.seuilMinimal).length
    const outOfStockProducts = mockProducts.filter((product) => product.stockReel === 0).length
    const totalStockValue = mockProducts.reduce((sum, product) => sum + product.stockReel * product.prix, 0)
    const totalUsers = mockUsers.length

    // Top 5 products by stock
    const topProducts = [...mockProducts].sort((a, b) => b.stockReel - a.stockReel).slice(0, 5)

    // Orders by status with emojis
    const ordersByStatus = {
      "🕓 En attente": mockOrders.filter((order) => order.statut === "En attente").length,
      "✅ Confirmée": mockOrders.filter((order) => order.statut === "Confirmée").length,
      "📦 Expédiée": mockOrders.filter((order) => order.statut === "Expédiée").length,
      "🚚 Livrée": mockOrders.filter((order) => order.statut === "Livrée").length,
      "❌ Annulée": mockOrders.filter((order) => order.statut === "Annulée").length,
    }

    // Users by department
    const usersByDepartment = mockUsers.reduce((acc, user) => {
      acc[user.departement] = (acc[user.departement] || 0) + 1
      return acc
    }, {})

    // Users by role
    const usersByRole = mockUsers.reduce((acc, user) => {
      const role = user.email.includes("admin")
        ? "Admin"
        : user.email.includes("manager")
          ? "Gestionnaire"
          : "Utilisateur"
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})

    const exportToPDF = () => {
      alert("📤 Export PDF en cours de développement...")
    }

    const exportToExcel = () => {
      alert("📊 Export Excel en cours de développement...")
    }

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Rapports</h1>
          <p className="text-gray-600">
            Bienvenue dans le module Rapports. Consultez ici les statistiques clés du système, les données de commandes,
            les alertes de stock, ainsi que l'activité des utilisateurs. Utilisez les filtres pour personnaliser
            l'affichage et exporter les rapports souhaités.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtrer par période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={reportDateStart}
                  onChange={(e) => setReportDateStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={reportDateEnd}
                  onChange={(e) => setReportDateEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <select
                  value={reportDepartment}
                  onChange={(e) => setReportDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les départements</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut de commande</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="En attente">En attente</option>
                  <option value="Confirmée">Confirmée</option>
                  <option value="Expédiée">Expédiée</option>
                  <option value="Livrée">Livrée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />📅 Rapports de commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Nombre total de commandes</span>
                  <span className="text-lg font-bold text-blue-600">{totalOrders}</span>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Répartition des commandes par état :</h4>
                  <div className="space-y-2">
                    {Object.entries(ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Courbe de commandes par semaine/mois</p>
                    <p className="text-xs text-gray-400">Graphique en développement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />📦 Rapports de stock (produits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Produits sous le seuil minimal</span>
                  <span className="text-lg font-bold text-red-600">{lowStockProducts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Produits en rupture de stock</span>
                  <span className="text-lg font-bold text-orange-600">{outOfStockProducts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Quantité totale en stock</span>
                  <span className="text-lg font-bold text-blue-600">
                    {mockProducts.reduce((sum, p) => sum + p.stockReel, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">💰 Valeur estimée du stock total</span>
                  <span className="text-lg font-bold text-green-600">{totalStockValue.toLocaleString()} MAD</span>
                </div>

                {lowStockProducts > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        🔔 {lowStockProducts} produit(s) nécessite(nt) un réapprovisionnement
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Users Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />👤 Rapports utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Nombre total d'utilisateurs</span>
                  <span className="text-lg font-bold text-blue-600">{totalUsers}</span>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Répartition par département</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(usersByDepartment).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">{dept}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Répartition par rôle</h4>
                  <div className="space-y-2">
                    {Object.entries(usersByRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{role}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts & Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />📈 Graphiques & Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <PieChart className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700">Évolution des commandes</p>
                  <p className="text-xs text-blue-500">Graphique en camembert</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">Activité des utilisateurs</p>
                  <p className="text-xs text-green-500">Graphique en barres</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-700">Répartition du stock par département</p>
                  <p className="text-xs text-purple-500">Graphique en lignes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />🧾 Exports & impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 transition-colors duration-200">
                <FileText className="h-4 w-4 mr-2" />📤 Exporter en PDF
              </Button>
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />📊 Exporter en Excel
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                🖨️ Imprimer les rapports
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Informations sur les exports</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Les rapports peuvent être exportés aux formats PDF et Excel. Utilisez les filtres ci-dessus pour
                    personnaliser le contenu de votre rapport selon la période, le département et le statut souhaités.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const SettingsSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">
          Cette section vous permet de gérer les paramètres généraux du système. Ajoutez des départements, configurez
          les fournisseurs, définissez les rôles utilisateurs et ajustez les seuils de stock pour une meilleure
          automatisation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestion des départements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle>Départements</CardTitle>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowDepartmentModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{dept}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedDepartment(dept)
                        setShowDepartmentModal(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gestion des fournisseurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <CardTitle>Fournisseurs</CardTitle>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowSupplierModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {suppliers.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{supplier}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedSupplier(supplier)
                        setShowSupplierModal(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration des seuils */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>Seuils de Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seuil minimal global</label>
              <input
                type="number"
                value={stockSettings.seuilGlobal}
                onChange={(e) => setStockSettings({ ...stockSettings, seuilGlobal: Number.parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Alertes automatiques</span>
              <button
                onClick={() => setStockSettings({ ...stockSettings, alertesActives: !stockSettings.alertesActives })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  stockSettings.alertesActives ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    stockSettings.alertesActives ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Alertes par email</span>
              <button
                onClick={() => setStockSettings({ ...stockSettings, alerteEmail: !stockSettings.alerteEmail })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  stockSettings.alerteEmail ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    stockSettings.alerteEmail ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Rôles & autorisations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle>Rôles & Autorisations</CardTitle>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowRoleModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mockRoles.map((role) => (
                <div key={role.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{role.nom}</span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRole(role)
                          setShowRoleModal(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'entreprise */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-indigo-600" />
              <CardTitle>Informations de l'Entreprise</CardTitle>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCompanyModal(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.adresse}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.telephone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres généraux */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-teal-600" />
              <CardTitle>Paramètres Généraux</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Devise par défaut</label>
                <select
                  value={companySettings.devise}
                  onChange={(e) => setCompanySettings({ ...companySettings, devise: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MAD">MAD - Dirham Marocain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Langue</label>
                <select
                  value={companySettings.langue}
                  onChange={(e) => setCompanySettings({ ...companySettings, langue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Français">Français</option>
                  <option value="Arabe">العربية</option>
                  <option value="Anglais">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuseau horaire</label>
                <select
                  value={companySettings.fuseauHoraire}
                  onChange={(e) => setCompanySettings({ ...companySettings, fuseauHoraire: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Africa/Casablanca">Africa/Casablanca</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDepartment ? "Modifier le département" : "Ajouter un département"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDepartmentModal(false)
                  setSelectedDepartment(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du département</label>
                <input
                  type="text"
                  defaultValue={selectedDepartment || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ressources Humaines"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowDepartmentModal(false)
                    setSelectedDepartment(null)
                  }}
                >
                  Annuler
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {selectedDepartment ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedSupplier ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSupplierModal(false)
                  setSelectedSupplier(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du fournisseur</label>
                <input
                  type="text"
                  defaultValue={selectedSupplier || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fournisseur ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@fournisseur.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+212 5 22 XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Adresse complète"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowSupplierModal(false)
                    setSelectedSupplier(null)
                  }}
                >
                  Annuler
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  {selectedSupplier ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedRole ? "Modifier le rôle" : "Ajouter un rôle"}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du rôle</label>
                <input
                  type="text"
                  defaultValue={selectedRole?.nom || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Superviseur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  defaultValue={selectedRole?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Description du rôle"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2">
                  {["Utilisateurs", "Produits", "Commandes", "Rapports", "Paramètres"].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedRole(null)
                  }}
                >
                  Annuler
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {selectedRole ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modifier les informations de l'entreprise</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCompanyModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  defaultValue={companySettings.nom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={companySettings.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue={companySettings.telephone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCompanyModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersSection />
      case "products":
        return <ProductsSection />
      case "orders":
        return <OrdersSection />
      case "reports":
        return <ReportsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <DashboardContent />
    }
  }

  const [reportDateStart, setReportDateStart] = useState("")
  const [reportDateEnd, setReportDateEnd] = useState("")
  const [reportDepartment, setReportDepartment] = useState("")
  const [reportStatus, setReportStatus] = useState("")

  // Mock data for reports section
  const mockOrders = [
    { id: "ORD001", client: "Client A", date: "2024-01-15", statut: "Livrée", montant: 1250 },
    { id: "ORD002", client: "Client B", date: "2024-01-14", statut: "En cours", montant: 890 },
    { id: "ORD003", client: "Client C", date: "2024-01-13", statut: "En attente", montant: 2100 },
  ]

  const mockUsers = [
    { id: 1, nom: "Marie Dubois", departement: "RH", statut: "Actif", email: "marie@example.com" },
    { id: 2, nom: "Pierre Martin", departement: "Direction", statut: "Inactif", email: "pierre@example.com" },
    { id: 3, nom: "Sophie Laurent", departement: "Marketing", statut: "Actif", email: "sophie@example.com" },
    { id: 4, nom: "Jean Dupont", departement: "IT", statut: "Actif", email: "jean.dupont@admin.com" },
    { id: 5, nom: "Alice Gerard", departement: "Finance", statut: "Actif", email: "alice.gerard@manager.com" },
  ]

  const mockProducts = [
    {
      id: "P001",
      nom: "Ordinateur portable Dell",
      department: "Informatique (IT)",
      stockReel: 25,
      seuilMinimal: 10,
      fournisseur: "Dell Technologies",
      dateAjout: "2024-01-15",
      prix: 15000,
    },
    {
      id: "P002",
      nom: "Stylos BIC (Pack de 50)",
      department: "Administration",
      stockReel: 5,
      seuilMinimal: 20,
      fournisseur: "BIC France",
      dateAjout: "2024-01-20",
      prix: 150,
    },
    {
      id: "P003",
      nom: "Chaise de bureau ergonomique",
      department: "Ressources Humaines (RH)",
      stockReel: 15,
      seuilMinimal: 8,
      fournisseur: "Herman Miller",
      dateAjout: "2024-02-01",
      prix: 8500,
    },
    {
      id: "P004",
      nom: "Imprimante laser HP",
      department: "Administration",
      stockReel: 3,
      seuilMinimal: 5,
      fournisseur: "HP Inc.",
      dateAjout: "2024-02-10",
      prix: 4200,
    },
    {
      id: "P005",
      nom: "Papier A4 (Ramette)",
      department: "Administration",
      stockReel: 45,
      seuilMinimal: 30,
      fournisseur: "Clairefontaine",
      dateAjout: "2024-02-15",
      prix: 25,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-64">
        <Header />

        <main className="p-6">{renderContent()}</main>
      </div>

      {showUserModal && <AddUserModal />}
      {showProductModal && <AddProductModal />}
      {showUserDetailsModal && <UserDetailsModal />}
      {showDeleteConfirmModal && <DeleteConfirmModal />}
      {showDeleteProductModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
              <button onClick={() => setShowDeleteProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete.name}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteProductModal(false)}>
                Annuler
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteProduct}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profil Administrateur</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-6 mb-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/admin-profile.png" />
                  <AvatarFallback className="text-2xl">AD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Ahmed Benali</h3>
                  <p className="text-gray-600">Administrateur Système</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">En ligne</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Informations personnelles</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">Ahmed Benali</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">ahmed.benali@entreprise.ma</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">+212 6 12 34 56 78</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">Direction Générale</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Informations système</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Badge className="bg-red-100 text-red-800">Administrateur</Badge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">15 janvier 2023</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">Aujourd'hui à 14:30</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Gestion utilisateurs",
                    "Gestion produits",
                    "Gestion commandes",
                    "Rapports avancés",
                    "Configuration système",
                    "Gestion départements",
                  ].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-800">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-blue-800">Connexions ce mois</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-green-800">Actions aujourd'hui</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-purple-800">Rapports générés</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2.5h</div>
                    <div className="text-sm text-orange-800">Temps moyen/jour</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Fermer
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Modifier le profil</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
