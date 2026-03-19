import { supabase } from './supabase';

const USER_STORAGE_KEY = 'pressing_user';

export function getUserFromStorage() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveUserToStorage(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearUserFromStorage() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export async function login(telephone, motDePasse) {
  // Appeler la fonction SQL verify_pressing_login
  const { data, error } = await supabase.rpc('verify_pressing_login', {
    p_telephone: telephone,
    p_mot_de_passe: motDePasse,
  });

  if (error) {
    console.error('Erreur de connexion:', error);
    return null;
  }

  // La fonction retourne un tableau, on prend le premier resultat
  if (data && data.length > 0) {
    const pressing = data[0];
    const user = {
      id: pressing.id,
      telephone: pressing.telephone,
      pressing_id: pressing.id,
      pressing_nom: pressing.nom,
      adresse: pressing.adresse,
      mode_etiquetage_defaut: pressing.mode_etiquetage_defaut,
    };

    saveUserToStorage(user);
    return user;
  }

  return null;
}

export function logout() {
  clearUserFromStorage();
}

export async function register(telephone, motDePasse, nom, adresse = null) {
  // Appeler la fonction SQL create_pressing
  const { data, error } = await supabase.rpc('create_pressing', {
    p_telephone: telephone,
    p_mot_de_passe: motDePasse,
    p_nom: nom,
    p_adresse: adresse,
  });

  if (error) {
    console.error('Erreur inscription:', error);

    // Verifier si c'est une erreur de doublon
    if (error.code === '23505' || error.message.includes('unique')) {
      return { error: 'Ce numéro de téléphone est déjà utilisé' };
    }

    return { error: error.message };
  }

  if (data) {
    // Connexion automatique apres inscription
    const user = await login(telephone, motDePasse);
    return { user };
  }

  return { error: 'Erreur inconnue' };
}

export async function changePassword(pressingId, ancienMdp, nouveauMdp) {
  const { data, error } = await supabase.rpc('change_pressing_password', {
    p_pressing_id: pressingId,
    p_ancien_mdp: ancienMdp,
    p_nouveau_mdp: nouveauMdp,
  });

  if (error) {
    console.error('Erreur changement mot de passe:', error);
    return { success: false, error: error.message };
  }

  return { success: data === true };
}
