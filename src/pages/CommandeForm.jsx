import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function CommandeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [nbVetements, setNbVetements] = useState(1);
  const [modeEtiquetage, setModeEtiquetage] = useState('individuel');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchClient, setSearchClient] = useState('');

  useEffect(() => {
    if (pressing?.id) {
      loadClients();
      if (isEdit) {
        loadCommande();
      } else {
        setLoadingData(false);
      }
    }
  }, [pressing?.id, id]);

  async function loadClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('pressing_id', pressing.id)
        .order('nom');

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    }
  }

  async function loadCommande() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSelectedClientId(data.client_id);
      setNbVetements(data.nb_vetements);
      setModeEtiquetage(data.mode_etiquetage);
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      showError('Commande non trouvée');
      navigate('/commandes');
    } finally {
      setLoadingData(false);
    }
  }

  async function genererNumero() {
    const annee = new Date().getFullYear();

    // Compter les commandes de l'année
    const { count } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .eq('pressing_id', pressing.id)
      .gte('created_at', `${annee}-01-01`);

    const numero = String((count || 0) + 1).padStart(4, '0');
    return `${annee}-${numero}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pressing?.id || !selectedClientId) return;

    setLoading(true);

    try {
      if (isEdit) {
        // Mise à jour
        const { error } = await supabase
          .from('commandes')
          .update({
            client_id: selectedClientId,
            nb_vetements: nbVetements,
            mode_etiquetage: modeEtiquetage,
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        showSuccess('Commande modifiée');
      } else {
        // Création
        const numero = await genererNumero();

        const { data, error } = await supabase
          .from('commandes')
          .insert({
            pressing_id: pressing.id,
            client_id: selectedClientId,
            numero,
            nb_vetements: nbVetements,
            mode_etiquetage: modeEtiquetage,
            notes: notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        showSuccess(`Commande ${numero} créée`);

        // Rediriger vers le détail pour impression étiquette
        navigate(`/commandes/${data.id}`);
        return;
      }

      navigate('/commandes');
    } catch (err) {
      console.error('Erreur sauvegarde commande:', err);
      showError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }

  // Filtrer les clients
  const filteredClients = clients.filter((client) => {
    if (!searchClient) return true;
    const search = searchClient.toLowerCase();
    return (
      client.telephone.includes(searchClient) ||
      (client.nom && client.nom.toLowerCase().includes(search))
    );
  });

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
          onClick={() => navigate('/commandes')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Modifier commande' : 'Nouvelle commande'}
        </h2>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <input
            type="text"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-2"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Aucun client trouvé</p>
                <button
                  type="button"
                  onClick={() => navigate('/clients/nouveau')}
                  className="text-primary-600 font-medium mt-1"
                >
                  + Ajouter un client
                </button>
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedClientId === client.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium">{client.nom || 'Sans nom'}</p>
                  <p className="text-sm text-gray-500">{client.telephone}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Nombre de vêtements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de vêtements
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNbVetements(Math.max(1, nbVetements - 1))}
              className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-semibold w-12 text-center">
              {nbVetements}
            </span>
            <button
              type="button"
              onClick={() => setNbVetements(nbVetements + 1)}
              className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Mode d'étiquetage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode d'étiquetage
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['individuel', 'filet', 'mixte'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeEtiquetage(mode)}
                className={`py-3 px-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  modeEtiquetage === mode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions particulières..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedClientId}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? 'Enregistrement...'
            : isEdit
            ? 'Modifier'
            : 'Créer la commande'}
        </button>
      </form>
    </div>
  );
}
