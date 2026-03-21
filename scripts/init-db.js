// Script d'initialisation de la base de donnees
// Executer avec: node scripts/init-db.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bohixtoknfbgfgkgbukn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaGl4dG9rbmZiZ2Zna2didWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDUzODgsImV4cCI6MjA4OTUyMTM4OH0.g6uR6QLolbTZim2SgwuENcxeyVAz-A-dmuQBgDlh5ds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  console.log('🚀 Initialisation de la base de données...\n');

  try {
    // 1. Creer le pressing MIRACLE
    console.log('📍 Création du pressing MIRACLE...');
    const { data: pressingId, error: pressingError } = await supabase.rpc('create_pressing', {
      p_telephone: '0160609090',
      p_mot_de_passe: 'miracle2024',
      p_nom: 'Pressing MIRACLE',
      p_adresse: 'Moissy-Cramayel, 77550'
    });

    if (pressingError) {
      if (pressingError.message.includes('unique') || pressingError.code === '23505') {
        console.log('⚠️  Pressing MIRACLE existe déjà');

        // Recuperer l'ID existant
        const { data: existing } = await supabase
          .from('pressings')
          .select('id')
          .eq('telephone', '0160609090')
          .single();

        if (existing) {
          console.log(`   ID: ${existing.id}`);
        }
      } else {
        throw pressingError;
      }
    } else {
      console.log(`✅ Pressing créé avec ID: ${pressingId}`);
    }

    console.log('\n✨ Initialisation terminée!');
    console.log('\n📱 Identifiants de connexion:');
    console.log('   Téléphone: 0160609090');
    console.log('   Mot de passe: miracle2024');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

initDatabase();
