"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Save, X, User, Mail, Building, Calendar, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({
    name: "Marie Dubois",
    email: "marie.dubois@bcskills.com",
    department: "Ressources Humaines",
    role: "Responsable RH",
    phone: "+33 1 23 45 67 89",
    joinDate: "15 mars 2022",
    employeeId: "EMP-2022-045",
    avatar: "/images/avatar-placeholder.jpg",
  })

  const [editedUser, setEditedUser] = useState(user)

  const handleSave = () => {
    setUser(editedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const recentActivity = [
    {
      action: "Demande créée",
      item: "Ordinateur portable Dell Latitude 5520",
      date: "Il y a 2 jours",
      status: "En attente",
    },
    {
      action: "Demande approuvée",
      item: "Chaises de bureau ergonomiques",
      date: "Il y a 5 jours",
      status: "Approuvée",
    },
    {
      action: "Profil modifié",
      item: "Numéro de téléphone mis à jour",
      date: "Il y a 1 semaine",
      status: "Terminé",
    },
  ]

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
                <h1 className="text-lg font-bold text-foreground">Mon Profil</h1>
                <p className="text-sm text-muted-foreground">Gestion des informations personnelles</p>
              </div>
            </div>
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
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
                    {user.department}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Depuis le {user.joinDate}
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
                        <span>{user.name}</span>
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
                        <span>{user.email}</span>
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
                        <span>{user.department}</span>
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
                        <span>{user.role}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>ID Employé</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="text-muted-foreground">{user.employeeId}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date d'embauche</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{user.joinDate}</span>
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
                  {recentActivity.map((activity, index) => (
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
