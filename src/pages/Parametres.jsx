import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function Parametres() {
  const { pressing, logout } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [modeEtiquetageDefaut, setModeEtiquetageDefaut] = useState('individuel');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pressing) {
      setNom(pressing.nom || '');
      setTelephone(pressing.telephone || '');
      setAdresse(pressing.adresse || '');
      setModeEtiquetageDefaut(pressing.mode_etiquetage_defaut || 'individuel');
    }
  }, [pressing]);

  async function handleSave() {
    if (!pressing?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pressings')
        .update({
          nom,
          telephone: telephone || null,
          adresse: adresse || null,
          mode_etiquetage_defaut: modeEtiquetageDefaut,
        })
        .eq('id', pressing.id);

      if (error) throw error;
      showSuccess('Paramètres enregistrés');
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>

      {/* Infos pressing */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Informations du pressing</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du pressing
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="01 23 45 67 89"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <textarea
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse complète"
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      </div>

      {/* Préférences */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Préférences</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode d'étiquetage par défaut
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['individuel', 'filet', 'mixte'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeEtiquetageDefaut(mode)}
                className={`py-3 px-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  modeEtiquetageDefaut === mode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>

      {/* Info SMS */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Configuration SMS</h3>
        <p className="text-sm text-gray-600">
          Les notifications SMS sont configurées via l'API smsmode.
          Contactez le support pour modifier vos paramètres SMS.
        </p>
      </div>

      {/* Déconnexion */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          Se déconnecter
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-gray-400">
        LabicoProPress v1.0.0
      </p>
    </div>
  );
}
