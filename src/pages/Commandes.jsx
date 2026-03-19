import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { envoyerSMS, genererMessagePret } from '../lib/sms';

const STATUTS = {
  en_cours: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  pret: { label: 'Prêt', color: 'bg-green-100 text-green-800' },
  recupere: { label: 'Récupéré', color: 'bg-gray-100 text-gray-800' },
};

export function Commandes() {
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterStatut = searchParams.get('statut');

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterStatut || 'all');

  useEffect(() => {
    if (pressing?.id) {
      loadCommandes();
    }
  }, [pressing?.id]);

  useEffect(() => {
    if (filterStatut) {
      setActiveFilter(filterStatut);
    }
  }, [filterStatut]);

  async function loadCommandes() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*, clients(nom, telephone)')
        .eq('pressing_id', pressing.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommandes(data || []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      showError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }

  async function marquerPret(commande) {
    try {
      // Mettre à jour le statut
      const { error } = await supabase
        .from('commandes')
        .update({ statut: 'pret', updated_at: new Date().toISOString() })
        .eq('id', commande.id);

      if (error) throw error;

      // Envoyer le SMS
      const message = genererMessagePret(commande.numero, pressing.nom);
      const smsResult = await envoyerSMS(
        commande.clients.telephone,
        message,
        commande.id,
        pressing.id
      );

      if (smsResult.success) {
        showSuccess('Commande prête ! SMS envoyé');
      } else {
        showSuccess('Commande prête ! (SMS non envoyé)');
      }

      loadCommandes();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  async function marquerRecupere(commandeId) {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: 'recupere', updated_at: new Date().toISOString() })
        .eq('id', commandeId);

      if (error) throw error;

      showSuccess('Commande récupérée');
      loadCommandes();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  // Filtrer les commandes
  const filteredCommandes = commandes.filter((cmd) => {
    // Filtre par statut
    if (activeFilter !== 'all' && cmd.statut !== activeFilter) {
      return false;
    }

    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        cmd.numero.toLowerCase().includes(searchLower) ||
        cmd.clients?.nom?.toLowerCase().includes(searchLower) ||
        cmd.clients?.telephone?.includes(search)
      );
    }

    return true;
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
        <h2 className="text-xl font-bold text-gray-900">Commandes</h2>
        <Link
          to="/commandes/nouvelle"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Nouvelle
        </Link>
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          Toutes
        </FilterButton>
        <FilterButton
          active={activeFilter === 'en_cours'}
          onClick={() => setActiveFilter('en_cours')}
        >
          En cours
        </FilterButton>
        <FilterButton
          active={activeFilter === 'pret'}
          onClick={() => setActiveFilter('pret')}
        >
          Prêtes
        </FilterButton>
        <FilterButton
          active={activeFilter === 'recupere'}
          onClick={() => setActiveFilter('recupere')}
        >
          Récupérées
        </FilterButton>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une commande..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* Liste des commandes */}
      {filteredCommandes.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">📋</span>
          <p className="text-gray-500 mt-2">Aucune commande</p>
          <Link
            to="/commandes/nouvelle"
            className="inline-block mt-4 text-primary-600 font-medium"
          >
            Créer une commande
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCommandes.map((commande) => (
            <CommandeCard
              key={commande.id}
              commande={commande}
              onMarquerPret={() => marquerPret(commande)}
              onMarquerRecupere={() => marquerRecupere(commande.id)}
              onClick={() => navigate(`/commandes/${commande.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function CommandeCard({ commande, onMarquerPret, onMarquerRecupere, onClick }) {
  const statut = STATUTS[commande.statut];
  const date = new Date(commande.created_at).toLocaleDateString('fr-FR');

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">{commande.numero}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.color}`}>
            {statut.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {commande.clients?.nom || commande.clients?.telephone}
          </span>
          <span className="text-gray-400">{date}</span>
        </div>
        {commande.nb_vetements > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {commande.nb_vetements} vêtements
          </p>
        )}
      </button>

      {/* Actions */}
      {commande.statut !== 'recupere' && (
        <div className="border-t border-gray-100 p-2 flex gap-2">
          {commande.statut === 'en_cours' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarquerPret();
              }}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              ✓ Marquer prêt + SMS
            </button>
          )}
          {commande.statut === 'pret' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarquerRecupere();
              }}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              📦 Récupéré
            </button>
          )}
        </div>
      )}
    </div>
  );
}
