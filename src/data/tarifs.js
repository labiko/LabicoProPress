// Tarifs Pressing - Prix les plus eleves
// Source: Grille tarifaire officielle

export const CATEGORIES = [
  { id: 'basiques', nom: 'Basiques', icon: '👔' },
  { id: 'vetements', nom: 'Vetements', icon: '👕' },
  { id: 'ceremonie', nom: 'Ceremonie', icon: '👰' },
  { id: 'soins_textiles', nom: 'Soins textiles', icon: '✨' },
  { id: 'impermeabilisant', nom: 'Impermeabilisant', icon: '💧' },
  { id: 'ski', nom: 'Vetements de ski', icon: '⛷️' },
  { id: 'couchage', nom: 'Couchage', icon: '🛏️' },
  { id: 'ameublement', nom: 'Ameublement', icon: '🛋️' },
  { id: 'linge_table', nom: 'Linge de table', icon: '🍽️' },
  { id: 'linge_bain', nom: 'Linge de bain', icon: '🛁' },
  { id: 'linge_lit', nom: 'Linge de lit', icon: '🛌' },
  { id: 'travail', nom: 'Vetements de travail', icon: '👷' },
  { id: 'emballages', nom: 'Emballages', icon: '📦' },
  { id: 'forfaits', nom: 'Forfaits', icon: '💼' },
];

