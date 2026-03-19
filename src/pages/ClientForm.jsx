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
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  async function loadClient() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTelephone(data.telephone);
      setNom(data.nom || '');
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
    </div>
  );
}
