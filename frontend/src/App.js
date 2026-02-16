import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { isAuthenticated, isAdmin } from './utils/auth';
import LoginAdmin from './pages/loginadmin';
import LoginEmploye from './pages/loginuser';
import RegisterEmploye from './pages/registeruser';
import RegisterAdmin from './pages/registeradmin';
import ResetPasswordUser from './pages/ResetPasswordUser';
import ResetPasswordAdmin from './pages/ResetPasswordAdmin';
import DashboardAdmin from './pages/Dashboardadmin';
import Dashboarduser from './pages/Dashboarduser';
import StockUser from './pages/stock';
import NewDemandeUser from './pages/NewDemandeUser';
import Demandesuser from './pages/demandes';
import Profil from './pages/profil';
import DemandeDetails from './pages/DemandeDetails';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Composant pour vérifier l'authentification
const RequireAuth = ({ children, adminOnly = false }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Rediriger vers la page de connexion appropriée si non connecté
    const loginPath = adminOnly ? "/loginadmin" : "/loginuser";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  if (adminOnly && !isAdmin()) {
    // Rediriger vers le tableau de bord si l'utilisateur n'est pas admin
    return <Navigate to="/dashboarduser" state={{ from: location }} replace />;
  }
  
  return children;
};

// Route user only (redirect admins to their dashboard)
const RequireUser = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/loginuser" state={{ from: location }} replace />;
  }

  return children;
};


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification au chargement de l'application
    // Vous pouvez ajouter une vérification de rafraîchissement de token ici si nécessaire
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Route de connexion */}
          <Route path="/loginuser" element={<LoginEmploye />} />
          
          {/* Route de connexion administrateur */}
          <Route path="/loginadmin" element={<LoginAdmin />} />
          <Route path="/reset-password" element={<ResetPasswordUser />} />
          <Route path="/reset-password-admin" element={<ResetPasswordAdmin />} />
          
          {/* Route d'inscription: accessible même si déjà authentifié */}
          <Route path="/registeruser" element={<RegisterEmploye />} />

          {/* Route d'inscription admin */}
          <Route path="/registeradmin" element={<RegisterAdmin />} />
          
          {/* Routes protégées */}
          <Route path="/dashboarduser" element={
            <RequireUser>
              <Dashboarduser />
            </RequireUser>
          } />
          
          {/* Route admin protégée */}
          <Route path="/Dashboardadmin" element={
            <RequireAuth adminOnly={true}>
              <DashboardAdmin />
            </RequireAuth>
          } />
          
          <Route path="/stock" element={
            <RequireAuth>
              <StockUser />
            </RequireAuth>
          } />
          
          <Route path="/demandes/nouvelle" element={
            <RequireAuth>
              <NewDemandeUser />
            </RequireAuth>
          } />
          
          <Route path="/demandes" element={
            <RequireAuth>
              <Demandesuser />
            </RequireAuth>
          } />

          <Route path="/demande/details/:id" element={
            <RequireAuth>
              <DemandeDetails />
            </RequireAuth>
          } />
          
          <Route path="/profil" element={
            <RequireAuth>
              <Profil />
            </RequireAuth>
          } />
          
          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/loginuser" replace />} />
          
          {/* Route 404 */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page non trouvée</p>
                <Link 
                  to="/" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
