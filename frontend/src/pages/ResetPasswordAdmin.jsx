import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"

const ResetPasswordAdmin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState("request")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Adresse email requise")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/reset-admin-password/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : null

      if (!response.ok) {
        const message = data?.detail || (data?.email && data.email[0]) || "Erreur lors de l'envoi"
        throw new Error(message)
      }

      setSuccess("Code envoye. Verifiez votre email.")
      setStep("confirm")
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !code || !password || !confirmPassword) {
      setError("Tous les champs sont requis")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/reset-admin-password/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: code.trim(),
          password,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : null

      if (!response.ok) {
        const message = data?.detail || (data?.email && data.email[0]) || "Erreur lors de la reinitialisation"
        throw new Error(message)
      }

      setSuccess("Mot de passe admin mis a jour. Vous pouvez vous connecter.")
      setTimeout(() => navigate("/loginadmin"), 1500)
    } catch (err) {
      setError(err.message || "Erreur lors de la reinitialisation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-0">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4">
              <img
                src="/bc-skills-logo.jpeg"
                alt="BC SKILLS Logo"
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reinitialiser mot de passe admin</h2>
            <p className="mt-2 text-sm text-gray-600">Espace administration</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
              {success}
            </div>
          )}

          {step === "request" ? (
            <form className="space-y-4" onSubmit={handleRequestCode}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="admin@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le code"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleConfirm}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="admin@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code recu
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="123456"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="********"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="********"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Mise a jour..." : "Mettre a jour"}
                </button>

                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={isLoading}
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/loginadmin" className="text-sm text-blue-600 hover:text-blue-500">
              Retour a la connexion admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordAdmin
