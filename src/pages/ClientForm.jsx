import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function ClientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [telephone, setTelephone] = useState('');
  const [nom, setNom] = useState('');
  const [soldeAvoir, setSoldeAvoir] = useState(0);
  const [avoirs, setAvoirs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  async function loadClient() {
    try {
      // Charger le client
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTelephone(data.telephone);
      setNom(data.nom || '');
      setSoldeAvoir(parseFloat(data.solde_avoir) || 0);

      // Charger l'historique des avoirs
      const { data: avoirsData } = await supabase
        .from('avoirs')
        .select('*, commandes(numero)')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      setAvoirs(avoirsData || []);
    } catch (err) {
      console.error('Erreur chargement client:', err);
      showError('Client non trouvé');
      navigate('/clients');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pressing?.id) return;

    setLoading(true);

    try {
      if (isEdit) {
        // Mise à jour
        const { error } = await supabase
          .from('clients')
          .update({ telephone, nom: nom || null })
          .eq('id', id);

        if (error) throw error;
        showSuccess('Client modifié');
      } else {
        // Création
        const { error } = await supabase
          .from('clients')
          .insert({
            pressing_id: pressing.id,
            telephone,
            nom: nom || null,
          });

        if (error) {
          if (error.code === '23505') {
            showError('Ce numéro de téléphone existe déjà');
            setLoading(false);
            return;
          }
          throw error;
        }
        showSuccess('Client ajouté');
      }

      navigate('/clients');
    } catch (err) {
      console.error('Erreur sauvegarde client:', err);
      showError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Modifier client' : 'Nouveau client'}
        </h2>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 12 34 56 78"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom (optionnel)
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du client"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </button>
      </form>

      {/* Section Avoir - seulement en mode edition */}
      {isEdit && (
        <div className="mt-8 space-y-4">
          {/* Solde avoir */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white/80 text-sm">Solde avoir</p>
                <p className="text-2xl font-bold">{soldeAvoir.toFixed(2)} EUR</p>
              </div>
            </div>
          </div>

          {/* Historique des avoirs */}
          {avoirs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Historique des avoirs</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {avoirs.map((avoir) => (
                  <div key={avoir.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${avoir.type === 'credit' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium text-gray-900 capitalize">
                          {avoir.motif?.replace('_', ' ') || 'Avoir'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(avoir.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                        {avoir.commandes?.numero && ` - Cmd ${avoir.commandes.numero}`}
                      </p>
                      {avoir.notes && (
                        <p className="text-xs text-gray-400 mt-1">{avoir.notes}</p>
                      )}
                    </div>
                    <span className={`font-bold ${avoir.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {avoir.type === 'credit' ? '+' : '-'}{parseFloat(avoir.montant).toFixed(2)} EUR
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
