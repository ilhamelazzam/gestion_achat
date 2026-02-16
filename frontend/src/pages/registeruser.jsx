import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../config';

const RegisterEmploye = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      phone: ''
    }
  });
  
  const [departments] = useState([
    { id: 1, name: 'Achats' },
    { id: 2, name: 'Approvisionnement' },
    { id: 3, name: 'Ventes / Commercial' },
    { id: 4, name: 'Service client / Support' },
    { id: 5, name: 'Marketing' },
    { id: 6, name: 'Comptabilité / Finance' },
    { id: 7, name: 'Contrôle de gestion' },
    { id: 8, name: 'Fiscalité' },
    { id: 9, name: 'Ressources humaines / Paie' },
    { id: 10, name: 'Direction générale' },
    { id: 11, name: 'Stocks / Logistique' },
    { id: 12, name: 'Gestion de projets' },
    { id: 13, name: 'Qualité' },
    { id: 14, name: 'Maintenance' },
    { id: 15, name: 'BI / Reporting' },
  ]);

  const password = watch('password', '');

  const validatePhone = (value) => {
    if (!value) return true; // Optionnel
    if (!/^[0-9]*$/.test(value)) return 'Le numéro ne doit contenir que des chiffres';
    return value.length <= 20 || 'Le numéro ne doit pas dépasser 20 chiffres';
  };

  const validatePasswordMatch = (value) => {
    return value === password || 'Les mots de passe ne correspondent pas';
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      // Pas de CSRF requis pour le backend Node

      // Préparer les données pour l'envoi
      const deptObj = departments.find(d => String(d.id) === String(formData.department));
      const userData = {
        fullName: formData.fullName,
        email: (formData.email || '').toLowerCase().trim(),
        phone: formData.phone ? formData.phone.toString().substring(0, 20) : '',
        department: deptObj ? deptObj.name : '',
        password: formData.password,
      };

      console.log('Données envoyées:', userData);
      
      const response = await fetch(`${API_ENDPOINTS.AUTH.USER.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json().catch(() => ({}));
      console.log('Réponse du serveur:', { status: response.status, data: responseData });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Email déjà utilisé');
        }
        if (response.status === 400) {
          let errorMessage = 'Données invalides\n';
          if (typeof responseData === 'object' && responseData !== null) {
            const errorMessages = [];
            for (const [field, errors] of Object.entries(responseData)) {
              const fieldName = {
                'full_name': 'Nom complet',
                'email': 'Email',
                'password': 'Mot de passe',
                'confirm_password': 'Confirmation du mot de passe',
                'telephone': 'Téléphone',
                'departement': 'Département'
              }[field] || field;
              
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              errorMessages.push(`- ${fieldName}: ${errorText}`);
            }
            errorMessage += errorMessages.join('\n');
          } else if (typeof responseData === 'string') {
            errorMessage += responseData;
          }
          throw new Error(errorMessage);
        }
        throw new Error(responseData.detail || `Erreur lors de l'inscription (${response.status})`);
      }

      // Inscription réussie
      toast.success('Compte utilisateur créé avec succès !');
      
      // Aller directement à la page de connexion
      navigate('/loginuser');
      
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
      toast.error(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-bold text-gray-900">Créer un compte utilisateur</h2>
            <p className="mt-2 text-sm text-gray-600">
              Entrez vos informations pour accéder à l’espace utilisateur
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                type="text"
                id="fullName"
                {...register('fullName', { required: 'Le nom complet est requis' })}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre nom complet"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email professionnel *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide',
                  },
                })}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="prenom.nom@entreprise.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone', {
                  validate: validatePhone,
                  maxLength: {
                    value: 20,
                    message: 'Le numéro ne doit pas dépasser 20 chiffres'
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: 'Le numéro ne doit contenir que des chiffres'
                  }
                })}
                inputMode="numeric"
                pattern="[0-9]*"
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre numéro de téléphone (chiffres uniquement, max 20)"
                disabled={loading}
                maxLength={20}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Département *
              </label>
              <select
                id="department"
                {...register('department', { 
                  required: 'Le département est requis',
                  validate: value => {
                    if (!value) return 'Le département est requis';
                    if (!departments.some(d => d.id === Number(value))) {
                      return 'Le département sélectionné n\'existe pas';
                    }
                    return true;
                  },
                  valueAsNumber: true
                })}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                defaultValue=""
              >
                <option value="" disabled>Sélectionnez un département</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères',
                    },
                  })}
                  className={`block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    validate: (value) =>
                      value === watch('password') || 'Les mots de passe ne correspondent pas',
                  })}
                  className={`block w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/loginuser" className="font-medium text-green-600 hover:text-green-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmploye;
