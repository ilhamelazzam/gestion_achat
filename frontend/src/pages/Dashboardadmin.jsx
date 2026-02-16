"use client"

import React, { useState, useEffect } from "react"

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
  EyeOff,
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
import { Button } from "../components/ui/button"
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useI18n } from "../context/I18nContext"

import { useNavigate, Navigate } from "react-router-dom"

function Dashboard() {
  const { t, lang, setLanguage } = useI18n()
  const [orderReports, setOrderReports] = useState({ totalOrders: 0, totalAmount: 0, totalItems: 0, byStatus: {}, timeline: [] })
  const [charts, setCharts] = useState({ ordersPie: [], usersActivity: [], stockByDepartment: [] })
  const [globalSearch, setGlobalSearch] = useState("")

  const loadOrderReports = async (params = {}) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const q = new URLSearchParams()
      if (params.dateFrom) q.set('dateFrom', params.dateFrom)
      if (params.dateTo) q.set('dateTo', params.dateTo)
      const url = `${API_BASE_URL}/reports/commandes/${q.toString() ? `?${q.toString()}` : ''}`
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrderReports({
        totalOrders: Number(data.totalOrders ?? data.total_commandes ?? 0),
        totalAmount: Number(data.totalAmount ?? data.montant_total ?? 0),
        totalItems: Number(data.totalItems ?? data.articles_total ?? 0),
        byStatus: data.byStatus ?? data.repartition_par_statut ?? {},
        timeline: Array.isArray(data.timeline) ? data.timeline : [],
      })
    } catch (e) {
      console.error('Erreur chargement rapports commandes:', e)
    }
  };

  const loadChartsReports = async (params = {}) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const q = new URLSearchParams()
      if (params.dateFrom) q.set('dateFrom', params.dateFrom)
      if (params.dateTo) q.set('dateTo', params.dateTo)
      const url = `${API_BASE_URL}/reports/charts/${q.toString() ? `?${q.toString()}` : ''}`
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCharts({
        ordersPie: Array.isArray(data.ordersPie) ? data.ordersPie : [],
        usersActivity: Array.isArray(data.usersActivity) ? data.usersActivity : [],
        stockByDepartment: Array.isArray(data.stockByDepartment) ? data.stockByDepartment : [],
      })
    } catch (e) {
      console.error('Erreur chargement charts:', e)
    }
  };

  const handleGlobalSearch = (value) => {
    setGlobalSearch(value)
  }

  const handleGlobalSearchSubmit = () => {
    const q = globalSearch.toLowerCase().trim()
    if (!q) return
    if (q.includes("produit")) {
      setActiveSection("products")
      setProductFilters((prev) => ({ ...prev, name: q }))
    } else if (q.includes("commande")) {
      setActiveSection("orders")
    } else if (q.includes("utilisateur") || q.includes("user")) {
      setActiveSection("users")
      setUserSearchTerm(q)
      setCurrentPage(1)
    } else if (q.includes("rapport")) {
      setActiveSection("reports")
    } else if (activeSection === "products") {
      setProductFilters((prev) => ({ ...prev, name: q }))
    } else if (activeSection === "users") {
      setUserSearchTerm(q)
      setCurrentPage(1)
    } else if (activeSection === "orders") {
      setActiveSection("orders")
      setOrderSearchTerm(q)
    } else {
      setActiveSection("dashboard")
    }
  }

  const normalizeRequestStatusForUI = (value) => {
    const text = String(value || "")
    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

    if (normalized.includes("approuv")) return "Validée"
    if (normalized.includes("rejet")) return "Refusée"
    return text || "En attente"
  }

  const toRequestStatus = (value) => {
    const text = String(value || "")
    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

    if (normalized.includes("valid")) return "Approuvée"
    if (normalized.includes("refus")) return "Rejetée"
    return text || "En attente"
  }

  const mapOrderToRow = (o) => ({
    id: String(o.id ?? o.code ?? ""),
    apiId: String(o.id ?? o.code ?? ""),
    sourceType: "order",
    customer: o.customer ?? o.demandeur ?? o.client ?? "",
    email: o.email ?? "",
    date: o.date ?? o.createdAt ?? new Date().toISOString(),
    status: o.status ?? o.statut ?? "En attente",
    items: Number.isFinite(o.items) ? o.items : parseInt(o.nombre_articles ?? 0, 10),
    total: Number.isFinite(o.total) ? o.total : parseFloat(o.montant ?? 0),
    productId: o.productId ?? o.product_id ?? null,
    productName: o.productName ?? o.product_name ?? o.product?.name ?? "",
  })

  const mapRequestToRow = (r) => ({
    id: String(r.requestNumber ?? r.numero_demande ?? `REQ-${r.id ?? ""}`),
    apiId: String(r.id ?? ""),
    sourceType: "request",
    customer: r.userName ?? r.user_name ?? r.demandeur ?? "",
    email: r.userEmail ?? r.user_email ?? "",
    date: r.createdAt ?? r.created_at ?? r.date ?? new Date().toISOString(),
    status: normalizeRequestStatusForUI(r.status ?? r.statut ?? "En attente"),
    items: Number.isFinite(r.quantity) ? r.quantity : parseInt(r.quantite ?? 0, 10),
    total: Number.isFinite(r.estimatedCost) ? r.estimatedCost : parseFloat(r.cout_estime ?? r.estimated_cost ?? 0),
    productId: r.productId ?? r.product_id ?? null,
    productName: r.productName ?? r.product_name ?? r.produit ?? "",
  })

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) { navigate("/loginadmin"); return }
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      const res = await fetch(`${API_ENDPOINTS.REQUESTS.ADMIN_LIST || `${API_BASE_URL}/demandes/admin`}`, { method: "GET", headers })
      if (res.status === 401) { localStorage.removeItem("access_token"); navigate("/loginadmin"); return }
      if (!res.ok) throw new Error(`Demandes HTTP ${res.status}`)
      const data = await res.json().catch(() => [])
      const mapped = (Array.isArray(data) ? data : []).map(mapRequestToRow)
      setRequests(mapped.sort((a, b) => {
        const aDate = new Date(a.date).getTime()
        const bDate = new Date(b.date).getTime()
        return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0)
      }))
    } catch (e) {
      console.error('Erreur chargement demandes:', e)
    }
  }

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) { navigate("/loginadmin"); return }

      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      const ordersResponse = await fetch(`${API_ENDPOINTS.ORDERS.BASE}`, { method: "GET", headers })

      if (ordersResponse.status === 401) {
        localStorage.removeItem("access_token")
        navigate("/loginadmin")
        return
      }
      if (!ordersResponse.ok) throw new Error(`Orders HTTP ${ordersResponse.status}`)

      const ordersData = await ordersResponse.json().catch(() => [])
      const mappedOrders = (Array.isArray(ordersData) ? ordersData : []).map(mapOrderToRow)

      setOrders(mappedOrders.sort((a, b) => {
        const aDate = new Date(a.date).getTime()
        const bDate = new Date(b.date).getTime()
        return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0)
      }))
    } catch (e) {
      console.error('Erreur chargement commandes:', e)
    }
  }
  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }

      const candidates = [
        `${API_ENDPOINTS.PRODUCTS.BASE}`,
        `${API_BASE_URL}/products/`,
      ]

      let loaded = false
      for (const url of candidates) {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/loginadmin');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const mapped = (Array.isArray(data) ? data : []).map((p) => ({
            id: String(p.id ?? p.code ?? p.sku ?? ''),
            name: p.name ?? p.nom ?? '',
            department: p.department ?? p.departement ?? '',
            stock: Number.isFinite(p.stock) ? p.stock : parseInt(p.quantite ?? p.quantity ?? 0, 10),
            minThreshold: Number.isFinite(p.minThreshold) ? p.minThreshold : parseInt(p.seuil_alerte ?? 0, 10),
            supplier: p.supplier ?? p.fournisseur ?? '',
            dateAdded: p.dateAdded ?? p.date_ajout ?? p.createdAt ?? '',
            price: Number.isFinite(p.price) ? p.price : parseFloat(p.prix ?? 0),
            image: p.image || p.image_url || p.photo || "",
          }));
          setProducts(mapped);
          if (mapped.length > 0) {
            setNewOrder((prev) => ({ ...prev, productId: prev.productId || mapped[0].id }));
          }
          loaded = true
          break
        }

        if (response.status === 404) {
          console.warn(`Endpoint produits introuvable (404) sur ${url}. Essai d'une URL alternativeé?é`);
          continue
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      if (!loaded) {
        console.warn('Aucun endpoint produits valide trouvé. La section Produits sera vide.');
        setProducts([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      alert('Impossible de charger les produits. Veuillez vous reconnecter.');
    }
  };

  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/fournisseurs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/loginadmin');
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const mapped = (Array.isArray(data) ? data : []).map(s => ({
        id: s.id,
        nom: s.nom || s.name || '',
        email: s.email || '',
        telephone: s.telephone || s.phone || '',
        adresse: s.adresse || s.address || ''
      }));
      setSuppliers(mapped);
    } catch (e) {
      console.error('Erreur chargement fournisseurs:', e);
    }
  };

  const handleCreateSupplier = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }
      const payload = {
        nom: newSupplierNom,
        email: newSupplierEmail,
        telephone: newSupplierTelephone,
        adresse: newSupplierAdresse
      };
      const response = await fetch(`${API_BASE_URL}/fournisseurs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/loginadmin');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Erreur lors de l\'ajout du fournisseur');
      }
      await loadSuppliers();
      setNewSupplierNom('');
      setNewSupplierEmail('');
      setNewSupplierTelephone('');
      setNewSupplierAdresse('');
      setShowSupplierModal(false);
      alert('Fournisseur ajouté avec succès !');
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const handleUpdateSupplier = async () => {
    try {
      if (!selectedSupplier) return;
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }
      const payload = {
        nom: newSupplierNom,
        email: newSupplierEmail,
        telephone: newSupplierTelephone,
        adresse: newSupplierAdresse
      };
      const response = await fetch(`${API_BASE_URL}/fournisseurs/${selectedSupplier.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/loginadmin');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Erreur lors de la modification du fournisseur');
      }
      await loadSuppliers();
      setNewSupplierNom('');
      setNewSupplierEmail('');
      setNewSupplierTelephone('');
      setNewSupplierAdresse('');
      setSelectedSupplier(null);
      setShowSupplierModal(false);
      alert('Fournisseur modifié avec succès !');
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      if (!supplierToDelete) return;
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/fournisseurs/${supplierToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/loginadmin');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Erreur lors de la suppression du fournisseur');
      }
      await loadSuppliers();
      setShowDeleteSupplierModal(false);
      setSupplierToDelete(null);
      alert('Fournisseur supprimé avec succès !');
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadProducts();
      loadOrders();
      loadRequests();
      loadOrderReports();
      loadChartsReports();
      loadSuppliers();
    }
  }, [localStorage.getItem('access_token')]);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCommands: 0,
    totalSalesAmount: 0,  // Nouvel état pour le total des ventes
    percentageChange: 0,
    loading: true,
    error: null
  });
  
  
  // Navigation items for the sidebar
  const navigationItems = [
    { id: "dashboard", label: "nav.dashboard", icon: LayoutDashboard },
    { id: "users", label: "nav.users", icon: Users },
    { id: "products", label: "nav.products", icon: Package },
    { id: "requests", label: "Demandes", icon: FileText },
    { id: "orders", label: "nav.orders", icon: ShoppingCart },
    { id: "reports", label: "nav.reports", icon: BarChart3 },
    { id: "settings", label: "nav.settings", icon: Settings },
  ];

  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  // Departments list
  const [departments, setDepartments] = useState([
    "Informatique (IT)",
    "Ressources Humaines (RH)",
    "Comptabilité",
    "Marketing",
    "Ventes",
    "Administration",
    "Direction",
    "Maintenance",
    "Logistique",
    "Achats"
  ]);

  // Fournisseurs list
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplierNom, setNewSupplierNom] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierTelephone, setNewSupplierTelephone] = useState("");
  const [newSupplierAdresse, setNewSupplierAdresse] = useState("");
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);

  // Stats cards data
  const statsCards = [
    {
      title: "Utilisateurs totaux",
      value: allUsers?.length || 0,
      change: "+0.0%",
      icon: Users,
      color: "text-blue-500 bg-blue-50"
    },
    {
      title: "Produits en stock",
      value: products?.length || 0,
      change: "+0.0%",
      icon: Package,
      color: "text-green-500 bg-green-50"
    },
    {
      title: "Commandes",
      value: orders?.length || 0,
      change: "+0.0%",
      icon: ShoppingCart,
      color: "text-purple-500 bg-purple-50"
    },
    
    {
      title: "Revenu total",
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(
        (orders || [])
                    .filter((order) => {
            const s = String(order.status || '').toLowerCase()
            return s.includes('pay') || s.includes('livr') || s.includes('paid') || s.includes('paye')
          })
          .reduce((sum, order) => sum + (Number(order?.total) || 0), 0)
      ),
      change: "+0.0%",
      icon: DollarSign,
      color: "text-amber-500 bg-amber-50"
    }

  ];

  const formatMAD = (value) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get user data from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
          
          // Set the user's name from localStorage or user data
          const storedName = localStorage.getItem('userName') || 
                           user.nom || 
                           user.username || 
                           user.email || 'Administrateur';
          setUserName(storedName);
          
          setIsAuthenticated(true);
        } else {
          // If no user data in localStorage, try to fetch it from the API
          const token = localStorage.getItem('access_token');
          if (token) {
            await fetchUserData();
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [localStorage.getItem('access_token')]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.AUTH.ADMIN.ME}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }

      const data = await response.json();
      setUserData(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("No access token found");
        navigate('/loginadmin');
        return;
      }

      // Utiliser d'abord l'endpoint BD réel (tous les comptes), puis fallback sur la démo si 404
      const endpoints = [
        `${API_BASE_URL}/accounts/administrateurs/`,
        `${API_BASE_URL}/accounts/users/`, // fallback démo
      ]

      let raw = null
      for (const url of endpoints) {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        if (response.ok) {
          raw = await response.json().catch(() => [])
          break
        }
        if (response.status === 404) continue
        const errorText = await response.text().catch(() => '')
        throw new Error(`Erreur ${response.status}: ${errorText || 'Impossible de charger les utilisateurs'}`)
      }

      if (!raw) raw = []

      console.log("Données brutes des utilisateurs:", raw);

      // Garder uniquement les utilisateurs non admins selon le schéma (isAdmin boolean)
      const onlyUsers = (Array.isArray(raw) ? raw : []).filter(u => {
        const isAdmin = u.isAdmin === true || u.is_admin === true || u.role === 'admin'
        return !isAdmin
      })

      const mapped = onlyUsers
        .map(u => ({
          // Préserver l'identifiant backend; indispensable pour PUT/DELETE
          id: u.id ?? u.userId ?? u.user_id ?? u.id_user ?? u.userID ?? u.pk ?? u._id ?? u.uid ?? u.uuid ?? null,
          name: u.fullName || u.nom || u.username || u.email || 'Sans nom',
          email: u.email || '',
          phone: u.phone || u.telephone || "Non spécifié",
          date: u.createdAt || u.created_at || u.date_creation || u.date_joined || new Date().toISOString(),
          status: (u.actif ?? u.isActive ?? true) ? "Actif" : "Inactif",
          role: "Utilisateur",
          department: u.department || u.departement || "Non spécifié",
        }))
        // é?carter les enregistrements sans ID pour éviter les éditions impossibles
        .filter(u => u.id !== null && u.id !== undefined && `${u.id}`.trim() !== '')

      console.log("Utilisateurs (non-admins):", mapped)
      setAllUsers(mapped)
      if (mapped.length > 0) {
        setNewOrder((prev) => ({ ...prev, userId: prev.userId || mapped[0].id, demandeur: prev.demandeur || mapped[0].name, email: prev.email || mapped[0].email }))
      }
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError(err.message || "Une erreur est survenue lors du chargement des utilisateurs");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUsers();
    }
  }, [localStorage.getItem('access_token')]);

  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState("Tous les types")
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserPhone, setEditUserPhone] = useState("")
  const [editUserDepartment, setEditUserDepartment] = useState("")
  const [editUserStatus, setEditUserStatus] = useState("Actif")
  const [editUserDate, setEditUserDate] = useState("")
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const usersPerPage = 10

  // Add User form state
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPhone, setNewUserPhone] = useState("")
  const [newUserDepartment, setNewUserDepartment] = useState("")
  const [newUserDate, setNewUserDate] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [showUserPassword, setShowUserPassword] = useState(false)

  // Add Product form state
  const [newProductName, setNewProductName] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductStock, setNewProductStock] = useState("")
  const [newProductDepartment, setNewProductDepartment] = useState("")
  const [newProductSupplier, setNewProductSupplier] = useState("")
  const [newProductMinThreshold, setNewProductMinThreshold] = useState("")
  const [newProductDateAdded, setNewProductDateAdded] = useState("")
  const [newProductImage, setNewProductImage] = useState("")

  const resetNewUserForm = () => {
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPhone("")
    setNewUserDepartment("")
    setNewUserDate("")
    setNewUserPassword("")
  }

  const resetNewProductForm = () => {
    setNewProductName("")
    setNewProductPrice("")
    setNewProductStock("")
    setNewProductDepartment("")
    setNewProductSupplier("")
    setNewProductMinThreshold("")
    setNewProductDateAdded("")
  }

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }

      const payload = {
        fullName: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        department: newUserDepartment,
        password: newUserPassword,
        isAdmin: false,
      }
      const response = await fetch(`${API_ENDPOINTS.AUTH.USER.REGISTER}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Endpoint /utilisateurs/register/ introuvable (404). Vérifiez API_ENDPOINTS.AUTH.USER.REGISTER dans config.js ou l'API backend.")
        }
        const errorData = await response.json().catch(() => ({}))
        console.error("Backend error:", errorData)
        throw new Error(errorData?.detail || errorData?.email?.[0] || errorData?.telephone?.[0] || "Erreur lors de l'ajout de l'utilisateur")
      }
      const created = await response.json()
      // Sync UI list
      const uiUser = {
        id: created.id,
        name: created.nom || newUserName,
        email: created.email || newUserEmail,
        phone: created.telephone || newUserPhone,
        date: created.date_creation || new Date().toISOString().slice(0, 10),
        status: created.actif ? "Actif" : "Inactif",
        role: "Utilisateur",
        department: created.departement || newUserDepartment || "",
      }
      setAllUsers((prev) => [uiUser, ...prev])
      resetNewUserForm()
      setShowUserModal(false)
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const nameValue = (newProductName || "").trim();
      if (!nameValue) {
        alert("Veuillez saisir le nom du produit");
        return;
      }
      // Création de produit: le backend Node ne requiert pas CSRF, seulement le Bearer token
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/loginadmin');
        return;
      }

      // Utiliser uniquement l'endpoint réel du backend
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS.BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nom: nameValue,
          prix: parseFloat(newProductPrice || 0),
          quantite: parseInt(newProductStock || 0, 10),
          seuil_alerte: parseInt(newProductMinThreshold || 0, 10),
          departement: newProductDepartment || null,
          fournisseur: newProductSupplier || null,
          date_ajout: newProductDateAdded || null,
          image: newProductImage || null,
        })
      })
  
      if (!response.ok) {
        // Gestion dédiée du 401 -> token expiré/invalid
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          alert('Session expirée. Veuillez vous reconnecter.');
          navigate('/loginadmin');
          return;
        }
        let errorMsg = ''
        try {
          const errorData = await response.json()
          errorMsg = errorData?.detail || errorData?.message || ''
        } catch (_) {}
        throw new Error(errorMsg || "Erreur lors de l'ajout du produit");
      }
  
      const data = await response.json();
      // Mettre à jour l'UI avec le produit créé (mapping DTO -> UI)
          const ui = {
            id: String(data.id),
            name: data.nom || data.name,
            department: data.departement || data.department || '',
            stock: data.quantite ?? data.quantity ?? 0,
            minThreshold: data.seuil_alerte ?? data.minThreshold ?? 0,
            supplier: data.fournisseur || data.supplier || '',
            dateAdded: data.date_ajout || data.dateAdded || new Date().toISOString(),
            price: typeof data.prix === 'number' ? data.prix : (data.price ?? 0),
            image: data.image || data.image_url || data.photo || "",
          }
      setProducts(prev => [ui, ...prev])
      // Et recharger depuis l'API pour rester synchrone base -> UI
      await loadProducts();
      setShowProductModal(false);
      
      // Réinitialiser les champs
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductMinThreshold('5');
      setNewProductDepartment(departments[0]);
      setNewProductSupplier(suppliers.length > 0 ? suppliers[0].nom : '');
      setNewProductImage('');
      
      alert('Produit ajouté avec succès !');
      
    } catch (err) {
      console.error('Erreur:', err);
        alert(err.message || "Une erreur est survenue lors de l'ajout du produit");
    }
  };

  const handleProductImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setNewProductImage("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewProductImage(reader.result || "");
    };
    reader.readAsDataURL(file);
  };
  // Do not overwrite Users list with administrators; keep dedicated loader above
  React.useEffect(() => {
    // Intentionally left empty to avoid overwriting users list
  }, []);

  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isEditingProduct, setIsEditingProduct] = useState(false)
  const [editProductName, setEditProductName] = useState("")
  const [editProductPrice, setEditProductPrice] = useState("")
  const [editProductStock, setEditProductStock] = useState("")
  const [editProductMinThreshold, setEditProductMinThreshold] = useState("")
  const [editProductDepartment, setEditProductDepartment] = useState("")
  const [editProductSupplier, setEditProductSupplier] = useState("")
  const [editProductDateAdded, setEditProductDateAdded] = useState("")
  const [editProductImage, setEditProductImage] = useState("")

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
  const [requestSearchTerm, setRequestSearchTerm] = useState("")
  const [requestStatusFilter, setRequestStatusFilter] = useState("")
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isEditingOrder, setIsEditingOrder] = useState(false)
  const [editOrderCustomer, setEditOrderCustomer] = useState("")
  const [editOrderEmail, setEditOrderEmail] = useState("")
  const [editOrderDate, setEditOrderDate] = useState("")
  const [editOrderItems, setEditOrderItems] = useState("")
  const [editOrderTotal, setEditOrderTotal] = useState("")
  const [editOrderStatus, setEditOrderStatus] = useState("")
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)

  const [showValidateOrderModal, setShowValidateOrderModal] = useState(false)
  const [showRefuseOrderModal, setShowRefuseOrderModal] = useState(false)
  const [orderToValidate, setOrderToValidate] = useState(null)
  const [orderToRefuse, setOrderToRefuse] = useState(null)
  const [readNotificationIds, setReadNotificationIds] = useState(new Set())

  const [reportType, setReportType] = useState("orders")

  const getOrderEntryIdentity = (entry) => ({
    sourceType: String(entry?.sourceType || "order"),
    apiId: String(entry?.apiId ?? entry?.id ?? ""),
  })

  const isSameOrderEntry = (entry, sourceType, apiId) =>
    String(entry?.sourceType || "order") === String(sourceType) &&
    String(entry?.apiId ?? entry?.id ?? "") === String(apiId)

  // Orders actions
  const handleDeleteOrder = (order) => {
    setOrderToDelete(order)
    setShowDeleteOrderModal(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const { sourceType, apiId } = getOrderEntryIdentity(orderToDelete)
      const endpoint =
        sourceType === "request"
          ? API_ENDPOINTS.REQUESTS.DELETE(apiId)
          : `${API_ENDPOINTS.ORDERS.BASE}${apiId}/`
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(await res.text().catch(() => 'Suppression échouée'))
      setOrders(prev => prev.filter((o) => !isSameOrderEntry(o, sourceType, apiId)))
      setShowDeleteOrderModal(false)
      setOrderToDelete(null)
      await loadOrders()
    } catch (e) {
      console.error('Erreur suppression commande:', e)
      alert(e.message || 'Erreur suppression commande')
    }
  }

  const handleValidateOrder = async (order) => {
    if (!order) return
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const { sourceType, apiId } = getOrderEntryIdentity(order)
      const body = sourceType === "request" ? { statut: "Approuvée" } : { statut: "Validée" }
      const endpoint =
        sourceType === "request"
          ? API_ENDPOINTS.REQUESTS.UPDATE(apiId)
          : `${API_ENDPOINTS.ORDERS.BASE}${apiId}/`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(await res.text().catch(() => 'Mise à jour échouée'))
      await loadOrders()
      setShowValidateOrderModal(false)
      setOrderToValidate(null)
    } catch (e) {
      console.error('Erreur validation commande:', e)
      alert(e.message || 'Erreur validation commande')
    }
  }

  const handleRefuseOrder = async (order) => {
    if (!order) return
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const { sourceType, apiId } = getOrderEntryIdentity(order)
      const body = sourceType === "request" ? { statut: "Rejetée" } : { statut: "Refusée" }
      const endpoint =
        sourceType === "request"
          ? API_ENDPOINTS.REQUESTS.UPDATE(apiId)
          : `${API_ENDPOINTS.ORDERS.BASE}${apiId}/`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(await res.text().catch(() => 'Mise à jour échouée'))
      await loadOrders()
      setShowRefuseOrderModal(false)
      setOrderToRefuse(null)
    } catch (e) {
      console.error('Erreur refus commande:', e)
      alert(e.message || 'Erreur refus commande')
    }
  }

  const handleValidateRequest = async (request) => {
    if (!request) return
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const endpoint = API_ENDPOINTS.REQUESTS.UPDATE ? API_ENDPOINTS.REQUESTS.UPDATE(request.apiId) : `${API_BASE_URL}/demandes/${request.apiId}/`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut: "Approuvée" }),
      })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(await res.text().catch(() => 'Validation échouée'))
      await Promise.all([loadRequests(), loadOrders()])
    } catch (e) {
      console.error('Erreur validation demande:', e)
      alert(e.message || 'Erreur validation demande')
    }
  }

  const handleRefuseRequest = async (request) => {
    if (!request) return
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { navigate('/loginadmin'); return }
      const endpoint = API_ENDPOINTS.REQUESTS.UPDATE ? API_ENDPOINTS.REQUESTS.UPDATE(request.apiId) : `${API_BASE_URL}/demandes/${request.apiId}/`
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut: "Rejetée" }),
      })
      if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
      if (!res.ok) throw new Error(await res.text().catch(() => 'Refus échoué'))
      await loadRequests()
    } catch (e) {
      console.error('Erreur refus demande:', e)
      alert(e.message || 'Erreur refus demande')
    }
  }

  const filteredOrders = orders.filter((order) => {
    const oCustomer = String(order?.customer || '').toLowerCase()
    const oId = String(order?.id || '').toLowerCase()
    const oEmail = String(order?.email || '').toLowerCase()
    const oProduct = String(order?.productName || '').toLowerCase()
    const term = String(orderSearchTerm || '').toLowerCase()
    const matchesSearch =
      oCustomer.includes(term) ||
      oId.includes(term) ||
      oEmail.includes(term) ||
      oProduct.includes(term)

    const matchesStatus = !orderFilters.status || order.status === orderFilters.status
    const matchesCustomer =
      !orderFilters.customer || String(order.customer || "").toLowerCase().includes(orderFilters.customer.toLowerCase())

    const orderDate = new Date(order.date)
    const matchesDateFrom = !orderFilters.dateFrom || orderDate >= new Date(orderFilters.dateFrom)
    const matchesDateTo = !orderFilters.dateTo || orderDate <= new Date(orderFilters.dateTo)

    const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total || 0)
    const matchesMinAmount = !orderFilters.minAmount || orderTotal >= Number.parseFloat(orderFilters.minAmount)
    const matchesMaxAmount = !orderFilters.maxAmount || orderTotal <= Number.parseFloat(orderFilters.maxAmount)

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

  const filteredRequests = requests.filter((req) => {
    const term = String(requestSearchTerm || '').toLowerCase()
    const rId = String(req?.id || '').toLowerCase()
    const rCustomer = String(req?.customer || '').toLowerCase()
    const rProduct = String(req?.productName || '').toLowerCase()
    const rEmail = String(req?.email || '').toLowerCase()
    const matchesSearch = !term || rId.includes(term) || rCustomer.includes(term) || rProduct.includes(term) || rEmail.includes(term)
    const matchesStatus = !requestStatusFilter || normalizeRequestStatusForUI(req.status) === requestStatusFilter
    return matchesSearch && matchesStatus
  })

  const handleRequestStatusChange = (value) => {
    setRequestStatusFilter(value === 'all' ? '' : value)
  }

  const activeOrderFiltersCount = Object.values(orderFilters).filter((value) => value !== "").length

  const filteredProducts = products.filter((product) => {
    const search = String(productFilters.name || '').toLowerCase().trim()
    const pname = String(product?.name ?? '').toLowerCase()
    const pid = String(product?.id ?? '').toLowerCase()
    const matchesName = pname.includes(search) || pid.includes(search)
    const matchesDepartment = !productFilters.department || product.department === productFilters.department
    const matchesSupplier = !productFilters.supplier || product.supplier === productFilters.supplier

    let matchesStock = true
    const threshold = product.minThreshold || stockSettings.seuilGlobal
    if (productFilters.stockStatus === "En stock") {
      matchesStock = product.stock > threshold
    } else if (productFilters.stockStatus === "Stock faible") {
      matchesStock = product.stock > 0 && product.stock <= threshold
    } else if (productFilters.stockStatus === "Rupture") {
      matchesStock = product.stock === 0
    }

    const matchesThreshold = !productFilters.belowThreshold || product.stock <= threshold

    let matchesDate = true
    if (productFilters.dateFrom) {
      matchesDate = matchesDate && new Date(product.dateAdded) >= new Date(productFilters.dateFrom)
    }
    if (productFilters.dateTo) {
      matchesDate = matchesDate && new Date(product.dateAdded) <= new Date(productFilters.dateTo)
    }

    return matchesName && matchesDepartment && matchesSupplier && matchesStock && matchesThreshold && matchesDate
  })

  const activeProductFiltersCount = Object.values(productFilters).filter(
    (value) => value !== "" && value !== false,
  ).length

  const clearProductFilters = () => {
    setProductFilters({
      name: "",
      department: "",
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

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/loginadmin'); return }

    const idStr = String(productToDelete.id)
    const candidates = [
      `${API_ENDPOINTS.PRODUCTS.BASE}${idStr}/`,
      `${API_BASE_URL}/products/${idStr}/`,
    ]
    let ok = false
    let lastErr = ''
    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        if (res.status === 401) { localStorage.removeItem('access_token'); navigate('/loginadmin'); return }
        if (res.ok) { ok = true; break }
        if (res.status === 404) { continue }
        lastErr = await res.text().catch(() => `${res.status}`)
      } catch (e) {
        lastErr = e?.message || 'Network error'
      }
    }
    if (!ok) {
      alert(lastErr || "é?chec de la suppression du produit")
      return
    }

    // Optimistic UI update
    setProducts(prev => prev.filter((p) => String(p.id) !== idStr))
    setShowDeleteProductModal(false)
    setProductToDelete(null)
    // Ensure DB -> UI sync
    try { await loadProducts() } catch (_) {}
  }

  const getStockStatus = (product) => {
    if (product.stock === 0) return { text: "Rupture", color: "bg-red-100 text-red-800" }
    if (product.stock <= product.minThreshold) return { text: "Stock faible", color: "bg-yellow-100 text-yellow-800" }
    return { text: "En stock", color: "bg-green-100 text-green-800" }
  }

  const filteredUsers = allUsers.filter((user) => {
    // Safely handle search term
    const searchTerm = (userSearchTerm || '').toLowerCase();
    
    // Safely access user properties with fallback to empty string
    const name = (user?.name || '').toLowerCase();
    const email = (user?.email || '').toLowerCase();
    
    // Check if user matches search term
    const matchesSearch = searchTerm === '' || 
      name.includes(searchTerm) || 
      email.includes(searchTerm);

    // Check department filter
    const matchesDepartment = !departmentFilter || user?.department === departmentFilter;
    
    // Check status filter
    const matchesStatus = !statusFilter || user?.status === statusFilter;
    
    // Check role filter
    const matchesRole = !roleFilter || user?.role === roleFilter;

    // Check date range
    const userDate = user?.date || '';
    const matchesDateFrom = !dateFromFilter || userDate >= dateFromFilter;
    const matchesDateTo = !dateToFilter || userDate <= dateToFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesRole && matchesDateFrom && matchesDateTo;
  });

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
  const [departmentName, setDepartmentName] = useState("")

  const [mockRoles, setMockRoles] = useState([
    {
      id: "admin",
      nom: "Administrateur",
      description: "Accès complet au système",
      permissions: [
        "Utilisateurs : CRUD + rôles",
        "Produits : CRUD",
        "Commandes : CRUD / validation",
        "Fournisseurs : CRUD",
        "Rapports : Lecture",
        "Paramètres : CRUD",
      ],
    },
    {
      id: "manager",
      nom: "Gestionnaire",
      description: "Pilotage opérationnel (stocks & commandes)",
      permissions: [
        "Utilisateurs : lecture",
        "Produits : CRUD",
        "Commandes : CRUD / validation",
        "Fournisseurs : CRUD",
        "Rapports : Lecture",
        "Paramètres : Lecture",
      ],
    },
    {
      id: "appro",
      nom: "Approvisionneur",
      description: "Achats, stocks et fournisseurs",
      permissions: [
        "Produits : créer / mettre à jour",
        "Fournisseurs : CRUD",
        "Commandes : lecture / validation",
        "Rapports : Lecture",
      ],
    },
    {
      id: "compta",
      nom: "Comptable",
      description: "Suivi facturation et paiements",
      permissions: [
        "Commandes : lecture",
        "Produits : lecture",
        "Rapports : Lecture finances",
        "Paramètres : Lecture",
      ],
    },
    {
      id: "employe",
      nom: "Employé",
      description: "Accès en lecture seule",
      permissions: ["Utilisateurs : lecture", "Produits : lecture", "Commandes : lecture", "Rapports : lecture"],
    },
  ])

  const [companySettings, setCompanySettings] = useState({
    nom: "Mon Entreprise SARL",
    adresse: "123 Rue de la Paix, Casablanca",
    email: "contact@monentreprise.ma",
    telephone: "+212 5 22 XX XX XX",
    devise: "MAD",
    langue: "fr",
    fuseauHoraire: "Africa/Casablanca",
  })
  const [companyForm, setCompanyForm] = useState(companySettings)

  // Garder l'état local synchronisé avec la langue globale sélectionnée
  useEffect(() => {
    setCompanySettings((prev) => ({ ...prev, langue: lang }))
  }, [lang])

  // Pré-remplir le champ département lors de l'ouverture du modal
  useEffect(() => {
    if (showDepartmentModal) {
      setDepartmentName(selectedDepartment || "")
    }
  }, [showDepartmentModal, selectedDepartment])

  // Pré-remplir le formulaire lors de l'ouverture du modal
  useEffect(() => {
    if (showCompanyModal) setCompanyForm(companySettings)
  }, [showCompanyModal, companySettings])

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
              <span className="font-medium">{t(item.label)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )

  // Notifications statiques de démonstration
  const staticNotifications = [
    {
      id: 1,
      type: "Stock",
      message: 'Le stock du produit "Câble RJ45" est en dessous du seuil minimum.',
      timestamp: "01/09/2025 10:15",
      isRead: false,
      icon: "🚨",
    },
    {
      id: 2,
      type: "Commande",
      message: "Une nouvelle commande (#CMD123) a été soumise.",
      timestamp: "01/09/2025 09:48",
      isRead: false,
      icon: "📦",
    },
    {
      id: 3,
      type: "Utilisateur",
      message: 'L\'utilisateur "amine@erp.com" a été ajouté au département Achats.',
      timestamp: "01/09/2025 08:20",
      isRead: true,
      icon: "🧑‍💼",
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
      message: "⚠️ Une erreur est survenue lors de la validation de la commande #CMD789.",
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
      icon: "🧑‍💼",
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
      icon: "🧑‍💼",
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

  // Générer des alertes dynamiques en fonction du seuil global/minThreshold
  const lowStockAlerts = stockSettings.alertesActives
    ? (products || [])
        .filter((p) => Number(p.stock) <= Number(p.minThreshold || stockSettings.seuilGlobal || 0))
        .map((p) => ({
          id: `low-${p.id}`,
          type: "Stock",
          message: `Stock critique pour "${p.name || p.id || "Produit"}": ${p.stock} (seuil ${p.minThreshold || stockSettings.seuilGlobal})`,
          timestamp: new Date().toLocaleString("fr-FR"),
          isRead: false,
          icon: "🚨",
        }))
    : []

  const orderNotifications = (orders || []).slice(0, 20).map((o) => {
    const status = o.status || o.statut || "Commande"
    const icon =
      status.toLowerCase().includes("livr") ? "✅" :
      status.toLowerCase().includes("valid") ? "📦" :
      status.toLowerCase().includes("cours") ? "🚚" :
      status.toLowerCase().includes("annul") ? "❌" : "📦"
    return {
      id: `order-${o.id || o.code || Math.random()}`,
      type: "Commande",
      message: `Commande #${o.id || o.code || "?"} - ${status}`,
      timestamp: new Date(o.date || o.createdAt || Date.now()).toLocaleString("fr-FR"),
      isRead: false,
      icon,
    }
  })

  const userNotifications = (allUsers || []).slice(0, 20).map((u) => ({
    id: `user-${u.id || u.email || u.nom || Math.random()}`,
    type: "Utilisateur",
    message: u.createdAt || u.date_inscription
      ? `Nouvel utilisateur: ${u.nom || u.name || u.email || "?"}`
      : `Mise à jour utilisateur: ${u.nom || u.name || u.email || "?"}`,
    timestamp: new Date(u.createdAt || u.date_inscription || u.updatedAt || Date.now()).toLocaleString("fr-FR"),
    isRead: false,
    icon: "🧑‍💼",
  }))

  const systemNotifications = [
    {
      id: "sys-err-1",
      type: "Système",
      message: "Une erreur est survenue lors de la validation de la commande #CMD789.",
      timestamp: "31/08/2025 15:30",
      isRead: false,
      icon: "⚠️",
    },
    {
      id: "sys-backup-1",
      type: "Système",
      message: "Sauvegarde automatique effectuée avec succès.",
      timestamp: "30/08/2025 12:00",
      isRead: true,
      icon: "💾",
    },
  ]

  const notifications = [
    ...orderNotifications,
    ...userNotifications,
    ...lowStockAlerts,
    ...systemNotifications,
    ...staticNotifications,
  ]