export const ARTICLES = [
  // === BASIQUES ===
  { id: 'chemise', nom: 'Chemise (livree sur cintre)', categorie: 'basiques', prix: 6.75 },
  { id: 'jupe_simple', nom: 'Jupe simple', categorie: 'basiques', prix: 12.45 },
  { id: 'pantalon', nom: 'Pantalon', categorie: 'basiques', prix: 10.50 },
  { id: 'veste', nom: 'Veste', categorie: 'basiques', prix: 12.00 },
  { id: 'robe_simple', nom: 'Robe simple', categorie: 'basiques', prix: 14.85 },
  { id: 'manteau_impermeable', nom: 'Manteau / Impermeable', categorie: 'basiques', prix: 20.85 },

  // === VETEMENTS ===
  { id: 'chemise_pliee', nom: 'Chemise pliee', categorie: 'vetements', prix: 8.25 },
  { id: 'tshirt_mc', nom: 'T-shirt - Polo M.courte', categorie: 'vetements', prix: 5.85 },
  { id: 'tshirt_ml', nom: 'T-shirt - Polo M.longue', categorie: 'vetements', prix: 7.35 },
  { id: 'pull', nom: 'Pull', categorie: 'vetements', prix: 8.80 },
  { id: 'gilet', nom: 'Gilet', categorie: 'vetements', prix: 9.60 },
  { id: 'echarpe', nom: 'Echarpe', categorie: 'vetements', prix: 10.43 },
  { id: 'chemisier_simple', nom: 'Chemisier simple', categorie: 'vetements', prix: 8.93 },
  { id: 'chemisier_delicat', nom: 'Chemisier delicat', categorie: 'vetements', prix: 15.45 },
  { id: 'foulard', nom: 'Foulard', categorie: 'vetements', prix: 11.85 },
  { id: 'cravate', nom: 'Cravate', categorie: 'vetements', prix: 11.10 },
  { id: 'vetement_enfant', nom: 'Vet enfant (-8 ans)', categorie: 'vetements', prix: 10.35 },
  { id: 'jupe_plissee', nom: 'Jupe plissee', categorie: 'vetements', prix: 31.50 },
  { id: 'robe_soiree_courte', nom: 'Robe de soiree courte', categorie: 'vetements', prix: 34.50 },
  { id: 'robe_soiree_longue', nom: 'Robe de soiree longue', categorie: 'vetements', prix: 42.00 },
  { id: 'blouson', nom: 'Blouson', categorie: 'vetements', prix: 22.35 },
  { id: 'djellaba', nom: 'Djellaba', categorie: 'vetements', prix: 24.00 },
  { id: 'manteau_fourrure', nom: 'Manteau fourrure synth', categorie: 'vetements', prix: 26.70 },
  { id: 'veste_fourrure', nom: 'Veste fourrure synth', categorie: 'vetements', prix: 21.75 },

  // === CEREMONIE ===
  { id: 'robe_mariee_simple', nom: 'Robe de mariee simple', categorie: 'ceremonie', prix: 75.00 },
  { id: 'robe_mariee_volume', nom: 'Robe de mariee grand volume', categorie: 'ceremonie', prix: 109.00 },
  { id: 'voile_mariage', nom: 'Voile mariage', categorie: 'ceremonie', prix: 11.00 },
  { id: 'corset_mariee', nom: 'Corset de mariee', categorie: 'ceremonie', prix: 22.00 },
  { id: 'jupon', nom: 'Jupon', categorie: 'ceremonie', prix: 22.00 },
  { id: 'jupe_mariage', nom: 'Jupe de mariage', categorie: 'ceremonie', prix: 22.00 },
  { id: 'aube', nom: 'Aube', categorie: 'ceremonie', prix: 29.00 },

  // === SOINS TEXTILES ===
  { id: 'pliage_chemise', nom: 'Pliage chemise', categorie: 'soins_textiles', prix: 1.00 },
  { id: 'appretage', nom: 'Appretage', categorie: 'soins_textiles', prix: 1.90 },

  // === IMPERMEABILISANT ===
  { id: 'impermeabilisant_devis', nom: 'Sur devis a partir de', categorie: 'impermeabilisant', prix: 2.60 },
  { id: 'anti_acariens', nom: 'Anti-acariens', categorie: 'impermeabilisant', prix: 5.20 },
  { id: 'anti_mites', nom: 'Anti-mites', categorie: 'impermeabilisant', prix: 5.20 },

  // === VETEMENTS DE SKI ===
  { id: 'anorak_parka', nom: 'Anorak - Parka', categorie: 'ski', prix: 18.00 },
  { id: 'doudoune_duvet_courte', nom: 'Doudoune duvet courte', categorie: 'ski', prix: 21.00 },
  { id: 'doudoune_duvet_longue', nom: 'Doudoune duvet longue', categorie: 'ski', prix: 25.00 },
  { id: 'doudoune_synth_courte', nom: 'Doudoune synth. courte', categorie: 'ski', prix: 17.00 },
  { id: 'doudoune_synth_longue', nom: 'Doudoune synth. longue', categorie: 'ski', prix: 22.00 },
  { id: 'pantalon_ski', nom: 'Pantalon de ski', categorie: 'ski', prix: 16.00 },
  { id: 'blouson_ski', nom: 'Blouson de ski', categorie: 'ski', prix: 17.00 },
  { id: 'combinaison_ski', nom: 'Combinaison de ski', categorie: 'ski', prix: 22.00 },

  // === COUCHAGE ===
  { id: 'couverture_simple', nom: 'Couverture simple', categorie: 'couchage', prix: 15.00 },
  { id: 'couverture_epaisse', nom: 'Couverture epaisse', categorie: 'couchage', prix: 21.00 },
  { id: 'couette_synth_1p', nom: 'Couette synth 1 place', categorie: 'couchage', prix: 24.00 },
  { id: 'couette_synth_2p', nom: 'Couette synth 2 places', categorie: 'couchage', prix: 29.00 },
  { id: 'dessus_lit', nom: 'Dessus de lit - Plaid', categorie: 'couchage', prix: 24.00 },
  { id: 'couette_plume', nom: 'Couette plume et duvet', categorie: 'couchage', prix: 36.00 },
  { id: 'sac_couchage_synth', nom: 'Sac de couchage synthetique', categorie: 'couchage', prix: 24.50 },
  { id: 'sac_couchage_plume', nom: 'Sac de couchage plume et duvet', categorie: 'couchage', prix: 34.50 },

  // === AMEUBLEMENT ===
  { id: 'housse_canape', nom: 'Housse de canape', categorie: 'ameublement', prix: 47.00 },
  { id: 'housse_coussin', nom: 'Housse de coussin', categorie: 'ameublement', prix: 5.60 },
  { id: 'tapis', nom: 'Tapis', categorie: 'ameublement', prix: 23.50 },
  { id: 'tapis_peau', nom: 'Tapis peau', categorie: 'ameublement', prix: 41.00 },
  { id: 'voilage', nom: 'Voilage', categorie: 'ameublement', prix: 21.00 },
  { id: 'rideau_simple', nom: 'Rideau simple', categorie: 'ameublement', prix: 28.50 },
  { id: 'rideau_double', nom: 'Rideau double', categorie: 'ameublement', prix: 39.50 },

  // === LINGE DE TABLE ===
  { id: 'nappe_simple_6_12', nom: 'Nappe simple 6 a 12 couverts', categorie: 'linge_table', prix: 15.10 },
  { id: 'nappe_simple_14_plus', nom: 'Nappe simple 14 couverts et plus', categorie: 'linge_table', prix: 23.00 },
  { id: 'nappe_brodee_6_12', nom: 'Nappe brodee 6 a 12 couverts', categorie: 'linge_table', prix: 21.00 },
  { id: 'nappe_brodee_14_plus', nom: 'Nappe brodee 14 couverts et plus', categorie: 'linge_table', prix: 28.00 },
  { id: 'serviette_table', nom: 'Serviette de table - Torchon', categorie: 'linge_table', prix: 2.80 },

  // === LINGE DE BAIN ===
  { id: 'drap_bain', nom: 'Drap de bain', categorie: 'linge_bain', prix: 5.60 },
  { id: 'serviette_eponge', nom: 'Serviette eponge', categorie: 'linge_bain', prix: 4.10 },
  { id: 'robe_chambre', nom: 'Robe de chambre', categorie: 'linge_bain', prix: 13.00 },

  // === LINGE DE LIT ===
  { id: 'drap', nom: 'Drap', categorie: 'linge_lit', prix: 4.95 },
  { id: 'housse_couette', nom: 'Housse de couette', categorie: 'linge_lit', prix: 9.80 },
  { id: 'oreiller', nom: 'Oreiller', categorie: 'linge_lit', prix: 14.50 },
  { id: 'taie_oreiller', nom: 'Taie d\'oreiller', categorie: 'linge_lit', prix: 3.90 },
  { id: 'taie_traversin', nom: 'Taie de traversin', categorie: 'linge_lit', prix: 3.90 },
  { id: 'alese', nom: 'Alese molleton', categorie: 'linge_lit', prix: 9.90 },

  // === VETEMENTS DE TRAVAIL ===
  { id: 'tablier', nom: 'Tablier', categorie: 'travail', prix: 2.70 },
  { id: 'pantalon_travail', nom: 'Pantalon de travail', categorie: 'travail', prix: 3.80 },
  { id: 'veste_travail', nom: 'Veste de travail', categorie: 'travail', prix: 3.80 },
  { id: 'blouse_travail', nom: 'Blouse de travail', categorie: 'travail', prix: 4.70 },
  { id: 'combinaison_travail', nom: 'Combinaison de travail', categorie: 'travail', prix: 5.80 },

  // === EMBALLAGES ===
  { id: 'housse_5ssec', nom: 'Housse 5ssec reutilisable', categorie: 'emballages', prix: 5.80 },
  { id: 'gaine_recyclable', nom: 'Gaine recyclable', categorie: 'emballages', prix: 0.15 },

  // === FORFAITS ===
  { id: 'forfait_20_chemises', nom: '20 chemises, polos ou tee-shirts', categorie: 'forfaits', prix: 67.00 },
];

// Fonction utilitaire pour obtenir les articles par categorie
export function getArticlesByCategorie(categorieId) {
  return ARTICLES.filter(a => a.categorie === categorieId);
}

// Fonction utilitaire pour obtenir un article par ID
export function getArticleById(articleId) {
  return ARTICLES.find(a => a.id === articleId);
}

// Fonction utilitaire pour obtenir une categorie par ID
export function getCategorieById(categorieId) {
  return CATEGORIES.find(c => c.id === categorieId);
}

// Calcul du total d'une liste d'articles
export function calculerTotal(lignes) {
  return lignes.reduce((total, ligne) => {
    return total + (ligne.prix_unitaire * ligne.quantite);
  }, 0);
}
