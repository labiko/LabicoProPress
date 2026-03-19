import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { pressing } = useAuth();
  const [stats, setStats] = useState({
    commandesEnCours: 0,
    commandesPret: 0,
    commandesAujourdHui: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pressing?.id) {
      loadStats();
    }
  }, [pressing?.id]);

  async function loadStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Compter les commandes en cours
      const { count: enCours } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .eq('pressing_id', pressing.id)
        .eq('statut', 'en_cours');

      // Compter les commandes prêtes
      const { count: pret } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .eq('pressing_id', pressing.id)
        .eq('statut', 'pret');

      // Compter les commandes du jour
      const { count: aujourdHui } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .eq('pressing_id', pressing.id)
        .gte('created_at', today);

      // Compter les clients
      const { count: clients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('pressing_id', pressing.id);

      setStats({
        commandesEnCours: enCours || 0,
        commandesPret: pret || 0,
        commandesAujourdHui: aujourdHui || 0,
        totalClients: clients || 0,
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Titre de bienvenue */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bonjour !</h2>
        <p className="text-gray-600">Voici le résumé de votre activité</p>
      </div>

      {/* Cartes statistiques */}
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
          icon="📅"
          label="Aujourd'hui"
          value={stats.commandesAujourdHui}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon="👥"
          label="Clients"
          value={stats.totalClients}
          color="bg-purple-50 text-purple-700"
        />
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
          to="/clients/nouveau"
          className="flex items-center gap-3 bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold text-gray-900">Nouveau client</p>
            <p className="text-sm text-gray-500">Ajouter un client</p>
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
    <div className={`${color} p-4 rounded-xl`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}