const unreadNotifications = notifications.filter((n) => !n.isRead && !readNotificationIds.has(n.id))
  const notificationTypes = ["Tous les types", "Stock", "Commande", "Utilisateur", "Système"]

const filteredNotifications = notifications.filter((notification) => {
    if (notificationFilter === "Tous les types") return true
    return notification.type === notificationFilter
  })

const markAllAsRead = () => {
    setReadNotificationIds(new Set(notifications.map((n) => n.id)))
  }

const markAsRead = (notificationId) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev)
      next.add(notificationId)
      return next
    })
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
              value={globalSearch}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleGlobalSearchSubmit()
                }
              }}
              className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={handleGlobalSearchSubmit}
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
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
                      {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""} au total
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
                onClick={() => setShowProfileModal(true)}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {userName || 'Utilisateur'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>Profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection("settings")}>Paramétres</DropdownMenuItem>
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

  const SalesChart = () => {
    // Construit la série à partir des rapports backend (timeline) ou fallback vide
    const emptyMonths = [
      { key: 1,  label: 'Jan', ventes: 0, commandes: 0 },
      { key: 2,  label: 'Fév', ventes: 0, commandes: 0 },
      { key: 3,  label: 'Mar', ventes: 0, commandes: 0 },
      { key: 4,  label: 'Avr', ventes: 0, commandes: 0 },
      { key: 5,  label: 'Mai', ventes: 0, commandes: 0 },
      { key: 6,  label: 'Jun', ventes: 0, commandes: 0 },
      { key: 7,  label: 'Jul', ventes: 0, commandes: 0 },
      { key: 8,  label: 'Aoû', ventes: 0, commandes: 0 },
      { key: 9,  label: 'Sep', ventes: 0, commandes: 0 },
      { key: 10, label: 'Oct', ventes: 0, commandes: 0 },
      { key: 11, label: 'Nov', ventes: 0, commandes: 0 },
      { key: 12, label: 'Déc', ventes: 0, commandes: 0 },
    ]

    const salesData = (() => {
      const timeline = Array.isArray(orderReports.timeline) ? orderReports.timeline : []
      const byMonth = [...emptyMonths]

      timeline.forEach((item) => {
        const monthNumber =
          Number(item.month ?? item.mois ?? item.monthIndex ?? item.month_number ?? item.monthNumber) ||
          (item.date ? new Date(item.date).getMonth() + 1 : NaN)
        if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) return

        const idx = monthNumber - 1
        const amount = Number(item.amount ?? item.total ?? item.totalAmount ?? item.montant ?? 0)
        const ordersCount = Number(item.orders ?? item.commandes ?? item.count ?? 0)

        byMonth[idx] = {
          ...byMonth[idx],
          ventes: Math.max(0, amount),
          commandes: Math.max(0, ordersCount),
        }
      })

      return byMonth
    })()

    const maxVentes = Math.max(1, ...salesData.map(d => d.ventes))
    const totalVentes = salesData.reduce((sum, d) => sum + d.ventes, 0)
    const totalCommandes = salesData.reduce((sum, d) => sum + d.commandes, 0)
    const monthlyAvg = salesData.length ? Math.round(totalVentes / salesData.length) : 0
    const last = salesData[salesData.length - 1] || { ventes: 0 }
    const prev = salesData[salesData.length - 2] || { ventes: 0 }
    const growth =
      prev.ventes > 0 ? Math.round(((last.ventes - prev.ventes) / prev.ventes) * 100) : 0

    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Évolution des ventes mensuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Graphique en barres simple */}
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesData.map((data, index) => {
                const height = (data.ventes / maxVentes) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center mb-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                    <span className="text-xs text-gray-500">{data.commandes}</span>
                  </div>
                )
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-600">Ventes (MAD)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                  <span className="text-gray-600">Commandes</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {totalVentes.toLocaleString('fr-FR')} MAD
                </p>
                <p className="text-xs text-gray-500">Total annuel</p>
              </div>
            </div>

            {/* Statistiques supplémentaires */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className={`text-2xl font-bold ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {growth >= 0 ? `+${growth}%` : `${growth}%`}
                </p>
                <p className="text-xs text-gray-500">Croissance mensuelle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {monthlyAvg.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">Moyenne mensuelle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {totalCommandes}
                </p>
                <p className="text-xs text-gray-500">Total commandes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const RecentUsersTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Utilisateurs récents</CardTitle>
        <Button
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
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
              <TableHead>Téléphone</TableHead>
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
                <TableCell className="text-gray-600">{user.phone}</TableCell>
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
    setEditUserName(user.name || "")
    setEditUserEmail(user.email || "")
    setEditUserPhone(user.phone || "")
    setEditUserDepartment(user.department || "")
    setEditUserStatus(user.status || "Actif")
    setEditUserDate(user.date || "")
    setShowUserDetailsModal(true)
    setIsEditingUser(true)
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
      </CardContent>
    </Card>
  )

  const RecentOrdersTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commandes récentes</CardTitle>
        <Button
          className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
          onClick={() => setShowAddOrderModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une commande
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Commande</TableHead>
              <TableHead>Demandeur</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders || []).slice(0, 5).map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="text-gray-600">{order.customer}</TableCell>
                <TableCell className="text-gray-600">{order.productName || order.product?.name || "-"}</TableCell>
                <TableCell className="text-gray-600">
                  {order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "Livrée" ? "default" : order.status === "En cours" ? "secondary" : "outline"
                    }
                    className={
                      order.status === "Livrée"
                        ? "bg-green-100 text-green-800"
                        : order.status === "En cours"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {typeof order.total === "number" ? order.total.toFixed(2) : order.total || "0"} MAD
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderDetailsModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
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
            <Input placeholder="Entrez le nom complet" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" placeholder="Entrez l'email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <Input placeholder="Entrez le numéro de téléphone" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Input
                type={showUserPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowUserPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
            <Input type="date" placeholder="YYYY-MM-DD" value={newUserDate} onChange={(e) => setNewUserDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <Select value={newUserDepartment} onValueChange={(v) => setNewUserDepartment(v)}>
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateUser} disabled={!newUserName || !newUserEmail || !newUserPassword}>
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  )

  const AddOrderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nouvelle Commande</h3>
          <button onClick={() => setShowAddOrderModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
            <select
              name="userId"
              value={newOrder.userId}
              onChange={(e) => {
                const userId = e.target.value
                const user = (allUsers || []).find((u) => String(u.id) === String(userId))
                setNewOrder((prev) => ({
                  ...prev,
                  userId,
                  demandeur: user?.fullName || user?.nom || user?.name || user?.username || "",
                  email: user?.email || "",
                }))
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(allUsers || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.nom || u.name || u.username || u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
            <select
              name="productId"
              value={newOrder.productId}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, productId: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(products || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={newOrder.email}
              onChange={handleOrderInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de la commande</label>
            <input
              type="date"
              name="date"
              value={newOrder.date}
              onChange={handleOrderInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'articles</label>
            <input
              type="number"
              name="nombreArticles"
              min="1"
              value={newOrder.nombreArticles}
              onChange={handleOrderInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant total (MAD)</label>
            <input
              type="number"
              name="montant"
              value={newOrder.montant}
              onChange={handleOrderInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="status"
              value={newOrder.status}
              onChange={handleOrderInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Livrée">Livrée</option>
              <option value="Payée">Payée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowAddOrderModal(false)} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={async () => {
              try {
                const token = localStorage.getItem("access_token")
                if (!token) throw new Error("Token manquant")
                const selectedUser = (allUsers || []).find((u) => String(u.id) === String(newOrder.userId))
                const customerName =
                  selectedUser?.fullName ||
                  selectedUser?.nom ||
                  selectedUser?.name ||
                  selectedUser?.username ||
                  newOrder.demandeur ||
                  ""
                const body = {
                  customer: customerName,
                  client: customerName,
                  demandeur: customerName,
                  email: selectedUser?.email || newOrder.email,
                  date: newOrder.date,
                  nombre_articles: parseInt(newOrder.nombreArticles, 10) || 1,
                  montant: parseFloat(newOrder.montant) || 0,
                  statut: newOrder.status || "En attente",
                  product_id: newOrder.productId ? Number(newOrder.productId) : null,
                }
                const response = await fetch(`${API_ENDPOINTS.ORDERS.BASE}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify(body),
                })
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}))
                  throw new Error(errorData.detail || "Erreur lors de la création de la commande")
                }
                await loadOrders()
                setShowAddOrderModal(false)
                setNewOrder((prev) => ({
                  ...prev,
                  date: new Date().toISOString().split("T")[0],
                  nombreArticles: 1,
                  montant: "",
                  status: "En attente",
                }))
              } catch (error) {
                console.error("Erreur lors de la création de la commande:", error)
                alert(error.message || "Erreur lors de la création de la commande")
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Créer la commande
          </Button>
        </div>
      </div>
    </div>
  )

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un produit</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
              <Input
                placeholder="Entrez le nom du produit"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
            <Input
              type="number"
              placeholder="Entrez le prix"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <Input
              type="number"
              placeholder="Quantité en stock"
              value={newProductStock}
              onChange={(e) => setNewProductStock(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil minimal</label>
            <Input
              type="number"
              placeholder="Seuil d'alerte"
              value={newProductMinThreshold}
              onChange={(e) => setNewProductMinThreshold(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <Select value={newProductDepartment} onValueChange={(v) => setNewProductDepartment(v)}>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
            <Select value={newProductSupplier} onValueChange={(v) => setNewProductSupplier(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((sup) => (
                  <SelectItem key={sup.id} value={sup.nom}>
                    {sup.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout</label>
            <Input
              type="date"
              placeholder="YYYY-MM-DD"
              value={newProductDateAdded}
              onChange={(e) => setNewProductDateAdded(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image du produit (depuis votre PC)</label>
            <Input type="file" accept="image/*" onChange={handleProductImageFile} />
            {newProductImage && (
              <p className="text-xs text-green-700">Image prête à être envoyée (base64).</p>
            )}
            <p className="text-xs text-muted-foreground">Choisissez une image locale ; elle sera encodée et envoyée.</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowProductModal(false)}>
            Annuler
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCreateProduct}
            disabled={!newProductName || !newProductPrice || !newProductStock}
          >
            Ajouter
          </Button>
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
                <ChevronDown className="h-4 w-4" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Réle</label>
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
                <div className="flex items-center justify-between pt-4 border-t">
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
                    <X className="h-4 w-4" />
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
                <TableHead>Téléphone</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user, idx) => (
                <TableRow key={user?.id ?? user?.email ?? `${user?.name || 'user'}-${startIndex + idx}`} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.phone}</TableCell>
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
          <Button variant="ghost" size="sm" onClick={() => { setShowUserDetailsModal(false); setIsEditingUser(false) }}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {selectedUser && !isEditingUser && (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Réle</label>
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

        {selectedUser && isEditingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <Input value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <Input value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
              <Input type="date" value={editUserDate || ''} onChange={(e) => setEditUserDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <Select value={editUserDepartment} onValueChange={setEditUserDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <Select value={editUserStatus} onValueChange={setEditUserStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-2">
          {!isEditingUser ? (
            <>
              <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>Fermer</Button>
              <Button onClick={() => {
                if (!selectedUser) return
                if (!selectedUser.id) {
                  alert("Impossible de modifier: ID utilisateur manquant pour cet enregistrement. Rechargez la liste ou re-synchronisez les utilisateurs.")
                  return
                }
                setEditUserName(selectedUser.name || "")
                setEditUserEmail(selectedUser.email || "")
                setEditUserPhone(selectedUser.phone || "")
                setEditUserDepartment(selectedUser.department || "")
                setEditUserStatus(selectedUser.status || "Actif")
                setEditUserDate(selectedUser.date || "")
                setIsEditingUser(true)
              }}>Modifier</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditingUser(false)}>Annuler</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
                try {
                  // Formater la date correctement pour l'API
                  const formattedDate = editUserDate ? new Date(editUserDate).toISOString().split('T')[0] : undefined;

                  // Construire plusieurs variantes de payload selon l'API
                  const payloadClassic = {
                    nom: editUserName,
                    email: (editUserEmail || '').toLowerCase().trim(),
                    telephone: editUserPhone,
                    departement: editUserDepartment,
                    actif: editUserStatus === "Actif",
                    ...(formattedDate ? { date_creation: formattedDate } : {}),
                  }
                  const payloadAlt = {
                    fullName: editUserName,
                    email: (editUserEmail || '').toLowerCase().trim(),
                    phone: editUserPhone,
                    department: editUserDepartment,
                    isActive: editUserStatus === "Actif",
                  }

                  // Endpoint unique pour la mise à jour des utilisateurs (backend Node)
                  if (!selectedUser || !selectedUser.id) {
                    throw new Error("ID utilisateur manquant");
                  }
                  const endpoints = [
                    `${API_BASE_URL}/accounts/users/${selectedUser.id}/`,
                  ]

                  let updated = null
                  let lastErrText = ''
                  for (const url of endpoints) {
                    for (const body of [payloadClassic, payloadAlt]) {
                      const res = await fetch(url, {
                        method: "PUT",
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify(body),
                      })

                      if (res.ok) {
                        updated = await res.json().catch(() => ({}))
                        break
                      }

                      // Si 404, essayer l'endpoint suivant; sinon mémoriser le texte
                      const txt = await res.text().catch(() => "")
                      lastErrText = txt || `${res.status}`
                      if (res.status === 404) continue
                      // Si autre erreur (400/500), tenter l'autre payload/endpoint
                    }
                    if (updated) break
                  }

                  if (!updated) {
                    throw new Error(lastErrText || "é?chec de la modification")
                  }

                  // Mise à jour de l'état local avec la date formatée
                  setAllUsers((prev) => prev.map((u) => u.id === selectedUser.id ? {
                    ...u,
                    name: updated.nom || editUserName,
                    email: updated.email || editUserEmail,
                    phone: updated.telephone || editUserPhone,
                    department: updated.departement || editUserDepartment,
                    status: (updated.actif !== undefined ? updated.actif : (editUserStatus === "Actif")) ? "Actif" : "Inactif",
                    date: updated.date_creation || formattedDate || u.date,
                  } : u))

                  // Mettre à jour l'utilisateur sélectionné avec les nouvelles données
                  setSelectedUser(prev => ({
                    ...prev,
                    name: updated.nom || editUserName,
                    email: updated.email || editUserEmail,
                    phone: updated.telephone || editUserPhone,
                    department: updated.departement || editUserDepartment,
                    status: (updated.actif !== undefined ? updated.actif : (editUserStatus === "Actif")) ? "Actif" : "Inactif",
                    date: updated.date_creation || formattedDate || prev.date,
                  }))

                  setIsEditingUser(false)
                } catch (e) {
                  console.error("Erreur lors de la modification:", e)
                  alert(e.message || "Erreur lors de la modification de l'utilisateur")
                }
              }}>Enregistrer</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const handleDeleteUser = async (user) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('Token manquant')
      if (!user?.id) throw new Error('ID utilisateur manquant')

      const url = `${API_BASE_URL}/accounts/users/${user.id}/`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      })

      if (!(res.ok || res.status === 204)) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Suppression échouée (${res.status})`)
      }

      // Mise à jour locale si succès
      setAllUsers(prev => prev.filter(u => u.id !== user.id))
      setShowDeleteConfirmModal(false)
      setSelectedUser(null)
    } catch (e) {
      console.error('Erreur suppression utilisateur:', e)
      alert(e.message || 'Erreur lors de la suppression')
    }
  }

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
            <p className="text-gray-600 mb-2">éStes-vous sûr de vouloir supprimer l'utilisateur suivant ?</p>
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
            onClick={() => selectedUser && handleDeleteUser(selectedUser)}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {userName}</h1>
        <p className="text-gray-600">Voici un aperçu de votre tableau de bord</p>
      </div>

      <StatsCards />
      <SalesChart />

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
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                <Button
                  variant="ghost"
                  onClick={clearProductFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
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
                      <option key={supplier.id || supplier.nom} value={supplier.nom}>
                        {supplier.nom}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
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
                    Prix unitaire (MAD)
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-400 rounded border border-gray-200">
                            📦
                          </div>
                        )}
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {product.price.toLocaleString("fr-FR", { style: "currency", currency: "MAD" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.dateAdded).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              // Initialize edit fields
                              setEditProductName(product.name || "")
                              setEditProductPrice(String(product.price ?? ""))
                            setEditProductStock(String(product.stock ?? ""))
                            setEditProductMinThreshold(String(product.minThreshold ?? ""))
                            setEditProductDepartment(product.department || "")
                            setEditProductSupplier(product.supplier || "")
                            setEditProductDateAdded(product.dateAdded ? String(product.dateAdded).slice(0,10) : "")
                              setEditProductImage(product.image || "")
                            setIsEditingProduct(false)
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
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Aucun produit ne correspond aux critères de recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {showProductDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails du produit</h3>
              <button onClick={() => { setShowProductDetailsModal(false); setIsEditingProduct(false) }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {!isEditingProduct ? (
              <>
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
                    <span className="font-medium text-gray-700">Département:</span>
                    <span className="ml-2 text-gray-900">{selectedProduct.department}</span>
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
                    <span className="ml-2 text-gray-900">{new Date(selectedProduct.dateAdded).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStockStatus(selectedProduct).color}`}>{getStockStatus(selectedProduct).text}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                  <Button variant="outline" onClick={() => setShowProductDetailsModal(false)}>Fermer</Button>
                  <Button onClick={() => setIsEditingProduct(true)}>Modifier</Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <Input value={editProductName} onChange={(e) => setEditProductName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                    <Input type="number" value={editProductPrice} onChange={(e) => setEditProductPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock réel</label>
                    <Input type="number" value={editProductStock} onChange={(e) => setEditProductStock(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seuil minimal</label>
                    <Input type="number" value={editProductMinThreshold} onChange={(e) => setEditProductMinThreshold(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    <Select value={editProductDepartment} onValueChange={setEditProductDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                    <Input value={editProductSupplier} onChange={(e) => setEditProductSupplier(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout</label>
                    <Input type="date" value={editProductDateAdded || ''} onChange={(e) => setEditProductDateAdded(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit (depuis votre PC)</label>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) { setEditProductImage(""); return }
                      const reader = new FileReader()
                      reader.onload = () => setEditProductImage(reader.result || "")
                      reader.readAsDataURL(file)
                    }} />
                    {editProductImage && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={editProductImage} alt="Aperçu" className="h-12 w-12 object-cover rounded border" />
                        <button className="text-sm text-red-500 hover:underline" onClick={() => setEditProductImage("")}>Supprimer l'image</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                  <Button variant="outline" onClick={() => setIsEditingProduct(false)}>Annuler</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
                    try {
                      const token = localStorage.getItem('access_token')
                      if (!token) throw new Error('Token manquant')
                      const id = selectedProduct?.id
                      if (!id) throw new Error('ID produit manquant')

                      const body = {
                        nom: editProductName,
                        prix: parseFloat(editProductPrice || '0'),
                        quantite: parseInt(editProductStock || '0', 10),
                        seuil_alerte: parseInt(editProductMinThreshold || '0', 10),
                        departement: editProductDepartment,
                        fournisseur: editProductSupplier,
                        ...(editProductDateAdded ? { date_ajout: editProductDateAdded } : {}),
                        ...(editProductImage ? { image: editProductImage } : {}),
                      }

                      const candidates = [
                        `${API_ENDPOINTS.PRODUCTS.BASE}${id}/`,
                        `${API_BASE_URL}/produits/${id}/`,
                      ]

                      let updated = null
                      let lastErr = ''
                      for (const url of candidates) {
                        const res = await fetch(url, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify(body),
                        })
                        if (res.ok) { updated = await res.json(); break }
                        if (res.status === 404) continue
                        lastErr = await res.text().catch(() => `${res.status}`)
                      }
                      if (!updated) throw new Error(lastErr || 'é?chec de la modification du produit')

                      // Mapper DTO -> UI
                      const ui = {
                        id: String(updated.id),
                        name: updated.nom || updated.name,
                        department: updated.departement || updated.department || '',
                        stock: updated.quantite ?? updated.quantity ?? 0,
                        minThreshold: updated.seuil_alerte ?? updated.minThreshold ?? 0,
                        supplier: updated.fournisseur || updated.supplier || '',
                        dateAdded: updated.date_ajout || updated.dateAdded || new Date().toISOString(),
                        price: typeof updated.prix === 'number' ? updated.prix : (updated.price ?? 0),
                        image: updated.image || updated.image_url || updated.photo || "",
                      }

                      setProducts(prev => prev.map(p => String(p.id) === String(ui.id) ? ui : p))
                      setSelectedProduct(ui)
                      setIsEditingProduct(false)
                    } catch (e) {
                      console.error('Erreur modification produit:', e)
                      alert(e.message || 'Erreur lors de la modification du produit')
                    }
                  }}>Enregistrer</Button>
                </div>
              </>
            )}
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
              éStes-vous sûr de vouloir supprimer le produit "{productToDelete.name}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteProductModal(false)}>
                Annuler
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteProduct}>Supprimer</Button>
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
        <p className="text-gray-600">Gérez toutes les commandes de votre plateforme</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
          <Button
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setShowAddOrderModal(true)}
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
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">ID Commande</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">nombre d'articles</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total || 0)
                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-blue-600">{order.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.customer}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.productName || order.product?.name || "Produit"}
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
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {orderTotal.toFixed(2)} MAD
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
<Button
  variant="ghost"
  size="sm"
  className="hover:bg-blue-50 hover:text-blue-600"
  onClick={() => {
    setSelectedOrder(order)
    setEditOrderCustomer(order.customer || "")
    setEditOrderEmail(order.email || "")
    setEditOrderDate(order.date ? String(order.date).slice(0,10) : "")
    setEditOrderItems(String(order.items ?? ""))
    setEditOrderTotal(String(order.total ?? ""))
    setEditOrderStatus(order.status || "En attente")
    setIsEditingOrder(false)
    setShowOrderDetailsModal(true)
  }}
>
  <Eye className="h-4 w-4" />
</Button>
<Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteOrder(order)}>
  <Trash2 className="h-4 w-4" />
</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">Aucune commande ne correspond aux critères de recherche.</p>
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
            {!isEditingOrder ? (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Demandeur</label>
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
                      <label className="block text-sm font-medium text-gray-700">Nombre d'articles</label>
                      <p className="text-gray-900">{selectedOrder.items}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <p className="text-gray-900 font-semibold">
                        {selectedOrder ? parseFloat(selectedOrder.total || 0).toFixed(2) : '0.00'} MAD
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowOrderDetailsModal(false)} className="flex-1">
                    Fermer
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditingOrder(true)}>Modifier</Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Demandeur</label>
                      <Input value={editOrderCustomer} onChange={(e) => setEditOrderCustomer(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <Input value={editOrderEmail} onChange={(e) => setEditOrderEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <Input type="date" value={editOrderDate} onChange={(e) => setEditOrderDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg" value={editOrderStatus} onChange={(e)=>setEditOrderStatus(e.target.value)}>
                        <option>En attente</option>
                        <option>En cours</option>
                        <option>Validée</option>
                        <option>Refusée</option>
                        <option>Livrée</option>
                        <option>Annulée</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre d'articles</label>
                      <Input type="number" value={editOrderItems} onChange={(e) => setEditOrderItems(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total (MAD)</label>
                      <Input type="number" value={editOrderTotal} onChange={(e) => setEditOrderTotal(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setIsEditingOrder(false)} className="flex-1">Annuler</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={async () => {
                    try {
                      const token = localStorage.getItem('access_token')
                      if (!token) throw new Error('Token manquant')
                      const sourceType = String(selectedOrder?.sourceType || "order")
                      const apiId = String(selectedOrder?.apiId ?? selectedOrder?.id ?? "")
                      if (!apiId) throw new Error("ID commande manquant")

                      const isRequest = sourceType === "request"
                      const body = isRequest
                        ? {
                            statut: toRequestStatus(editOrderStatus),
                          }
                        : {
                            client: editOrderCustomer,
                            email: editOrderEmail,
                            date: editOrderDate,
                            statut: editOrderStatus,
                            nombre_articles: parseInt(editOrderItems || '0', 10),
                            montant: parseFloat(editOrderTotal || '0'),
                          }

                      const endpoint = isRequest
                        ? API_ENDPOINTS.REQUESTS.UPDATE(apiId)
                        : `${API_ENDPOINTS.ORDERS.BASE}${apiId}/`

                      const res = await fetch(endpoint, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(body),
                      })
                      if (!res.ok) throw new Error(await res.text().catch(() => 'Mise à jour échouée'))
                      const updated = await res.json()

                      const ui = isRequest ? mapRequestToRow(updated) : mapOrderToRow(updated)
                      setOrders((prev) =>
                        prev.map((o) => (isSameOrderEntry(o, sourceType, apiId) ? { ...o, ...ui } : o))
                      )
                      setSelectedOrder((prev) => ({ ...prev, ...ui }))
                      setIsEditingOrder(false)
                      await loadOrders()
                    } catch (e) {
                      console.error('Erreur mise à jour commande:', e)
                      alert(e.message || 'Erreur mise à jour commande')
                    }
                  }}>Enregistrer</Button>
                </div>
              </>
            )}
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
              éStes-vous sûr de vouloir supprimer la commande <strong>{orderToDelete.id}</strong> de{" "}
              <strong>{orderToDelete.customer}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteOrderModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={confirmDeleteOrder}>Supprimer</Button>
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
                <p className="text-gray-600 text-sm">Demandeur: {orderToValidate.customer}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              éStes-vous sûr de vouloir valider cette commande ? Le client sera notifié et la commande passera en statut
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
                <p className="text-gray-600 text-sm">Demandeur: {orderToRefuse.customer}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Motif du refus (optionnel)</label>
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

  const RequestsSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes d'achat</h1>
        <p className="text-gray-600">Toutes les demandes soumises par les utilisateurs</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par demandeur, produit ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={requestSearchTerm}
                onChange={(e) => setRequestSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={requestStatusFilter || 'all'} onValueChange={handleRequestStatusChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Validée">Validée</SelectItem>
              <SelectItem value="Refusée">Refusée</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Demandeur</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Coût estimé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.apiId}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{req.customer || "—"}</span>
                      <span className="text-xs text-gray-500">{req.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{req.productName || "—"}</TableCell>
                  <TableCell>{req.date ? new Date(req.date).toLocaleDateString() : ""}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        req.status === "Validée"
                          ? "bg-green-100 text-green-800"
                          : req.status === "Refusée"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {normalizeRequestStatusForUI(req.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{req.items}</TableCell>
                  <TableCell className="text-right">{formatMAD(req.total)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-700 border-green-200"
                      onClick={() => handleValidateRequest(req)}
                      disabled={normalizeRequestStatusForUI(req.status) === "Validée"}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-200"
                      onClick={() => handleRefuseRequest(req)}
                      disabled={normalizeRequestStatusForUI(req.status) === "Refusée"}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Refuser
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                    Aucune demande trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const ReportsSection = () => {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [metric, setMetric] = useState('count')

    const totalOrders = orderReports.totalOrders
    const ordersByStatusRaw = orderReports.byStatus || {}
    const statusOrder = [
      { key: 'En attente', label: ' En attente' },
      { key: 'Validée', label: ' Validée' },
      { key: 'Expédiée', label: ' Expédiée' },
      { key: 'Livrée', label: ' Livrée' },
      { key: 'Annulée', label: ' Annulée' },
      { key: 'En cours', label: ' En cours' },
    ]
    const ordersByStatus = statusOrder.map(s => ({ label: s.label, count: Number(ordersByStatusRaw[s.key] || 0) }))
    const orderTimelineSeries = (Array.isArray(orderReports.timeline) ? orderReports.timeline : [])
      .map((t) => ({
        label: String(t.date || t.jour || t.label || '').slice(5),
        count: Number(t.count ?? t.commandes ?? t.orders ?? t.nombre ?? 0),
        total: Number(t.total ?? t.amount ?? t.montant ?? t.montant_total ?? 0),
      }))
      .filter((t) => t.label)

    const buildOrdersDataset = () => {
      const safeOrders = Array.isArray(orders) ? orders : []
      return safeOrders.map((o) => ({
        id: o.id || '',
        client: o.customer || o.client || '',
        email: o.email || '',
        produit: o.productName || o.product?.name || '',
        date: o.date ? new Date(o.date).toLocaleDateString('fr-FR') : '',
        statut: o.status || '',
        articles: o.items ?? '',
        total: typeof o.total === 'number' ? o.total.toFixed(2) : o.total || '',
      }))
    }

    const exportToPDF = () => {
      const rows = buildOrdersDataset()
      const htmlRows = rows
        .map(
          (r) =>
            `<tr><td>${r.id}</td><td>${r.client}</td><td>${r.produit}</td><td>${r.date}</td><td>${r.statut}</td><td>${r.articles}</td><td>${r.total} MAD</td></tr>`
        )
        .join('')
      const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rapport commandes</title>
          <style>
            body{font-family:Arial, sans-serif;padding:24px;}
            table{border-collapse:collapse;width:100%;}
            th,td{border:1px solid #ddd;padding:8px;font-size:12px;}
            th{background:#f4f4f5;text-align:left;}
            h1{margin-bottom:16px;}
          </style>
        </head>
        <body>
          <h1>Rapport des commandes</h1>
          <p>Total commandes: ${orderReports.totalOrders || rows.length}</p>
          <table>
            <thead>
              <tr><th>ID</th><th>Client</th><th>Produit</th><th>Date</th><th>Statut</th><th>Articles</th><th>Total</th></tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body>
      </html>`
      const win = window.open('', '_blank', 'width=1000,height=700')
      if (!win) return
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
    }

    const exportToExcel = () => {
      const rows = buildOrdersDataset()
      const header = ['ID', 'Client', 'Email', 'Produit', 'Date', 'Statut', 'Articles', 'Total (MAD)']
      const csv = [
        header.join(';'),
        ...rows.map((r) =>
          [r.id, r.client, r.email, r.produit, r.date, r.statut, r.articles, r.total]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(';')
        ),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'rapport-commandes.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // Compute real stock metrics from products state
    const effectiveThreshold = (p) => Number(p.minThreshold || stockSettings.seuilGlobal || 0)
    const lowStockProducts = (products || []).filter(p => Number(p.stock) <= effectiveThreshold(p)).length
    const outOfStockProducts = (products || []).filter(p => Number(p.stock) === 0).length
    const totalStockValue = (products || []).reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0), 0)
    const totalUsers = (allUsers || []).length
    const usersByDepartment = (allUsers || []).reduce((acc, u) => {
      const d = u.department || u.departement || 'Autre'
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})
    const usersByRole = (allUsers || []).reduce((acc, u) => {
      const role = (u.is_admin || u.role === 'admin') ? 'Admin' : 'Utilisateur'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})

    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports et Statistiques</h1>
          <p className="text-gray-600">
            Consultez et exportez les rapports détaillés de votre activité. Analysez les tendances, suivez les performances
            et prenez des décisions éclairées pour votre entreprise.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Orders Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Rapports de commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Nombre total de commandes</span>
                  <span className="text-lg font-bold text-blue-600">{totalOrders}</span>
                </div>

                {/* Filtres de période */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Du</label>
                    <input type="date" className="w-full p-2 border rounded" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Au</label>
                    <input type="date" className="w-full p-2 border rounded" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button
                      className="w-full"
                      onClick={() => {
                        loadOrderReports({ dateFrom, dateTo })
                        loadChartsReports({ dateFrom, dateTo })
                      }}
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Répartition des commandes par état :</h4>
                  <div className="space-y-2">
                    {ordersByStatus.map((row) => (
                      <div key={row.label} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{row.label}</span>
                        <span className="font-medium">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700">Courbe des commandes</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Métrique:</span>
                      <select
                        className="p-1 border rounded"
                        value={metric}
                        onChange={(e)=>setMetric(e.target.value)}
                      >
                        <option value="count">Nombre</option>
                        <option value="total">Montant (MAD)</option>
                      </select>
                    </div>
                  </div>

                  {/* Simple bar chart (no external deps) */}
                  {(() => {
                    const series = orderTimelineSeries.map((t) => ({
                      label: t.label,
                      value: metric === 'count' ? t.count : t.total,
                    }))
                    const maxVal = Math.max(1, ...series.map(d => d.value))
                    const formatValue = (value) =>
                      metric === 'count'
                        ? `${Math.round(value)}`
                        : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)
                    return (
                      <div>
                        <div className="h-44 flex items-end gap-3 overflow-x-auto pb-2">
                          {series.length === 0 && (
                            <div className="w-full text-center text-gray-400 text-sm">Aucune donnée pour la période sélectionnée</div>
                          )}
                          {series.map((d, idx) => (
                            <div key={idx} className="w-14 shrink-0 flex flex-col items-center justify-end">
                              <span className="mb-1 text-[10px] text-gray-500">{formatValue(d.value)}</span>
                              <div
                                className="w-full bg-blue-500 rounded-t"
                                style={{ height: `${Math.max((d.value / maxVal) * 120, d.value > 0 ? 6 : 2)}px` }}
                                title={`${d.label}: ${d.value}`}
                              />
                              <span className="mt-1 w-full text-center text-[10px] text-gray-500 truncate">{d.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Rapports de stock (produits)
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
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full text-green-600 font-medium`}
                  >
                    ?? Valeur estimée du stock total
                  </span>
                  <span className="text-lg font-bold text-green-600">{totalStockValue.toLocaleString()} MAD</span>
                </div>

                {lowStockProducts > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        ?? {lowStockProducts} produit(s) nécessite(nt) un réapprovisionnement
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
                <Users className="h-5 w-5 mr-2" />Rapports utilisateurs
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
                      <div key={dept} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">{dept}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Répartition par réle</h4>
                  <div className="space-y-2">
                    {Object.entries(usersByRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
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
                <TrendingUp className="h-5 w-5 mr-2" />Graphiques & Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Evolution des commandes (filtrée) */}
                <div className="p-4 rounded-xl bg-blue-50">
                  <div className="text-center mb-3 font-medium text-blue-700">Répartition des commandes par type</div>
                  {(() => {
                    const series = ordersByStatus
                      .map((d) => ({ label: String(d.label || '').trim(), value: Number(d.count || 0) }))
                      .filter((d) => d.value > 0)
                    const total = series.reduce((sum, d) => sum + d.value, 0)
                    const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

                    let acc = 0
                    const segments = series.map((d, i) => {
                      const start = (acc / Math.max(total, 1)) * 360
                      acc += d.value
                      const end = (acc / Math.max(total, 1)) * 360
                      const color = palette[i % palette.length]
                      return `${color} ${start}deg ${end}deg`
                    })

                    return (
                      <div className="flex flex-col items-center">
                        {total <= 0 ? (
                          <div className="w-full text-center text-gray-400 text-sm py-10">Aucune donnée</div>
                        ) : (
                          <>
                            <div
                              className="w-40 h-40 rounded-full"
                              style={{ background: `conic-gradient(${segments.join(',')})` }}
                              title={`Total: ${total}`}
                            />
                            <div className="mt-3 w-full space-y-1">
                              {series.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="inline-block w-3 h-3 rounded-sm"
                                      style={{ background: palette[i % palette.length] }}
                                    />
                                    <span className="text-gray-700">{d.label}</span>
                                  </div>
                                  <span className="font-medium">{d.value}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Barres Activité des utilisateurs */}
                <div className="p-4 rounded-xl bg-green-50">
                  <div className="text-center mb-3 font-medium text-green-700">Activité des utilisateurs</div>
                  {(() => {
                    const series = (charts.usersActivity || []).map(d => ({ label: String(d.date).slice(5), value: Number(d.count||0) }))
                    const maxVal = Math.max(1, ...series.map(d => d.value))
                    return (
                      <div>
                        <div className="h-40 flex items-end gap-2">
                          {series.length === 0 && <div className="w-full text-center text-gray-400 text-sm">Aucune donnée</div>}
                          {series.map((d, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-green-500 rounded-t" style={{ height: `${(d.value / maxVal) * 140}px` }} title={`${d.label}: ${d.value}`} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${Math.max(series.length,1)}, 1fr)` }}>
                          {series.map((d, idx) => (<div key={idx} className="text-center text-[10px] text-gray-500 truncate">{d.label}</div>))}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Barres Stock par département */}
                <div className="p-4 rounded-xl bg-purple-50">
                  <div className="text-center mb-3 font-medium text-purple-700">Stock par département</div>
                  {(() => {
                    const series = (charts.stockByDepartment || []).map(d => ({ label: d.department || 'Autre', value: Number(d.quantity||0) }))
                    const maxVal = Math.max(1, ...series.map(d => d.value))
                    return (
                      <div>
                        <div className="h-40 flex items-end gap-2">
                          {series.length === 0 && <div className="w-full text-center text-gray-400 text-sm">Aucune donnée</div>}
                          {series.map((d, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-purple-500 rounded-t" style={{ height: `${(d.value / maxVal) * 140}px` }} title={`${d.label}: ${d.value}`} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${Math.max(series.length,1)}, 1fr)` }}>
                          {series.map((d, idx) => (<div key={idx} className="text-center text-[10px] text-gray-500 truncate">{d.label}</div>))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Exports & impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en Excel
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                 Imprimer les rapports
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Informations sur les exports</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Les rapports peuvent étre exportés aux formats PDF et Excel. Utilisez les filtres ci-dessus pour
                    personnaliser le contenu de votre rapport selon la période, le département et le statut souhaités.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const SettingsSection = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramétres</h1>
        <p className="text-gray-600">
          Cette section vous permet de gérer les paramétres généraux du systéme. Ajoutez des départements, configurez
          les fournisseurs, définissez les réles utilisateurs et ajustez les seuils de stock pour une meilleure
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
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
              setNewSupplierNom('')
              setNewSupplierEmail('')
              setNewSupplierTelephone('')
              setNewSupplierAdresse('')
              setSelectedSupplier(null)
              setShowSupplierModal(true)
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium block">{supplier.nom}</span>
                    {supplier.email && <span className="text-xs text-gray-500">{supplier.email}</span>}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedSupplier(supplier)
                        setNewSupplierNom(supplier.nom)
                        setNewSupplierEmail(supplier.email)
                        setNewSupplierTelephone(supplier.telephone)
                        setNewSupplierAdresse(supplier.adresse)
                        setShowSupplierModal(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setSupplierToDelete(supplier)
                        setShowDeleteSupplierModal(true)
                      }}
                    >
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

        {/* Réles & autorisations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle>Règles & Autorisations</CardTitle>
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
                  <p className="text-xs text-gray-600 mb-2">{role.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-medium"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
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
              <CardTitle>{t("company.info")}</CardTitle>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCompanyModal(true)}>
              <Edit className="h-4 w-4 mr-1" />
              {t("action.edit")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("company.name")}</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("company.email")}</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("company.address")}</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.adresse}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("company.phone")}</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{companySettings.telephone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramétres généraux */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-teal-600" />
              <CardTitle>{t("general.settings")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("general.defaultCurrency")}</label>
                <select
                  value={companySettings.devise}
                  onChange={(e) => setCompanySettings({ ...companySettings, devise: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MAD">{t("currency.mad")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("general.language")}</label>
                <select
                  value={companySettings.langue}
                  onChange={(e) => {
                    const value = e.target.value
                    setCompanySettings({ ...companySettings, langue: value })
                    setLanguage(value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fr">{t("lang.fr")}</option>
                  <option value="ar">{t("lang.ar")}</option>
                  <option value="en">{t("lang.en")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("general.timezone")}</label>
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
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
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
                    setDepartmentName("")
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const name = departmentName.trim()
                    if (!name) return
                    setDepartments((prev) => {
                      if (selectedDepartment) {
                        return prev.map((d) => (d === selectedDepartment ? name : d))
                      }
                      return [...prev, name]
                    })
                    setShowDepartmentModal(false)
                    setSelectedDepartment(null)
                    setDepartmentName("")
                  }}
                >
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
                  setNewSupplierNom('')
                  setNewSupplierEmail('')
                  setNewSupplierTelephone('')
                  setNewSupplierAdresse('')
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
                  value={newSupplierNom}
                  onChange={(e) => setNewSupplierNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fournisseur ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@fournisseur.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newSupplierTelephone}
                  onChange={(e) => setNewSupplierTelephone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+212 5 22 XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <textarea
                  value={newSupplierAdresse}
                  onChange={(e) => setNewSupplierAdresse(e.target.value)}
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
                    setNewSupplierNom('')
                    setNewSupplierEmail('')
                    setNewSupplierTelephone('')
                    setNewSupplierAdresse('')
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={selectedSupplier ? handleUpdateSupplier : handleCreateSupplier}
                >
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
                  {["Utilisateurs", "Produits", "Commandes", "Rapports", "Paramétres"].map((permission) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("company.name")}</label>
                <input
                  type="text"
                  value={companyForm.nom}
                  onChange={(e) => setCompanyForm({ ...companyForm, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("company.email")}</label>
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("company.phone")}</label>
                <input
                  type="tel"
                  value={companyForm.telephone}
                  onChange={(e) => setCompanyForm({ ...companyForm, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("company.address")}</label>
                <input
                  type="text"
                  value={companyForm.adresse}
                  onChange={(e) => setCompanyForm({ ...companyForm, adresse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCompanyModal(false)}>
                  {t("action.cancel") || "Annuler"}
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    setCompanySettings(companyForm)
                    setShowCompanyModal(false)
                  }}
                >
                  {t("action.save") || "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Supplier Confirmation Modal */}
      {showDeleteSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDeleteSupplierModal(false)
                  setSupplierToDelete(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                éStes-vous sûr de vouloir supprimer le fournisseur <strong>{supplierToDelete?.nom}</strong> ?
              </p>
              <p className="text-sm text-gray-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowDeleteSupplierModal(false)
                  setSupplierToDelete(null)
                }}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteSupplier}
              >
                Supprimer
              </Button>
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
      case "requests":
        return <RequestsSection />
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
    { id: "ORD002", client: "Client B", date: "2024-01-15", statut: "En cours", montant: 890 },
    { id: "ORD003", client: "Client C", date: "2024-01-14", statut: "En attente", montant: 2100 },
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

  const [newOrder, setNewOrder] = useState({
    userId: "",
    productId: "",
    demandeur: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
    nombreArticles: 1,
    montant: "",
    status: "En attente",
  });

  // Pré-sélectionner le premier utilisateur si rien n'est choisi
  useEffect(() => {
    if (!newOrder.userId && Array.isArray(allUsers) && allUsers.length > 0) {
      const u = allUsers[0]
      setNewOrder((prev) => ({
        ...prev,
        userId: String(u.id),
        demandeur: u.fullName || u.nom || u.name || u.username || "",
        email: u.email || prev.email,
      }))
    }
  }, [allUsers, newOrder.userId])

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]:
        name === 'nombreArticles'
          ? parseInt(value) || 0
          : (name === 'montant' ? value : value)
    }));
  };

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier si le token est toujours valide
        const response = await fetch('http://localhost:8000/api/accounts/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          // Stocker les informations de l'utilisateur dans le state si nécessaire
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Si le token n'est pas valide, tenter de le rafraîchir
          await refreshToken();
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction pour rafraîchir le token d'accès
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error("Aucun token de rafraîchissement disponible");
      }

      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("é?chec du rafraîchissement du token");
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      return false;
    }
  };

  // Si le chargement est en cours, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/loginadmin" replace />;
  }

  // Le reste de votre composant Dashboard...
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
      {showAddOrderModal && <AddOrderModal />}
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
              éStes-vous sûr de vouloir supprimer le produit "{productToDelete.name}" ? Cette action est irréversible.
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Profil</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowProfileModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-medium text-blue-600">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{userName || 'Administrateur'}</h4>
                  <p className="text-sm text-gray-500">
                    {userData?.email || 'Aucun email disponible'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    navigate('/loginadmin');
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard;


