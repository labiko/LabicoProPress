-- ============================================
-- LABICOPROPRESS - Schema Supabase
-- ============================================
-- Executer ce script dans: Supabase Dashboard > SQL Editor
-- ============================================

-- Extension pour cryptage mot de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABLE PRESSINGS (multi-tenant)
CREATE TABLE pressings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telephone VARCHAR(15) NOT NULL UNIQUE,  -- Login
    mot_de_passe TEXT NOT NULL,             -- Mot de passe crypte (bcrypt)
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    api_key_sms VARCHAR(100),
    mode_etiquetage_defaut VARCHAR(20) DEFAULT 'individuel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE CLIENTS
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pressing_id UUID REFERENCES pressings(id) ON DELETE CASCADE,
    telephone VARCHAR(15) NOT NULL,
    nom VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pressing_id, telephone)
);

-- 3. TABLE COMMANDES
CREATE TABLE commandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pressing_id UUID REFERENCES pressings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'pret', 'recupere')),
    nb_vetements INTEGER DEFAULT 1,
    mode_etiquetage VARCHAR(20) DEFAULT 'individuel' CHECK (mode_etiquetage IN ('individuel', 'filet', 'mixte')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE SMS_LOGS
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
    telephone VARCHAR(15),
    message TEXT,
    statut VARCHAR(20),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX pour performances
-- ============================================
CREATE INDEX idx_pressings_telephone ON pressings(telephone);
CREATE INDEX idx_clients_pressing ON clients(pressing_id);
CREATE INDEX idx_clients_telephone ON clients(telephone);
CREATE INDEX idx_commandes_pressing ON commandes(pressing_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_numero ON commandes(numero);
CREATE INDEX idx_commandes_created ON commandes(created_at DESC);

-- ============================================
-- FONCTION: Creer un pressing avec mot de passe crypte
-- ============================================
CREATE OR REPLACE FUNCTION create_pressing(
    p_telephone VARCHAR(15),
    p_mot_de_passe TEXT,
    p_nom VARCHAR(100),
    p_adresse TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO pressings (telephone, mot_de_passe, nom, adresse)
    VALUES (
        p_telephone,
        crypt(p_mot_de_passe, gen_salt('bf')),  -- Cryptage bcrypt
        p_nom,
        p_adresse
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Verifier login pressing
-- ============================================
CREATE OR REPLACE FUNCTION verify_pressing_login(
    p_telephone VARCHAR(15),
    p_mot_de_passe TEXT
)
RETURNS TABLE (
    id UUID,
    telephone VARCHAR(15),
    nom VARCHAR(100),
    adresse TEXT,
    mode_etiquetage_defaut VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pr.id,
        pr.telephone,
        pr.nom,
        pr.adresse,
        pr.mode_etiquetage_defaut
    FROM pressings pr
    WHERE pr.telephone = p_telephone
    AND pr.mot_de_passe = crypt(p_mot_de_passe, pr.mot_de_passe);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Changer mot de passe
-- ============================================
CREATE OR REPLACE FUNCTION change_pressing_password(
    p_pressing_id UUID,
    p_ancien_mdp TEXT,
    p_nouveau_mdp TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    valid BOOLEAN;
BEGIN
    -- Verifier l'ancien mot de passe
    SELECT EXISTS (
        SELECT 1 FROM pressings
        WHERE id = p_pressing_id
        AND mot_de_passe = crypt(p_ancien_mdp, mot_de_passe)
    ) INTO valid;

    IF NOT valid THEN
        RETURN FALSE;
    END IF;

    -- Mettre a jour avec le nouveau mot de passe
    UPDATE pressings
    SET mot_de_passe = crypt(p_nouveau_mdp, gen_salt('bf'))
    WHERE id = p_pressing_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Mise a jour automatique updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commandes_updated_at
    BEFORE UPDATE ON commandes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Acces public pour les fonctions
-- ============================================
ALTER TABLE pressings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Permettre l'acces public aux tables (l'auth est geree par les fonctions)
CREATE POLICY "Allow all for pressings" ON pressings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for commandes" ON commandes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sms_logs" ON sms_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONNEE DE TEST (optionnel)
-- ============================================
-- SELECT create_pressing('0612345678', 'monmotdepasse', 'Pressing du Centre', '12 rue de la Gare, 75001 Paris');
