import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';
import { getToken } from '../utils/auth';

const ProtectedRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setIsLoading(false);
        navigate('/login', { 
          state: { error: 'Veuillez vous connecter pour accéder à cette page' } 
        });
        return;
      }

      try {
        // Vérifier si le token est valide en effectuant une requête protégée
        const response = await fetch(API_ENDPOINTS.ADMIN.BASE, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          throw new Error('Session expirée');
        }

        if (!response.ok) {
          throw new Error('Erreur de vérification des autorisations');
        }

        // Si on arrive ici, l'utilisateur est authentifié et autorisé
        setIsAuthorized(true);
      } catch (error) {
        console.error('Erreur de vérification:', error);
        navigate('/login', { 
          state: { error: 'Session expirée ou accès refusé. Veuillez vous reconnecter.' } 
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est autorisé, afficher le contenu de la route
  return <Outlet />;
};

export default ProtectedRoute;
