import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { login, register } from '../lib/auth';
import { APP_VERSION } from '../version';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [pressingNom, setPressingNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Inscription
        const result = await register(telephone, password, pressingNom, adresse || null);
        if (result.error) {
          showError(result.error);
        } else if (result.user) {
          setUser(result.user);
          showSuccess('Compte créé !');
          navigate('/');
        }
      } else {
        // Connexion
        const user = await login(telephone, password);
        if (user) {
          setUser(user);
          navigate('/');
        } else {
          showError('Téléphone ou mot de passe incorrect');
        }
      }
    } catch (err) {
      showError('Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👔</div>
          <h1 className="text-2xl font-bold text-gray-900">LabicoProPress</h1>
          <p className="text-gray-500 mt-1">
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du pressing *
                </label>
                <input
                  type="text"
                  value={pressingNom}
                  onChange={(e) => setPressingNom(e.target.value)}
                  placeholder="Ex: Pressing du Centre"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="12 rue de la Gare, 75001 Paris"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              required
              autoComplete="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {isRegister
              ? 'Déjà un compte ? Se connecter'
              : 'Pas de compte ? Créer un compte'}
          </button>
        </div>

        {/* Debug button - discret */}
        {!isRegister && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setTelephone('0160609090');
                setPassword('miracle2024');
              }}
              className="text-gray-300 hover:text-gray-400 text-xs"
            >
              •••
            </button>
          </div>
        )}

        {/* Version */}
        <div className="mt-6 text-center">
          <span className="text-gray-400 text-xs">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
