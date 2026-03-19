import { supabase } from './supabase';

const SMSMODE_API_URL = 'https://api.smsmode.com/http/1.6/sendSMS.do';

/**
 * Envoie un SMS via l'API smsmode
 * Note: Pour le MVP, cette fonction simule l'envoi
 * En production, implémenter l'appel API réel via une Edge Function Supabase
 */
export async function envoyerSMS(telephone, message, commandeId, pressingId) {
  // Normaliser le numéro de téléphone
  const numeroNormalise = normaliserTelephone(telephone);

  if (!numeroNormalise) {
    return { success: false, error: 'Numéro de téléphone invalide' };
  }

  // Log l'envoi dans la base de données
  const { data: logData, error: logError } = await supabase
    .from('sms_logs')
    .insert({
      commande_id: commandeId,
      telephone: numeroNormalise,
      message: message,
      statut: 'envoye', // Pour le MVP, on simule l'envoi
    })
    .select()
    .single();

  if (logError) {
    console.error('Erreur log SMS:', logError);
    return { success: false, error: 'Erreur lors de l\'enregistrement du SMS' };
  }

  // TODO: Implémenter l'appel API réel via Edge Function
  // Pour le MVP, on simule un envoi réussi
  console.log(`📱 SMS envoyé à ${numeroNormalise}: ${message}`);

  return { success: true, logId: logData.id };
}

/**
 * Génère le message SMS pour une commande prête
 */
export function genererMessagePret(numeroCommande, nomPressing) {
  return `Bonjour, votre commande n°${numeroCommande} est prête. ${nomPressing}`;
}

/**
 * Normalise un numéro de téléphone français
 */
function normaliserTelephone(telephone) {
  if (!telephone) return null;

  // Supprimer tous les caractères non numériques
  let numero = telephone.replace(/\D/g, '');

  // Si le numéro commence par 33, le garder
  if (numero.startsWith('33') && numero.length === 11) {
    return numero;
  }

  // Si le numéro commence par 0, remplacer par 33
  if (numero.startsWith('0') && numero.length === 10) {
    return '33' + numero.substring(1);
  }

  // Si le numéro a 9 chiffres (sans le 0), ajouter 33
  if (numero.length === 9) {
    return '33' + numero;
  }

  return null;
}
