-- ============================================
-- VOTRE BOUTIQUE — Schéma de base de données
-- À exécuter dans : supabase.com > SQL Editor
-- ============================================

-- Table des boutiques (une par utilisateur)
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  brand_voice TEXT DEFAULT 'Chaleureux & de quartier',
  hashtags TEXT DEFAULT '#BoutiqueLocale',
  -- Facebook
  fb_page_id TEXT,
  fb_page_name TEXT,
  fb_page_access_token TEXT,   -- token longue durée, chiffré
  fb_connected_at TIMESTAMPTZ,
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des publications
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT,
  mood TEXT,                    -- "Nouvelle arrivée", "Offre spéciale", etc.
  photo_url TEXT,
  fb_post_id TEXT,              -- ID retourné par Facebook après publication
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'failed')),
  published_at TIMESTAMPTZ,
  reach INT DEFAULT 0,          -- personnes touchées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réponses aux commentaires
CREATE TABLE replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  fb_comment_id TEXT NOT NULL,
  fb_post_id TEXT,
  customer_name TEXT,
  customer_message TEXT NOT NULL,
  reply_content TEXT,
  reply_type TEXT DEFAULT 'question' CHECK (reply_type IN ('question', 'review', 'comment')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied')),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité : chaque utilisateur ne voit que sa boutique
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_owner" ON shops
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "post_owner" ON posts
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

CREATE POLICY "reply_owner" ON replies
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE user_id = auth.uid())
  );

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
