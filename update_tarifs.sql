-- VETEMENTS (suite - ceux qui ont échoué)
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('chemise_pliee', 'vetements', 'Chemise pliee', 8.25) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('echarpe', 'vetements', 'Echarpe', 10.43) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('chemisier_delicat', 'vetements', 'Chemisier delicat', 15.45) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('vetement_enfant', 'vetements', 'Vetement enfant', 10.35) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('jupe_plissee', 'vetements', 'Jupe plissee', 31.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('robe_soiree_courte', 'vetements', 'Robe de soiree courte', 34.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('robe_soiree_longue', 'vetements', 'Robe de soiree longue', 42.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- MANTEAUX
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('manteau', 'manteaux', 'Manteau', 20.85) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('manteau_fourrure', 'manteaux', 'Manteau fourrure', 26.70) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('veste_fourrure', 'manteaux', 'Veste fourrure', 21.75) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('anorak', 'manteaux', 'Anorak', 20.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_courte', 'manteaux', 'Doudoune courte', 18.90) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_longue', 'manteaux', 'Doudoune longue', 22.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- CEREMONIE
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('robe_mariee_simple', 'ceremonie', 'Robe mariee simple', 75.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('robe_mariee_volume', 'ceremonie', 'Robe mariee volume', 109.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('voile_mariage', 'ceremonie', 'Voile mariage', 11.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('corset_mariee', 'ceremonie', 'Corset mariee', 22.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('jupon', 'ceremonie', 'Jupon', 22.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('jupe_mariage', 'ceremonie', 'Jupe mariage', 22.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('aube', 'ceremonie', 'Aube', 29.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- SOINS_TEXTILES (nouveaux)
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('pliage_chemise', 'soins_textiles', 'Pliage chemise', 1.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('appretage', 'soins_textiles', 'Appretage', 1.90) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- IMPERMEABILISANT (nouveaux)
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('sur_devis', 'impermeabilisant', 'Sur devis', 2.60) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('anti_acariens', 'impermeabilisant', 'Anti acariens', 5.20) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('anti_mites', 'impermeabilisant', 'Anti mites', 5.20) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- SKI
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('anorak_ski', 'ski', 'Anorak ski', 18.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_duvet_courte', 'ski', 'Doudoune duvet courte', 21.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_duvet_longue', 'ski', 'Doudoune duvet longue', 25.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_synth_courte', 'ski', 'Doudoune synth courte', 17.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('doudoune_synth_longue', 'ski', 'Doudoune synth longue', 22.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('pantalon_ski', 'ski', 'Pantalon ski', 16.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('blouson_ski', 'ski', 'Blouson ski', 17.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('combinaison_ski', 'ski', 'Combinaison ski', 22.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- COUCHAGE
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('couverture_simple', 'couchage', 'Couverture simple', 15.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('couverture_epaisse', 'couchage', 'Couverture epaisse', 21.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('couette_synth_1p', 'couchage', 'Couette synth 1 place', 24.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('couette_synth_2p', 'couchage', 'Couette synth 2 places', 29.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('dessus_lit', 'couchage', 'Dessus lit', 24.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('couette_plume', 'couchage', 'Couette plume', 36.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('sac_couchage_synth', 'couchage', 'Sac couchage synth', 24.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('sac_couchage_plume', 'couchage', 'Sac couchage plume', 34.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- AMEUBLEMENT
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('housse_canape', 'ameublement', 'Housse canape', 47.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('housse_coussin', 'ameublement', 'Housse coussin', 5.60) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('tapis', 'ameublement', 'Tapis', 23.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('tapis_peau', 'ameublement', 'Tapis peau', 41.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('voilage', 'ameublement', 'Voilage', 21.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('rideau_simple', 'ameublement', 'Rideau simple', 28.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('rideau_double', 'ameublement', 'Rideau double', 39.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- LINGE_TABLE
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('nappe_6_12', 'linge_table', 'Nappe 6-12 pers', 15.10) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('nappe_14_plus', 'linge_table', 'Nappe 14+ pers', 23.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('nappe_brodee_6_12', 'linge_table', 'Nappe brodee 6-12 pers', 21.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('nappe_brodee_14_plus', 'linge_table', 'Nappe brodee 14+ pers', 28.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('serviette_table', 'linge_table', 'Serviette table', 2.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('torchon', 'linge_table', 'Torchon', 2.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- LINGE_BAIN
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('drap_bain', 'linge_bain', 'Drap de bain', 5.60) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('serviette_eponge', 'linge_bain', 'Serviette eponge', 4.10) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('robe_chambre', 'linge_bain', 'Robe de chambre', 13.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- LINGE_LIT
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('drap', 'linge_lit', 'Drap', 4.95) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('housse_couette', 'linge_lit', 'Housse couette', 9.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('oreiller', 'linge_lit', 'Oreiller', 14.50) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('taie_oreiller', 'linge_lit', 'Taie oreiller', 3.90) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('taie_traversin', 'linge_lit', 'Taie traversin', 3.90) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('alese', 'linge_lit', 'Alese', 9.90) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- TRAVAIL
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('tablier', 'travail', 'Tablier', 2.70) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('pantalon_travail', 'travail', 'Pantalon travail', 3.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('veste_travail', 'travail', 'Veste travail', 3.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('blouse_travail', 'travail', 'Blouse travail', 4.70) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('combinaison_travail', 'travail', 'Combinaison travail', 5.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- EMBALLAGES (nouveaux)
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('housse_5sec', 'emballages', 'Housse 5 sec', 5.80) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('gaine_recyclable', 'emballages', 'Gaine recyclable', 0.15) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;

-- FORFAITS (nouveaux)
INSERT INTO articles (id, categorie_id, nom, prix) VALUES ('forfait_20_chemises', 'forfaits', 'Forfait 20 chemises', 67.00) ON CONFLICT (id) DO UPDATE SET prix = EXCLUDED.prix, nom = EXCLUDED.nom, categorie_id = EXCLUDED.categorie_id;
