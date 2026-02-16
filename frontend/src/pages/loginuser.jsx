import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setAuthTokens, setUserData } from '../utils/auth';
import { API_BASE_URL } from '../config';
import { Eye, EyeOff } from 'lucide-react';

const LoginUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email est requis';
    if (!formData.password) newErrors.password = 'Mot de passe est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/utilisateurs/login/`, {
        email: (formData.email || '').toLowerCase().trim(),
        password: formData.password,
      });

      // V√©rifier si la r√©ponse contient les donn√©es attendues
      console.log('üì• Full API response:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.tokens && response.data.user) {
        const { tokens, user } = response.data;

        // Save user data
        const { user_id, email: userEmail, nom, departement } = response.data;
        const joinDate =
          response.data?.date_joined ||
          response.data?.date_creation ||
          user?.date_joined ||
          user?.date_creation ||
          '';
        const isAdmin =
          user?.is_admin === true ||
          response.data?.is_admin === true ||
          String(user?.role || response.data?.role || '').toLowerCase() === 'admin';
        
        console.log('üîç User data extracted:', { 
          user_id, 
          userEmail, 
          nom, 
          departement,
          'user.is_admin': user?.is_admin,
          'isAdmin computed': isAdmin
        });
        
        const normalizedUser = {
          id: user_id,
          email: userEmail,
          nom,
          departement,
          is_admin: isAdmin,
          isAdmin: isAdmin,
          date_joined: joinDate,
          date_creation: joinDate,
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        // Stocker les tokens et les donn√©es utilisateur
        setAuthTokens(tokens);
        setUserData({ ...user, isAdmin });

        // Stocker dans localStorage pour une persistance (noms coh√©rents)
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('accessToken', tokens.access); // Pour compatibilit√©
        localStorage.setItem('refreshToken', tokens.refresh); // Pour compatibilit√©
        localStorage.setItem('userName', nom || userEmail);

        console.log('‚úÖ User authenticated:', { isAdmin, email: userEmail });

        // Pour la connexion utilisateur, rediriger toujours vers le dashboard user
        navigate('/dashboarduser');
      } else {
        throw new Error('R√©ponse du serveur invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setLoginError(error.response?.data?.detail || error.response?.data?.message || 'Erreur de connexion. Veuillez r√©essayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-0">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <img
                src="/bc-skills-logo.jpeg"
                alt="BC SKILLS Logo"
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Connexion Utilisateur</h2>
            <p className="mt-2 text-sm text-gray-600">
              Entrez vos identifiants pour acc√©der √† votre espace
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {loginError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="votre@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ïïïïïïïï"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-[38px] flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/reset-password" className="font-medium text-green-600 hover:text-green-500">
                  Mot de passe oublie ?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nouveau sur la plateforme ?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/registeruser"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cr√©er un compte utilisateur
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;












