import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export function Clients() {
  const { pressing } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (pressing?.id) {
      loadClients();
    }
  }, [pressing?.id]);

  async function loadClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*, commandes(count)')
        .eq('pressing_id', pressing.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
      showError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }

  // Filtrer les clients par recherche
  const filteredClients = clients.filter((client) => {
    const searchLower = search.toLowerCase();
    return (
      client.telephone.includes(search) ||
      (client.nom && client.nom.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <button
            onClick={() => { setLoading(true); loadClients(); }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <Link
          to="/clients/nouveau"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Nouveau
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou téléphone..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* Liste des clients */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">👥</span>
          <p className="text-gray-500 mt-2">
            {search ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </p>
          {!search && (
            <Link
              to="/clients/nouveau"
              className="inline-block mt-4 text-primary-600 font-medium"
            >
              Ajouter votre premier client
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => navigate(`/clients/${client.id}`)}
              className="w-full bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                {client.nom ? client.nom.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {client.nom || 'Sans nom'}
                </p>
                <p className="text-sm text-gray-500">{client.telephone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Créé le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  {client.updated_at && client.updated_at !== client.created_at && (
                    <span> • Modifié le {new Date(client.updated_at).toLocaleDateString('fr-FR')}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                {parseFloat(client.solde_avoir) > 0 && (
                  <p className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-1">
                    {parseFloat(client.solde_avoir).toFixed(2)} EUR
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {client.commandes?.[0]?.count || 0} commandes
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
