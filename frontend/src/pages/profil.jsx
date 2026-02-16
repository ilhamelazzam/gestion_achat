import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Separator } from "../components/ui/separator"
import { ArrowLeft, Edit, Save, X, User, Mail, Building, Calendar, Shield, LogOut } from "lucide-react"
import { Link } from "react-router-dom"
import { getUserData, setUserData, logout } from "../utils/auth"
import { API_BASE_URL } from "../config"

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [rawUser, setRawUser] = useState(null)
  const [user, setUser] = useState({
    name: "Utilisateur",
    email: "",
    department: "",
    role: "Utilisateur",
    phone: "",
    joinDate: "",
    employeeId: "",
    avatar: "",
  })

  const [editedUser, setEditedUser] = useState(user)
  const [activities, setActivities] = useState([])

  const normalizeUser = (data, fallbackName) => {
    const roleValue = String(data?.role || "").toLowerCase()
    const isAdmin =
      data?.is_admin === true ||
      data?.isAdmin === true ||
      data?.is_staff === true ||
      data?.is_superuser === true ||
      roleValue.includes("admin")

    const roleLabel = roleValue
      ? roleValue.includes("admin")
        ? "Administrateur"
        : "Utilisateur"
      : isAdmin
        ? "Administrateur"
        : "Utilisateur"

    return {
      name:
        data?.nom ||
        data?.full_name ||
        data?.fullName ||
        data?.username ||
        data?.name ||
        fallbackName ||
        "Utilisateur",
      email: data?.email || data?.userEmail || data?.user_email || "",
      department: data?.departement || data?.department || data?.userDepartment || data?.user_department || "",
      role: roleLabel,
      phone: data?.phone || data?.telephone || "",
      joinDate: data?.date_joined || data?.date_creation || data?.createdAt || data?.created_at || "",
      employeeId: data?.employeeId || data?.employee_id || data?.id || data?.user_id || "",
      avatar: data?.avatar || data?.photo || "",
    }
  }

  const formatDate = (value) => {
    if (!value) return "-"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const displayValue = (value) => {
    if (value === null || value === undefined) return "-"
    const text = String(value).trim()
    return text.length > 0 ? text : "-"
  }

  const getInitials = (value) => {
    const cleaned = String(value || "").trim()
    if (!cleaned || cleaned === "-") return "U"
    return cleaned
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
  }

  useEffect(() => {
    const storedUser = getUserData()
    const fallbackName = localStorage.getItem("userName") || "Utilisateur"
    const normalizedUser = normalizeUser(storedUser, fallbackName)
    setRawUser(storedUser)
    setUser(normalizedUser)
    setEditedUser(normalizedUser)
    const token = localStorage.getItem("access_token")
    if (!token || normalizedUser.joinDate) return

    let isMounted = true
    fetch(`${API_BASE_URL}/accounts/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !isMounted) return
        const refreshedUser = normalizeUser(data, normalizedUser.name)
        setRawUser(data)
        setUser(refreshedUser)
        setEditedUser(refreshedUser)
        setUserData(data)
      })
      .catch(() => null)

    return () => {
      isMounted = false
    }
  }, [])

  // Helpers pour l'activité récente
  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  const formatRelativeTime = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    const diffMs = Date.now() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return "Aujourd'hui"
    if (diffDays === 1) return "Il y a 1 jour"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks === 1) return "Il y a 1 semaine"
    return `Il y a ${diffWeeks} semaines`
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    let active = true
    const loadActivities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/demandes/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = res.ok ? await res.json() : []
        const list = (Array.isArray(data) ? data : [])
          .map((item) => {
            const status = item.status || item.statut || "En attente"
            const normalizedStatus = normalizeText(status)
            let action = "Demande créée"
            if (normalizedStatus.includes("approuv")) action = "Demande approuvée"
            else if (normalizedStatus.includes("refus")) action = "Demande refusée"
            else if (normalizedStatus.includes("cours")) action = "Demande en cours"

            return {
              action,
              item: item.productName || item.product_name || item.produit || "Demande d'achat",
              date: formatRelativeTime(item.createdAt || item.created_at || item.date),
              rawDate: item.createdAt || item.created_at || item.date || "",
              status,
              requesterEmail: item.userEmail || item.user_email || item.email || "",
            }
          })
          .filter((activity) => {
            if (!user.email) return true
            return normalizeText(activity.requesterEmail) === normalizeText(user.email)
          })
          .sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0))
          .slice(0, 5)

        if (active) setActivities(list)
      } catch (_err) {
        if (active) setActivities([])
      }
    }

    loadActivities()
    return () => {
      active = false
    }
  }, [user.email])

  const joinDateLabel = formatDate(user.joinDate)

  const handleSave = () => {
    setUser(editedUser)
    const nextRawUser = { ...(rawUser || {}) }
    if (editedUser.name) {
      nextRawUser.nom = editedUser.name
      nextRawUser.fullName = editedUser.name
      nextRawUser.full_name = editedUser.name
      nextRawUser.username = editedUser.name
    }
    if (editedUser.email) nextRawUser.email = editedUser.email
    if (editedUser.department) {
      nextRawUser.departement = editedUser.department
      nextRawUser.department = editedUser.department
    }
    if (editedUser.phone) {
      nextRawUser.telephone = editedUser.phone
      nextRawUser.phone = editedUser.phone
    }
    if (editedUser.name) localStorage.setItem("userName", editedUser.name)
    if (Object.keys(nextRawUser).length > 0) {
      setUserData(nextRawUser)
      setRawUser(nextRawUser)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
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
              <img src="/bc-skills-logo.jpeg" alt="BC SKILLS" width={32} height={32} className="rounded-lg" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Mon Profil</h1>
                <p className="text-sm text-muted-foreground">Gestion des informations personnelles</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnecter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-2">{user.role}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Building className="w-4 h-4" />
                    {displayValue(user.department)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {joinDateLabel === "-" ? "-" : `Depuis le ${joinDateLabel}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Gérez vos informations de profil</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{displayValue(user.name)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{displayValue(user.email)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={editedUser.department}
                        onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{displayValue(user.department)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    {isEditing ? (
                      <Input
                        id="role"
                        value={editedUser.role}
                        onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span>{displayValue(user.role)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>ID Employé</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="text-muted-foreground">{displayValue(user.employeeId)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date d'embauche</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(user.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-sm text-muted-foreground">Aucune activité récente trouvée.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
