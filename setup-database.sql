-- ============================================================
-- HOZANA CONCEPT — Setup Base de Données Supabase
-- Coller dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Extension UUID (déjà active sur Supabase, au cas où)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE : blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE,
  category     TEXT DEFAULT 'IA',
  author       TEXT DEFAULT 'Marcus Hozana',
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  read_time    INTEGER DEFAULT 5,
  tags         TEXT[] DEFAULT '{}',
  published    BOOLEAN DEFAULT true,
  featured     BOOLEAN DEFAULT false,
  views        INTEGER DEFAULT 0,
  likes        INTEGER DEFAULT 0,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL DEFAULT 'Anonyme',
  author_email TEXT,
  content      TEXT NOT NULL,
  approved     BOOLEAN DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT,
  email      TEXT,
  phone      TEXT,
  company    TEXT,
  service    TEXT,
  message    TEXT,
  source     TEXT DEFAULT 'direct',
  status     TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : page_views
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page       TEXT,
  visitor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack       TEXT NOT NULL,
  billing    TEXT DEFAULT 'monthly',
  promo      TEXT DEFAULT '',
  email      TEXT,
  firstname  TEXT,
  lastname   TEXT,
  company    TEXT,
  status     TEXT DEFAULT 'pending',
  amount     INTEGER DEFAULT 0,
  options    TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS options TEXT DEFAULT '';

-- ============================================================
-- TABLE : packs
-- ============================================================
CREATE TABLE IF NOT EXISTS packs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type         TEXT DEFAULT 'pack',
  name              TEXT NOT NULL,
  description       TEXT,
  price             TEXT,
  old_price         TEXT,
  period            TEXT DEFAULT '/mois',
  features          TEXT[] DEFAULT '{}',
  features_excluded TEXT[] DEFAULT '{}',
  comparison        JSONB DEFAULT '{}'::jsonb,
  is_featured       BOOLEAN DEFAULT false,
  badge             TEXT,
  color_class       TEXT DEFAULT 'badge-glass',
  button_text       TEXT DEFAULT 'Démarrer',
  button_class      TEXT DEFAULT 'btn-glass',
  link              TEXT,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE packs ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'pack';
ALTER TABLE packs ADD COLUMN IF NOT EXISTS old_price TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS comparison JSONB DEFAULT '{}'::jsonb;

-- ============================================================
-- TABLE : pack_options
-- Options complémentaires affichées sous la page pricing et dans
-- le récapitulatif de commande. Séparées des packs pour éviter
-- tout mélange dans l'affichage public.
-- ============================================================
CREATE TABLE IF NOT EXISTS pack_options (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       TEXT,
  old_price   TEXT,
  period      TEXT DEFAULT 'par mois',
  features    TEXT[] DEFAULT '{}',
  badge       TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : services_list
-- ============================================================
CREATE TABLE IF NOT EXISTS services_list (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  icon        TEXT,
  description TEXT,
  features    TEXT[] DEFAULT '{}',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : portfolio_projects
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  image       TEXT, -- URL de l'image
  link        TEXT, -- Lien externe (optionnel)
  description TEXT,
  tags        TEXT[] DEFAULT '{}',
  sort_order  INTEGER DEFAULT 0,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (Packs, Services, Portfolio)
-- ============================================================
ALTER TABLE packs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_options       ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_list       ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON packs;
CREATE POLICY "anon_all" ON packs FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON pack_options;
CREATE POLICY "anon_all" ON pack_options FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON services_list;
CREATE POLICY "anon_all" ON services_list FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON portfolio_projects;
CREATE POLICY "anon_all" ON portfolio_projects FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- INSERTION DES PACKS (Homepage Data)
-- ============================================================
INSERT INTO packs (name, description, price, period, features, features_excluded, is_featured, badge, color_class, button_text, button_class, link, sort_order)
VALUES 
(
  'Starter', 
  'Pour démarrer', 
  '490€', 
  '/mois', 
  ARRAY['Chatbot IA basique', '3 workflows automatisés', 'Rapport mensuel', 'Support email'],
  ARRAY['Analytics avancés', 'Growth Ads IA'],
  false,
  NULL,
  'badge-glass',
  'Commencer',
  'btn-glass',
  'contact.html?pack=starter',
  1
),
(
  'Growth', 
  'Pour accélérer', 
  '990€', 
  '/mois', 
  ARRAY['Chatbot IA avancé', '10 workflows complexes', 'Analytics en temps réel', 'Growth Ads IA', 'Support prioritaire', 'Rapport hebdomadaire'],
  ARRAY[]::TEXT[],
  true,
  '⭐ Le plus populaire',
  'badge-red',
  'Démarrer →',
  'btn-primary',
  'contact.html?pack=growth',
  2
),
(
  'Elite', 
  'Pour dominer', 
  '1 990€', 
  '/mois', 
  ARRAY['IA sur mesure complète', 'Workflows illimités', 'BI & Prédictif', 'Contenu IA illimité', 'Account manager dédié', 'SLA 24h'],
  ARRAY[]::TEXT[],
  false,
  NULL,
  'badge-orange',
  'Nous contacter',
  'btn-glass',
  'contact.html?pack=elite',
  3
),
(
  'Enterprise', 
  'Sur mesure', 
  'Sur Devis', 
  NULL, 
  ARRAY['Architecture IA dédiée', 'Équipe intégrée', 'SLA personnalisé', 'Formation équipes', 'IP & code source', 'Audit stratégique annuel'],
  ARRAY[]::TEXT[],
  false,
  NULL,
  'badge-glass',
  'Discutons →',
  'btn-outline',
  'contact.html?pack=enterprise',
  4
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE : audits (Audit IA gratuit — réponses formulaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS audits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  company         TEXT,
  sector          TEXT,
  maturity        TEXT,
  tools           TEXT,
  reach           TEXT,
  top_challenge   TEXT,
  manual_processes TEXT,
  ia_usage        TEXT,
  repetitive_hours TEXT,
  main_goal       TEXT,
  competition     TEXT,
  budget          TEXT,
  message         TEXT,
  maturity_score  INTEGER DEFAULT 0,
  source          TEXT DEFAULT 'audit_page',
  status          TEXT DEFAULT 'new',
  audit_notes     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON audits;
CREATE POLICY "anon_all" ON audits FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audits_created ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_status  ON audits (status);

-- ============================================================
-- INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_published ON blog_posts (published);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_slug      ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON blog_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post   ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_leads_status    ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created   ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_views_page      ON page_views (page);
CREATE INDEX IF NOT EXISTS idx_views_created   ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created  ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pf_sort         ON portfolio_projects (sort_order);

-- ============================================================
-- PROJETS DE DEMO (Portfolio)
-- ============================================================
INSERT INTO portfolio_projects (title, category, image, description, tags, featured, sort_order)
VALUES 
(
  'Nexus E-commerce OS', 
  'Développement Web', 
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80', 
  'Une plateforme e-commerce révolutionnaire avec gestion de stock en temps réel et intégration logistique automatisée.',
  ARRAY['React', 'Node.js', 'PostgreSQL'],
  true,
  1
),
(
  'Aether AI Assistant', 
  'Solutions IA', 
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=80', 
  'Agent intelligent capable de traiter plus de 5000 requêtes clients par jour avec une précision de 94%.',
  ARRAY['Python', 'OpenAI', 'NLP'],
  true,
  2
),
(
  'Luxe Branding Studio', 
  'Brand & UX', 
  'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1000&q=80', 
  'Refonte complète de l''identité visuelle pour un groupe hôtelier de luxe. Création d''un design system modulaire.',
  ARRAY['Figma', 'UI Design', 'Branding'],
  false,
  3
)
ON CONFLICT DO NOTHING;
