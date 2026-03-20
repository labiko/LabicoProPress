import { supabase } from './supabase';

// Types de messages SMS
export const SMS_TYPES = {
  COMMANDE_PRETE: 'commande_prete',
  RAPPEL_RECUPERATION: 'rappel_recuperation',
  COMMANDE_CREEE: 'commande_creee',
  REMERCIEMENT: 'remerciement',
};

// Templates de messages modernes
const TEMPLATES = {
  [SMS_TYPES.COMMANDE_PRETE]: (data) =>
    `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nVotre commande n°${data.numeroCommande} est prête !\n\nVous pouvez venir la récupérer dès maintenant.\n\nMerci de votre confiance.`,

  [SMS_TYPES.RAPPEL_RECUPERATION]: (data) =>
    `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nRappel : Votre commande n°${data.numeroCommande} vous attend depuis ${data.joursAttente} jour(s).\n\nN'oubliez pas de venir la récupérer !\n\nMerci.`,

  [SMS_TYPES.COMMANDE_CREEE]: (data) =>
    `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nVotre commande n°${data.numeroCommande} a bien été enregistrée (${data.nbVetements} article(s)).\n\nNous vous préviendrons dès qu'elle sera prête.\n\nMerci !`,

  [SMS_TYPES.REMERCIEMENT]: (data) =>
    `${data.nomPressing}\n\nMerci ${data.nomClient || ''} pour votre visite !\n\nÀ très bientôt.`,
};

/**
 * Service SMS générique
 * Envoie un SMS en fonction du type et des données
 */
export async function envoyerSMS(type, data, commandeId = null) {
  // Générer le message à partir du template
  const template = TEMPLATES[type];
  if (!template) {
    console.error(`❌ Type de SMS inconnu: ${type}`);
    return { success: false, error: 'Type de SMS inconnu' };
  }

  const message = template(data);
  const telephone = data.telephone;

  // Normaliser le numéro de téléphone
  const numeroNormalise = normaliserTelephone(telephone);

  if (!numeroNormalise) {
    console.error(`❌ Numéro invalide: ${telephone}`);
    return { success: false, error: 'Numéro de téléphone invalide' };
  }

  // Afficher dans la console (mode développement)
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    📱 SMS NOTIFICATION                        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ Type: ${type.padEnd(54)}║`);
  console.log(`║ Destinataire: ${numeroNormalise.padEnd(47)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ Message:');
  message.split('\n').forEach(line => {
    console.log(`║   ${line}`);
  });
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Log dans la base de données
  if (commandeId) {
    try {
      await supabase.from('sms_logs').insert({
        commande_id: commandeId,
        telephone: numeroNormalise,
        message: message,
        statut: 'simule', // Mode simulation
      });
    } catch (err) {
      console.error('Erreur log SMS:', err);
    }
  }

  // TODO: Intégrer une vraie API SMS ici
  // Options à considérer:
  // - Twilio (international, fiable)
  // - OVH SMS (français, pas cher)
  // - smsmode (français)
  // - AllMySMS (français)
  // - Vonage/Nexmo (international)

  return { success: true, message };
}

/**
 * Envoie un SMS "Commande prête"
 */
export async function envoyerSmsCommandePrete(commande, pressing) {
  return envoyerSMS(SMS_TYPES.COMMANDE_PRETE, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
  }, commande.id);
}

/**
 * Envoie un SMS de rappel de récupération
 */
export async function envoyerSmsRappel(commande, pressing, joursAttente) {
  return envoyerSMS(SMS_TYPES.RAPPEL_RECUPERATION, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
    joursAttente,
  }, commande.id);
}

/**
 * Envoie un SMS de confirmation de création
 */
export async function envoyerSmsCommandeCreee(commande, pressing) {
  return envoyerSMS(SMS_TYPES.COMMANDE_CREEE, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
    nbVetements: commande.nb_vetements,
  }, commande.id);
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
    return '+33' + numero.substring(2);
  }

  // Si le numéro commence par 0, remplacer par +33
  if (numero.startsWith('0') && numero.length === 10) {
    return '+33' + numero.substring(1);
  }

  // Si le numéro a 9 chiffres (sans le 0), ajouter +33
  if (numero.length === 9) {
    return '+33' + numero;
  }

  return null;
}

/**
 * Calcule le coût estimé d'un SMS (pour affichage)
 * Prix moyen en France: ~0.05€ par SMS
 */
export function estimerCoutSMS(message) {
  const SMS_MAX_LENGTH = 160;
  const nbSms = Math.ceil(message.length / SMS_MAX_LENGTH);
  const prixUnitaire = 0.05;
  return {
    nbSms,
    cout: (nbSms * prixUnitaire).toFixed(2),
  };
}
