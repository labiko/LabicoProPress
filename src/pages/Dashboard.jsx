import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { pressing } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    commandesEnCours: 0,
    commandesPret: 0,
    caAujourdHui: 0,
    totalClients: 0,
    caMois: 0,
    caTotal: 0,
  });
  const [ca7Jours, setCa7Jours] = useState([]);
  const [dernieresCommandes, setDernieresCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = semaine actuelle, -1 = semaine passée, etc.
  const [loadingHistogram, setLoadingHistogram] = useState(false);

  useEffect(() => {
    if (pressing?.id) {
      loadStats();
    }
  }, [pressing?.id]);

  // Recharger l'histogramme quand weekOffset change
  useEffect(() => {
    if (pressing?.id && !loading) {
      loadHistogramData(weekOffset);
    }
  }, [weekOffset]);

  async function loadStats() {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Premier jour du mois en cours
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0];

      // Calculer les 7 derniers jours + 7 jours semaine passée
      const last7Days = [];
      const previous7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);

        // Même jour semaine passée
        const datePrev = new Date(today);
        datePrev.setDate(datePrev.getDate() - i - 7);
        previous7Days.push(datePrev.toISOString().split('T')[0]);
      }

      // Requêtes en parallèle
      const [
        enCoursRes,
        pretRes,
        clientsRes,
        commandesRes,
        dernieresRes,
        caMoisRes,
        caTotalRes
      ] = await Promise.all([
        // Commandes en cours
        supabase
          .from('commandes')
          .select('*', { count: 'exact', head: true })
          .eq('pressing_id', pressing.id)
          .eq('statut', 'en_cours'),
        // Commandes prêtes
        supabase
          .from('commandes')
          .select('*', { count: 'exact', head: true })
          .eq('pressing_id', pressing.id)
          .eq('statut', 'pret'),
        // Total clients
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('pressing_id', pressing.id),
        // Commandes des 14 derniers jours (pour CA semaine + semaine passée)
        supabase
          .from('commandes')
          .select('montant_total, created_at')
          .eq('pressing_id', pressing.id)
          .gte('created_at', previous7Days[0]),
        // 5 dernières commandes
        supabase
          .from('commandes')
          .select('*, clients(nom, telephone)')
          .eq('pressing_id', pressing.id)
          .order('created_at', { ascending: false })
          .limit(5),
        // CA du mois en cours
        supabase
          .from('commandes')
          .select('montant_total')
          .eq('pressing_id', pressing.id)
          .gte('created_at', firstDayOfMonthStr),
        // CA total (toutes les commandes)
        supabase
          .from('commandes')
          .select('montant_total')
          .eq('pressing_id', pressing.id)
      ]);

      // Calculer CA par jour (cette semaine + semaine passée)
      const caParJour = last7Days.map((dateStr, index) => {
        // CA cette semaine
        const commandesJour = (commandesRes.data || []).filter(cmd => {
          const cmdDate = cmd.created_at.split('T')[0];
          return cmdDate === dateStr;
        });
        const total = commandesJour.reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

        // CA semaine passée (même jour)
        const datePrevStr = previous7Days[index];
        const commandesPrev = (commandesRes.data || []).filter(cmd => {
          const cmdDate = cmd.created_at.split('T')[0];
          return cmdDate === datePrevStr;
        });
        const totalPrev = commandesPrev.reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

        const date = new Date(dateStr);
        const jourNom = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
        const dateFormatee = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return {
          date: dateStr,
          jour: jourNom.charAt(0).toUpperCase() + jourNom.slice(1),
          dateAffichee: dateFormatee,
          montant: total,
          montantPrev: totalPrev,
          isToday: dateStr === todayStr
        };
      });

      // CA aujourd'hui
      const caToday = caParJour.find(j => j.isToday)?.montant || 0;

      // Calculer CA du mois
      const caMois = (caMoisRes.data || []).reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

      // Calculer CA total
      const caTotal = (caTotalRes.data || []).reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

      setStats({
        commandesEnCours: enCoursRes.count || 0,
        commandesPret: pretRes.count || 0,
        caAujourdHui: caToday,
        totalClients: clientsRes.count || 0,
        caMois,
        caTotal,
      });

      setCa7Jours(caParJour);
      setDernieresCommandes(dernieresRes.data || []);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  }

  // Charger uniquement les données de l'histogramme (pour navigation entre semaines)
  async function loadHistogramData(offset) {
    setLoadingHistogram(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Calculer les 7 jours de la semaine sélectionnée
      const selected7Days = [];
      const previous7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i + (offset * 7));
        selected7Days.push(date.toISOString().split('T')[0]);

        // Même jour semaine passée (par rapport à la semaine sélectionnée)
        const datePrev = new Date(today);
        datePrev.setDate(datePrev.getDate() - i + (offset * 7) - 7);
        previous7Days.push(datePrev.toISOString().split('T')[0]);
      }

      // Récupérer les commandes de la période
      const { data: commandesData } = await supabase
        .from('commandes')
        .select('montant_total, created_at')
        .eq('pressing_id', pressing.id)
        .gte('created_at', previous7Days[0])
        .lte('created_at', selected7Days[6] + 'T23:59:59');

      // Calculer CA par jour
      const caParJour = selected7Days.map((dateStr, index) => {
        const commandesJour = (commandesData || []).filter(cmd => {
          const cmdDate = cmd.created_at.split('T')[0];
          return cmdDate === dateStr;
        });
        const total = commandesJour.reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

        const datePrevStr = previous7Days[index];
        const commandesPrev = (commandesData || []).filter(cmd => {
          const cmdDate = cmd.created_at.split('T')[0];
          return cmdDate === datePrevStr;
        });
        const totalPrev = commandesPrev.reduce((sum, cmd) => sum + parseFloat(cmd.montant_total || 0), 0);

        const date = new Date(dateStr);
        const jourNom = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
        const dateFormatee = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return {
          date: dateStr,
          jour: jourNom.charAt(0).toUpperCase() + jourNom.slice(1),
          dateAffichee: dateFormatee,
          montant: total,
          montantPrev: totalPrev,
          isToday: dateStr === todayStr
        };
      });

      setCa7Jours(caParJour);
    } catch (err) {
      console.error('Erreur chargement histogramme:', err);
    } finally {
      setLoadingHistogram(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  async function handleRefresh() {
    setLoading(true);
    await loadStats();
  }

  // Calculer le max pour l'échelle de l'histogramme
  const maxCA = Math.max(...ca7Jours.map(j => j.montant), 1);
  const totalSemaine = ca7Jours.reduce((sum, j) => sum + j.montant, 0);

  // Fonction pour obtenir la couleur du statut
  function getStatutBadge(statut) {
    switch (statut) {
      case 'en_cours':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En cours' };
      case 'pret':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Prêt' };
      case 'livre':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Livré' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: statut };
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Titre de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bonjour !</h2>
          <p className="text-gray-600">Voici le résumé de votre activité</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualiser"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Cartes statistiques - 6 cartes */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="⏳"
          label="En cours"
          value={stats.commandesEnCours}
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          icon="✅"
          label="Prêtes"
          value={stats.commandesPret}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          icon="💰"
          label="CA Aujourd'hui"
          value={`${stats.caAujourdHui.toFixed(0)} €`}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon="📅"
          label="CA Mois"
          value={`${stats.caMois.toFixed(0)} €`}
          color="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          icon="📊"
          label="CA Total"
          value={`${stats.caTotal.toFixed(0)} €`}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon="👥"
          label="Clients"
          value={stats.totalClients}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Histogramme CA 7 jours avec navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Chiffre d'affaires</h3>
            <span className="text-sm font-bold text-primary-600">({totalSemaine.toFixed(2)} €)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Semaine précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setWeekOffset(prev => Math.min(prev + 1, 0))}
              disabled={weekOffset >= 0}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Semaine suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        {/* Période affichée */}
        <p className="text-xs text-gray-500 mb-3">
          {ca7Jours.length > 0 && (
            <>
              {ca7Jours[0]?.dateAffichee} - {ca7Jours[6]?.dateAffichee}
              {weekOffset === 0 && <span className="ml-1 text-primary-600">(Cette semaine)</span>}
              {weekOffset === -1 && <span className="ml-1 text-gray-400">(Semaine dernière)</span>}
              {weekOffset < -1 && <span className="ml-1 text-gray-400">(Il y a {Math.abs(weekOffset)} semaines)</span>}
            </>
          )}
        </p>

        <div className={`flex items-end justify-between gap-2 h-40 ${loadingHistogram ? 'opacity-50' : ''}`}>
          {ca7Jours.map((jour, index) => {
            const height = maxCA > 0 ? (jour.montant / maxCA) * 100 : 0;
            const diff = jour.montant - jour.montantPrev;
            const isGain = diff > 0;
            const isLoss = diff < 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Montant au-dessus avec indicateur gain/perte */}
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-500 font-medium">
                    {jour.montant > 0 ? `${jour.montant.toFixed(0)}€` : ''}
                  </span>
                  {jour.montant > 0 && jour.montantPrev > 0 && (
                    <span className={`text-[10px] font-bold ${isGain ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-400'}`}>
                      {isGain ? '↑' : isLoss ? '↓' : '='}
                    </span>
                  )}
                </div>
                {/* Barre */}
                <div className="w-full flex flex-col justify-end h-24">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      jour.isToday
                        ? 'bg-gradient-to-t from-primary-600 to-primary-400'
                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                    }`}
                    style={{ height: `${Math.max(height, jour.montant > 0 ? 8 : 2)}%` }}
                  />
                </div>
                {/* Jour + Date + CA semaine passée */}
                <div className="text-center">
                  <span className={`text-xs font-medium block ${jour.isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                    {jour.jour}
                  </span>
                  <span className={`text-[10px] block ${jour.isToday ? 'text-primary-500' : 'text-gray-400'}`}>
                    {jour.dateAffichee}
                  </span>
                  <span className={`text-[9px] font-medium block ${isGain ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-400'}`}>
                    {jour.montantPrev > 0 ? `(${jour.montantPrev.toFixed(0)}€)` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Dernières commandes</h3>
          <Link to="/commandes" className="text-sm text-primary-600 font-medium">
            Voir tout
          </Link>
        </div>

        {dernieresCommandes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-3xl">📋</span>
            <p className="mt-2">Aucune commande</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dernieresCommandes.map((cmd) => {
              const badge = getStatutBadge(cmd.statut);
              return (
                <button
                  key={cmd.id}
                  onClick={() => navigate(`/commandes/${cmd.id}`)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cmd.numero}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {cmd.clients?.nom || cmd.clients?.telephone || 'Client'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{parseFloat(cmd.montant_total).toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Actions rapides</h3>

        <Link
          to="/commandes/nouvelle"
          className="flex items-center gap-3 bg-primary-600 text-white p-4 rounded-xl hover:bg-primary-700 transition-colors"
        >
          <span className="text-2xl">➕</span>
          <div>
            <p className="font-semibold">Nouvelle commande</p>
            <p className="text-sm opacity-80">Créer une commande client</p>
          </div>
        </Link>

        <Link
          to="/commandes?statut=pret"
          className="flex items-center gap-3 bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-semibold text-gray-900">Commandes prêtes</p>
            <p className="text-sm text-gray-500">Voir les commandes à récupérer</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} p-3 rounded-xl`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs opacity-80">{label}</p>
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
