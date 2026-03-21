import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { envoyerSmsCommandePrete } from '../lib/sms';
import { AvoirModal } from '../components/AvoirModal';
import { ConfirmModal } from '../components/ConfirmModal';

const STATUTS = {
  en_cours: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  pret: { label: 'Prêt', color: 'bg-green-100 text-green-800' },
  recupere: { label: 'Récupéré', color: 'bg-gray-100 text-gray-800' },
};

export function Commandes() {
  const { pressing } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [searchParams] = useSearchParams();
  const filterStatut = searchParams.get('statut');

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterStatut || 'all');
  const [expandedCommandeId, setExpandedCommandeId] = useState(null);

  // Modal avoir
  const [avoirModalOpen, setAvoirModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [avoirLoading, setAvoirLoading] = useState(false);

  // Modal confirmation annulation avoir
  const [confirmAnnulerOpen, setConfirmAnnulerOpen] = useState(false);
  const [commandeAnnuler, setCommandeAnnuler] = useState(null);

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
        .select('*, clients(nom, telephone, solde_avoir), lignes_commande(*), avoirs(*)')
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
        .update({
          statut: 'pret',
          date_pret: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commande.id);

      if (error) throw error;

      // Envoyer le SMS
      const smsResult = await envoyerSmsCommandePrete(commande, pressing);

      if (smsResult.success) {
        showSuccess('Commande prête ! SMS envoyé');
      } else {
        showSuccess('Commande prête ! (SMS non envoyé)');
      }

      // Basculer vers l'onglet "Prêt" et garder la commande ouverte
      setActiveFilter('pret');
      setExpandedCommandeId(commande.id);
      loadCommandes();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  async function marquerRecupere(commande) {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({
          statut: 'recupere',
          date_recupere: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commande.id);

      if (error) throw error;

      showSuccess('Commande récupérée');

      // Basculer vers l'onglet "Récupéré" et garder la commande ouverte
      setActiveFilter('recupere');
      setExpandedCommandeId(commande.id);
      loadCommandes();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  function ouvrirAvoirModal(commande) {
    setSelectedCommande(commande);
    setAvoirModalOpen(true);
  }

  async function creerAvoir({ montant, motif, notes }) {
    if (!selectedCommande) return;

    setAvoirLoading(true);
    try {
      // 1. Creer l'avoir
      const { error: avoirError } = await supabase
        .from('avoirs')
        .insert({
          pressing_id: pressing.id,
          client_id: selectedCommande.client_id,
          commande_id: selectedCommande.id,
          montant,
          motif,
          type: 'credit',
          notes,
        });

      if (avoirError) throw avoirError;

      // 2. Mettre a jour le solde du client
      const { error: clientError } = await supabase.rpc('increment_solde_avoir', {
        p_client_id: selectedCommande.client_id,
        p_montant: montant
      });

      // Si la fonction RPC n'existe pas, on fait un update manuel
      if (clientError) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('solde_avoir')
          .eq('id', selectedCommande.client_id)
          .single();

        const nouveauSolde = (parseFloat(clientData?.solde_avoir) || 0) + montant;

        await supabase
          .from('clients')
          .update({ solde_avoir: nouveauSolde })
          .eq('id', selectedCommande.client_id);
      }

      showSuccess(`Avoir de ${montant.toFixed(2)} EUR accordé`);
      setAvoirModalOpen(false);
      setSelectedCommande(null);
      loadCommandes();
    } catch (err) {
      console.error('Erreur creation avoir:', err);
      showError('Erreur lors de la création de l\'avoir');
    } finally {
      setAvoirLoading(false);
    }
  }

  function ouvrirConfirmAnnuler(commande) {
    setCommandeAnnuler(commande);
    setConfirmAnnulerOpen(true);
  }

  async function confirmerAnnulerAvoir() {
    if (!commandeAnnuler) return;

    const avoirActif = commandeAnnuler.avoirs?.find(a => a.type === 'credit' && !a.annule_at);
    if (!avoirActif) return;

    try {
      // 1. Marquer l'avoir comme annulé
      const { error: avoirError } = await supabase
        .from('avoirs')
        .update({ annule_at: new Date().toISOString() })
        .eq('id', avoirActif.id);

      if (avoirError) throw avoirError;

      // 2. Soustraire du solde du client
      const { data: clientData } = await supabase
        .from('clients')
        .select('solde_avoir')
        .eq('id', commandeAnnuler.client_id)
        .single();

      const nouveauSolde = Math.max(0, (parseFloat(clientData?.solde_avoir) || 0) - parseFloat(avoirActif.montant));

      await supabase
        .from('clients')
        .update({ solde_avoir: nouveauSolde })
        .eq('id', commandeAnnuler.client_id);

      showSuccess('Avoir annulé');
      setCommandeAnnuler(null);
      loadCommandes();
    } catch (err) {
      console.error('Erreur annulation avoir:', err);
      showError('Erreur lors de l\'annulation');
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
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Commandes</h2>
          <button
            onClick={() => { setLoading(true); loadCommandes(); }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
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
              isExpanded={expandedCommandeId === commande.id}
              onToggleExpand={() => setExpandedCommandeId(expandedCommandeId === commande.id ? null : commande.id)}
              onMarquerPret={() => marquerPret(commande)}
              onMarquerRecupere={() => marquerRecupere(commande)}
              onAccorderAvoir={() => ouvrirAvoirModal(commande)}
              onAnnulerAvoir={() => ouvrirConfirmAnnuler(commande)}
            />
          ))}
        </div>
      )}

      {/* Modal Avoir */}
      <AvoirModal
        isOpen={avoirModalOpen}
        onClose={() => { setAvoirModalOpen(false); setSelectedCommande(null); }}
        onSubmit={creerAvoir}
        clientNom={selectedCommande?.clients?.nom}
        montantTotal={selectedCommande?.montant_total}
        loading={avoirLoading}
      />

      {/* Modal Confirmation Annulation */}
      <ConfirmModal
        isOpen={confirmAnnulerOpen}
        onClose={() => { setConfirmAnnulerOpen(false); setCommandeAnnuler(null); }}
        onConfirm={confirmerAnnulerAvoir}
        title="Annuler l'avoir"
        message={`Voulez-vous vraiment annuler l'avoir de ${commandeAnnuler?.avoirs?.find(a => a.type === 'credit' && !a.annule_at)?.montant ? parseFloat(commandeAnnuler.avoirs.find(a => a.type === 'credit' && !a.annule_at).montant).toFixed(2) : '0.00'} EUR ?`}
        confirmText="Annuler l'avoir"
        cancelText="Non"
        variant="danger"
      />
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

function CommandeCard({ commande, isExpanded, onToggleExpand, onMarquerPret, onMarquerRecupere, onAccorderAvoir, onAnnulerAvoir }) {
  const statut = STATUTS[commande.statut];

  // Avoir actif (type=credit et non annulé)
  const avoirActif = commande.avoirs?.find(a => a.type === 'credit' && !a.annule_at);
  // Dernier avoir annulé
  const avoirAnnule = commande.avoirs?.find(a => a.type === 'credit' && a.annule_at);

  // Formatage des dates
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const dateCreation = formatDate(commande.created_at);
  const datePret = formatDate(commande.date_pret);
  const dateRecupere = formatDate(commande.date_recupere);

  // Calcul du temps écoulé
  const getTempsEcoule = () => {
    const now = new Date();
    const created = new Date(commande.created_at);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}j`;
    if (diffHours > 0) return `${diffHours}h`;
    return 'Maintenant';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header cliquable - Accordéon */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Avatar client */}
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
            {commande.clients?.nom ? commande.clients.nom.charAt(0).toUpperCase() : '?'}
          </div>

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{commande.numero}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statut.color}`}>
                {statut.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{commande.clients?.nom || commande.clients?.telephone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{commande.nb_vetements} article{commande.nb_vetements > 1 ? 's' : ''}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">{getTempsEcoule()}</span>
              {parseFloat(commande.montant_total) > 0 && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs font-semibold text-primary-600">{parseFloat(commande.montant_total).toFixed(2)} EUR</span>
                </>
              )}
            </div>
          </div>

          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Contenu accordéon */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Timeline */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-start">
              {/* Étape 1: Créée */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs font-medium text-gray-700">Créée</p>
                  <p className="text-xs text-gray-500">{dateCreation}</p>
                </div>
              </div>

              {/* Ligne de connexion */}
              <div className={`flex-1 h-1 mt-4 mx-2 rounded ${commande.date_pret ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              {/* Étape 2: Prête */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${commande.date_pret ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center mt-1">
                  <p className={`text-xs font-medium ${commande.date_pret ? 'text-gray-700' : 'text-gray-400'}`}>Prête</p>
                  <p className="text-xs text-gray-500">{datePret || '—'}</p>
                </div>
              </div>

              {/* Ligne de connexion */}
              <div className={`flex-1 h-1 mt-4 mx-2 rounded ${commande.date_recupere ? 'bg-purple-500' : 'bg-gray-300'}`}></div>

              {/* Étape 3: Récupérée */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${commande.date_recupere ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="text-center mt-1">
                  <p className={`text-xs font-medium ${commande.date_recupere ? 'text-gray-700' : 'text-gray-400'}`}>Récupérée</p>
                  <p className="text-xs text-gray-500">{dateRecupere || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="p-4 space-y-3">
            {/* Client */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{commande.clients?.nom || 'Sans nom'}</p>
                <p className="text-sm text-gray-500">{commande.clients?.telephone}</p>
              </div>
              {parseFloat(commande.clients?.solde_avoir) > 0 && (
                <div className="bg-orange-100 px-3 py-1 rounded-full">
                  <p className="text-xs font-medium text-orange-700">
                    Avoir: {parseFloat(commande.clients.solde_avoir).toFixed(2)} EUR
                  </p>
                </div>
              )}
            </div>

            {/* Montant total */}
            {parseFloat(commande.montant_total) > 0 && (
              <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
                <p className="text-xs text-white/80 font-medium">Montant total</p>
                <p className="text-2xl font-bold">{parseFloat(commande.montant_total).toFixed(2)} EUR</p>
              </div>
            )}

            {/* Détail des articles */}
            {commande.lignes_commande && commande.lignes_commande.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-2 bg-gray-50 border-b flex items-center gap-2">
                  <span className="text-sm">📦</span>
                  <span className="text-xs font-medium text-gray-700">Détail des articles</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {commande.lignes_commande.map((ligne) => (
                    <div key={ligne.id} className="p-2 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{ligne.article_nom}</p>
                        <p className="text-xs text-gray-500">{parseFloat(ligne.prix_unitaire).toFixed(2)} EUR x {ligne.quantite}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 ml-2">
                        {parseFloat(ligne.sous_total).toFixed(2)} EUR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {commande.notes && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-xs text-yellow-600 font-medium mb-1">Notes</p>
                <p className="text-sm text-yellow-800">{commande.notes}</p>
              </div>
            )}
          </div>

          {/* Actions selon statut */}
          {commande.statut === 'en_cours' && (
            <div className="p-3 pt-0">
              <button
                onClick={(e) => { e.stopPropagation(); onMarquerPret(); }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Prêt + SMS
              </button>
            </div>
          )}

          {commande.statut === 'pret' && (
            <div className="p-3 pt-0">
              <button
                onClick={(e) => { e.stopPropagation(); onMarquerRecupere(); }}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Récupéré
              </button>
            </div>
          )}

          {/* Section Avoir */}
          <div className="p-3 pt-0 border-t border-gray-100 mt-2 space-y-2">
            {/* Affichage avoir actif */}
            {avoirActif && (
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-700">Avoir accordé</span>
                  <span className="text-sm font-semibold text-orange-700">{parseFloat(avoirActif.montant).toFixed(2)} EUR</span>
                </div>
                <p className="text-xs text-orange-600 mt-0.5">{formatDate(avoirActif.created_at)}</p>
              </div>
            )}

            {/* Affichage avoir annulé (si pas d'avoir actif) */}
            {!avoirActif && avoirAnnule && (
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 line-through">Avoir annulé</span>
                  <span className="text-sm font-semibold text-gray-400 line-through">{parseFloat(avoirAnnule.montant).toFixed(2)} EUR</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Annulé le {formatDate(avoirAnnule.annule_at)}</p>
              </div>
            )}

            {/* Bouton Annuler avoir OU Accorder avoir */}
            {avoirActif ? (
              <button
                onClick={(e) => { e.stopPropagation(); onAnnulerAvoir(); }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler avoir
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAccorderAvoir(); }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Avoir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
