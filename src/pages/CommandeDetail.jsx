import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { envoyerSMS, genererMessagePret } from '../lib/sms';

const STATUTS = {
  en_cours: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  pret: { label: 'Prêt', color: 'bg-green-100 text-green-800' },
  recupere: { label: 'Récupéré', color: 'bg-gray-100 text-gray-800' },
};

export function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pressing } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommande();
  }, [id]);

  async function loadCommande() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*, clients(nom, telephone)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCommande(data);
    } catch (err) {
      console.error('Erreur:', err);
      showError('Commande non trouvée');
      navigate('/commandes');
    } finally {
      setLoading(false);
    }
  }

  async function marquerPret() {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: 'pret', updated_at: new Date().toISOString() })
        .eq('id', id);

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

      loadCommande();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  async function marquerRecupere() {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: 'recupere', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      showSuccess('Commande récupérée');
      loadCommande();
    } catch (err) {
      console.error('Erreur:', err);
      showError('Erreur lors de la mise à jour');
    }
  }

  function copierEtiquette() {
    const texte = `${commande.numero} - ${commande.clients?.nom || commande.clients?.telephone}`;
    navigator.clipboard.writeText(texte);
    showInfo('Texte copié ! Collez-le dans l\'app Brother P-Touch');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!commande) return null;

  const statut = STATUTS[commande.statut];
  const date = new Date(commande.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/commandes')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{commande.numero}</h2>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statut.color}`}>
            {statut.label}
          </span>
        </div>
        <button
          onClick={() => navigate(`/commandes/${id}/modifier`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ✏️
        </button>
      </div>

      {/* Infos client */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
        <p className="font-semibold text-gray-900">
          {commande.clients?.nom || 'Sans nom'}
        </p>
        <p className="text-gray-600">{commande.clients?.telephone}</p>
      </div>

      {/* Détails commande */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vêtements</span>
          <span className="font-medium">{commande.nb_vetements}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Étiquetage</span>
          <span className="font-medium capitalize">{commande.mode_etiquetage}</span>
        </div>
        {commande.notes && (
          <div>
            <span className="text-gray-500 block mb-1">Notes</span>
            <p className="text-gray-700 bg-gray-50 p-2 rounded">{commande.notes}</p>
          </div>
        )}
      </div>

      {/* Étiquette */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Imprimer étiquette</h3>
        <div className="bg-white rounded-lg p-4 text-center border-2 border-dashed border-blue-200 mb-3">
          <p className="font-mono text-lg font-bold">
            {commande.numero} - {commande.clients?.nom || commande.clients?.telephone}
          </p>
        </div>
        <button
          onClick={copierEtiquette}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          📋 Copier le texte de l'étiquette
        </button>
        <p className="text-xs text-blue-600 mt-2 text-center">
          Collez ensuite dans l'app Brother P-Touch sur votre téléphone
        </p>
      </div>

      {/* Actions */}
      {commande.statut !== 'recupere' && (
        <div className="space-y-2">
          {commande.statut === 'en_cours' && (
            <button
              onClick={marquerPret}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              ✓ Marquer prêt + Envoyer SMS
            </button>
          )}
          {commande.statut === 'pret' && (
            <button
              onClick={marquerRecupere}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              📦 Marquer comme récupéré
            </button>
          )}
        </div>
      )}
    </div>
  );
}
