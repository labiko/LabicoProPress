import { supabase } from './supabase';

// Types de messages SMS
export const SMS_TYPES = {
  COMMANDE_PRETE: 'commande_prete',
  RAPPEL_RECUPERATION: 'rappel_recuperation',
  COMMANDE_CREEE: 'commande_creee',
  REMERCIEMENT: 'remerciement',
};

// Templates de messages
const TEMPLATES = {
  [SMS_TYPES.COMMANDE_PRETE]: (data) => {
    let msg = `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nVotre commande n${data.numeroCommande} est prete !`;
    if (data.adressePressing) {
      msg += `\n\nAdresse: ${data.adressePressing}`;
    }
    msg += `\n\nMerci de votre confiance.`;
    return msg;
  },

  [SMS_TYPES.RAPPEL_RECUPERATION]: (data) => {
    let msg = `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nRappel: Votre commande n${data.numeroCommande} vous attend depuis ${data.joursAttente} jour(s).`;
    if (data.adressePressing) {
      msg += `\n\nAdresse: ${data.adressePressing}`;
    }
    msg += `\n\nMerci.`;
    return msg;
  },

  [SMS_TYPES.COMMANDE_CREEE]: (data) => {
    const prix = parseFloat(data.montantTotal || 0).toFixed(2);
    return `${data.nomPressing}\n\nBonjour ${data.nomClient || ''},\n\nVotre commande n${data.numeroCommande} a bien ete enregistree.\n\n${data.nbVetements} article(s) - ${prix} EUR\n\nNous vous previendrons des qu'elle sera prete.\n\nMerci !`;
  },

  [SMS_TYPES.REMERCIEMENT]: (data) =>
    `${data.nomPressing}\n\nMerci ${data.nomClient || ''} pour votre visite !\n\nA tres bientot.`,
};

// Configuration Brevo
const BREVO_API_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;

/**
 * Normalise un numero de telephone francais au format international
 */
function normaliserTelephone(telephone) {
  if (!telephone) return null;

  // Supprimer tous les caracteres non numeriques
  let numero = telephone.replace(/\D/g, '');

  // Si le numero commence par 33, le garder
  if (numero.startsWith('33') && numero.length === 11) {
    return '33' + numero.substring(2);
  }

  // Si le numero commence par 0, remplacer par 33
  if (numero.startsWith('0') && numero.length === 10) {
    return '33' + numero.substring(1);
  }

  // Si le numero a 9 chiffres (sans le 0), ajouter 33
  if (numero.length === 9) {
    return '33' + numero;
  }

  return null;
}

/**
 * Envoie un SMS via l'API Brevo
 */
async function envoyerViaBreveo(telephone, message, sender = 'Pressing') {
  if (!BREVO_API_KEY) {
    console.error('Cle API Brevo non configuree');
    return { success: false, error: 'API SMS non configuree' };
  }

  const numeroNormalise = normaliserTelephone(telephone);
  if (!numeroNormalise) {
    return { success: false, error: 'Numero de telephone invalide' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: sender.substring(0, 11), // Max 11 caracteres pour le sender
        recipient: numeroNormalise,
        content: message,
        type: 'transactional',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Brevo:', data);
      return {
        success: false,
        error: data.message || 'Erreur envoi SMS',
        code: data.code
      };
    }

    console.log('SMS envoye:', data);
    return {
      success: true,
      messageId: data.messageId,
      creditsUsed: data.usedCredits,
      creditsRemaining: data.remainingCredits,
    };
  } catch (err) {
    console.error('Erreur reseau SMS:', err);
    return { success: false, error: 'Erreur reseau' };
  }
}

/**
 * Service SMS generique
 * Envoie un SMS en fonction du type et des donnees
 */
export async function envoyerSMS(type, data, commandeId = null) {
  // Generer le message a partir du template
  const template = TEMPLATES[type];
  if (!template) {
    console.error(`Type de SMS inconnu: ${type}`);
    return { success: false, error: 'Type de SMS inconnu' };
  }

  const message = template(data);
  const telephone = data.telephone;

  // Log dans la console
  console.log('\n========== SMS NOTIFICATION ==========');
  console.log('Type:', type);
  console.log('Destinataire:', telephone);
  console.log('Message:', message);
  console.log('=======================================\n');

  // Envoyer via Brevo
  const result = await envoyerViaBreveo(telephone, message, data.nomPressing);

  // Log dans la base de donnees
  if (commandeId) {
    try {
      await supabase.from('sms_logs').insert({
        commande_id: commandeId,
        telephone: normaliserTelephone(telephone),
        message: message,
        statut: result.success ? 'envoye' : 'erreur',
        brevo_message_id: result.messageId || null,
        error_message: result.error || null,
      });
    } catch (err) {
      console.error('Erreur log SMS:', err);
    }
  }

  return { ...result, message };
}

/**
 * Envoie un SMS "Commande prete"
 */
export async function envoyerSmsCommandePrete(commande, pressing) {
  return envoyerSMS(SMS_TYPES.COMMANDE_PRETE, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
    adressePressing: pressing.adresse,
  }, commande.id);
}

/**
 * Envoie un SMS de rappel de recuperation
 */
export async function envoyerSmsRappel(commande, pressing, joursAttente) {
  return envoyerSMS(SMS_TYPES.RAPPEL_RECUPERATION, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
    adressePressing: pressing.adresse,
    joursAttente,
  }, commande.id);
}

/**
 * Envoie un SMS de confirmation de creation
 */
export async function envoyerSmsCommandeCreee(commande, pressing) {
  return envoyerSMS(SMS_TYPES.COMMANDE_CREEE, {
    telephone: commande.clients?.telephone,
    nomClient: commande.clients?.nom,
    numeroCommande: commande.numero,
    nomPressing: pressing.nom,
    nbVetements: commande.nb_vetements,
    montantTotal: commande.montant_total,
  }, commande.id);
}

/**
 * Calcule le cout estime d'un SMS (pour affichage)
 * Brevo: ~4.5 credits par SMS France
 */
export function estimerCoutSMS(message) {
  const SMS_MAX_LENGTH = 160;
  const nbSms = Math.ceil(message.length / SMS_MAX_LENGTH);
  const prixUnitaire = 0.045; // 4.5 credits = 0.045 EUR
  return {
    nbSms,
    cout: (nbSms * prixUnitaire).toFixed(3),
  };
}
