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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : portfolio_projects
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  image       TEXT,
  link        TEXT,
  description TEXT,
  tags        TEXT[],
  sort_order  INTEGER DEFAULT 0,
  featured    BOOLEAN DEFAULT false,
  kpis        JSONB DEFAULT '[]',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  icon           TEXT,
  description    TEXT,
  category_label TEXT,
  features       TEXT[],
  tags           TEXT[],
  sort_order     INTEGER DEFAULT 0,
  is_star        BOOLEAN DEFAULT false,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : packs
-- ============================================================
CREATE TABLE IF NOT EXISTS packs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  price_monthly     INTEGER,
  price_annual      INTEGER,
  description       TEXT,
  features          TEXT[],
  excluded_features TEXT[],
  is_featured       BOOLEAN DEFAULT false,
  badge_text        TEXT,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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
CREATE INDEX IF NOT EXISTS idx_pf_featured     ON portfolio_projects (featured);
CREATE INDEX IF NOT EXISTS idx_pf_sort         ON portfolio_projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_svc_slug        ON services (slug);
CREATE INDEX IF NOT EXISTS idx_packs_slug      ON packs (slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE blog_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs              ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "anon_all" ON blog_posts;
CREATE POLICY "anon_all" ON blog_posts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON comments;
CREATE POLICY "anon_all" ON comments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON leads;
CREATE POLICY "anon_all" ON leads FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON page_views;
CREATE POLICY "anon_all" ON page_views FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON orders;
CREATE POLICY "anon_all" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON portfolio_projects;
CREATE POLICY "anon_all" ON portfolio_projects FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON services;
CREATE POLICY "anon_all" ON services FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all" ON packs;
CREATE POLICY "anon_all" ON packs FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- ARTICLE DE DEMO (optionnel — supprimer si non voulu)
-- ============================================================
INSERT INTO blog_posts (title, slug, category, author, excerpt, content, cover_image, read_time, tags, published, featured)
VALUES (
  'Comment l''IA transforme les PME en 2025',
  'ia-transforme-pme-2025',
  'IA',
  'Marcus Hozana',
  'Découvrez comment les petites et moyennes entreprises adoptent l''intelligence artificielle pour multiplier leur productivité et réduire leurs coûts opérationnels.',
  '<p>L''intelligence artificielle n''est plus réservée aux grandes entreprises. En 2025, les PME adoptent massivement ces technologies pour automatiser leurs processus, personnaliser leur relation client et optimiser leurs coûts.</p><h2>Les 3 usages IA les plus impactants pour les PME</h2><p>1. <strong>Chatbots et service client automatisé</strong> — Disponibilité 24h/24, réponses instantanées, qualification des leads.</p><p>2. <strong>Génération de contenu</strong> — Articles de blog, posts réseaux sociaux, fiches produits générés en minutes.</p><p>3. <strong>Analyse prédictive</strong> — Anticiper les tendances du marché, optimiser les stocks, prévoir les ventes.</p><p>Chez Hozana Concept, nous accompagnons nos clients dans cette transformation digitale avec des solutions sur mesure, adaptées à leur budget et leurs objectifs.</p>',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  6,
  ARRAY['IA', 'PME', 'automatisation', 'growth'],
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;
