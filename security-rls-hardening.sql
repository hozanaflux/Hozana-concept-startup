-- ============================================================
-- HOZANA CONCEPT — Durcissement RLS Supabase
-- ============================================================
-- A executer uniquement APRES avoir configure dans Vercel :
--   SUPABASE_SERVICE_ROLE_KEY = Service role key Supabase
--
-- Pourquoi :
-- - Le site public garde les lectures/inserts necessaires.
-- - L'administration passe par /api/tables/* avec session admin.
-- - Les operations admin utilisent la service role key cote serveur.
-- ============================================================

-- Activer RLS sur les tables utilisees par le site.
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques trop larges.
DROP POLICY IF EXISTS "anon_all" ON public.blog_posts;
DROP POLICY IF EXISTS "anon_all" ON public.comments;
DROP POLICY IF EXISTS "anon_all" ON public.leads;
DROP POLICY IF EXISTS "anon_all" ON public.page_views;
DROP POLICY IF EXISTS "anon_all" ON public.orders;
DROP POLICY IF EXISTS "anon_all" ON public.packs;
DROP POLICY IF EXISTS "anon_all" ON public.pack_options;
DROP POLICY IF EXISTS "anon_all" ON public.services_list;
DROP POLICY IF EXISTS "anon_all" ON public.portfolio_projects;
DROP POLICY IF EXISTS "anon_all" ON public.audits;
DROP POLICY IF EXISTS "anon_all" ON public.visitor_messages;

DROP POLICY IF EXISTS "public_read_published_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "public_read_approved_comments" ON public.comments;
DROP POLICY IF EXISTS "public_insert_comments" ON public.comments;
DROP POLICY IF EXISTS "public_insert_leads" ON public.leads;
DROP POLICY IF EXISTS "public_insert_page_views" ON public.page_views;
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "public_read_packs" ON public.packs;
DROP POLICY IF EXISTS "public_read_pack_options" ON public.pack_options;
DROP POLICY IF EXISTS "public_read_services" ON public.services_list;
DROP POLICY IF EXISTS "public_read_portfolio" ON public.portfolio_projects;
DROP POLICY IF EXISTS "public_insert_audits" ON public.audits;
DROP POLICY IF EXISTS "public_read_visitor_messages" ON public.visitor_messages;
DROP POLICY IF EXISTS "public_mark_visitor_messages_read" ON public.visitor_messages;

-- Nettoyer les privileges directs du role public, puis ne rendre que le strict minimum.
REVOKE ALL ON public.blog_posts FROM anon;
REVOKE ALL ON public.comments FROM anon;
REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.page_views FROM anon;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.packs FROM anon;
REVOKE ALL ON public.pack_options FROM anon;
REVOKE ALL ON public.services_list FROM anon;
REVOKE ALL ON public.portfolio_projects FROM anon;
REVOKE ALL ON public.audits FROM anon;
REVOKE ALL ON public.visitor_messages FROM anon;

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT ON public.comments TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.page_views TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT ON public.packs TO anon;
GRANT SELECT ON public.pack_options TO anon;
GRANT SELECT ON public.services_list TO anon;
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT INSERT ON public.audits TO anon;
GRANT SELECT, UPDATE (read_at) ON public.visitor_messages TO anon;

-- Contenu public.
CREATE POLICY "public_read_published_posts"
ON public.blog_posts
FOR SELECT TO anon
USING (published = true);

CREATE POLICY "public_read_packs"
ON public.packs
FOR SELECT TO anon
USING (true);

CREATE POLICY "public_read_pack_options"
ON public.pack_options
FOR SELECT TO anon
USING (true);

CREATE POLICY "public_read_services"
ON public.services_list
FOR SELECT TO anon
USING (true);

CREATE POLICY "public_read_portfolio"
ON public.portfolio_projects
FOR SELECT TO anon
USING (true);

-- Commentaires publics : lecture seulement si approuve, insertion toujours non approuvee.
CREATE POLICY "public_read_approved_comments"
ON public.comments
FOR SELECT TO anon
USING (approved = true);

CREATE POLICY "public_insert_comments"
ON public.comments
FOR INSERT TO anon
WITH CHECK (
  approved = false
  AND length(trim(coalesce(content, ''))) BETWEEN 2 AND 2000
);

-- Formulaires publics : insertion seulement.
CREATE POLICY "public_insert_leads"
ON public.leads
FOR INSERT TO anon
WITH CHECK (
  length(trim(concat_ws('', email, phone, name))) > 0
);

CREATE POLICY "public_insert_orders"
ON public.orders
FOR INSERT TO anon
WITH CHECK (
  coalesce(status, 'pending') = 'pending'
  AND length(trim(coalesce(pack, ''))) > 0
);

CREATE POLICY "public_insert_audits"
ON public.audits
FOR INSERT TO anon
WITH CHECK (
  length(trim(concat_ws('', email, phone, name))) > 0
);

-- Analytics public : insertion seulement, sans lecture publique.
CREATE POLICY "public_insert_page_views"
ON public.page_views
FOR INSERT TO anon
WITH CHECK (
  length(trim(coalesce(visitor_id, ''))) > 0
);

-- Messages visiteurs : le navigateur lit ses messages et les marque lus.
-- L'insertion reste reservee a l'admin via service role.
CREATE POLICY "public_read_visitor_messages"
ON public.visitor_messages
FOR SELECT TO anon
USING (
  visitor_id IS NOT NULL
  AND read_at IS NULL
);

CREATE POLICY "public_mark_visitor_messages_read"
ON public.visitor_messages
FOR UPDATE TO anon
USING (
  visitor_id IS NOT NULL
)
WITH CHECK (
  visitor_id IS NOT NULL
  AND read_at IS NOT NULL
);
