-- ============================================================
-- HOZANA CONCEPT — Webhook Blog Statique Automatique
-- Déclenche un build Vercel dès qu'un article est publié ou
-- modifié dans Supabase, puis une GitHub Action génère et commit
-- les pages statiques SEO dans le repo.
--
-- 🔧 Exécuter dans : Supabase Dashboard → SQL Editor
-- 📌 Prérequis : pg_net (pré-installé sur Supabase)
-- ============================================================

-- ============================================================
-- 1. Activer l'extension pg_net (si pas déjà active)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- ============================================================
-- 2. Créer la fonction trigger
--    Envoie une requête HTTP POST à l'API Vercel /api/regenerate-blog.
--    Cette API déclenche GitHub Actions via repository_dispatch.
--    SEULEMENT quand le contenu de l'article est modifié
--    (ignore les màj de vues/likes pour éviter la surcharge)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_blog_posts_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _should_trigger BOOLEAN;
BEGIN
  _should_trigger := false;

  IF TG_OP = 'INSERT' THEN
    IF NEW.published = true THEN
      _should_trigger := true;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.published = true AND (
      OLD.title        IS DISTINCT FROM NEW.title OR
      OLD.slug         IS DISTINCT FROM NEW.slug OR
      OLD.content      IS DISTINCT FROM NEW.content OR
      OLD.excerpt      IS DISTINCT FROM NEW.excerpt OR
      OLD.cover_image  IS DISTINCT FROM NEW.cover_image OR
      OLD.category     IS DISTINCT FROM NEW.category OR
      OLD.author       IS DISTINCT FROM NEW.author OR
      OLD.tags         IS DISTINCT FROM NEW.tags OR
      OLD.published    IS DISTINCT FROM NEW.published OR
      OLD.featured     IS DISTINCT FROM NEW.featured OR
      OLD.read_time    IS DISTINCT FROM NEW.read_time OR
      OLD.publish_date IS DISTINCT FROM NEW.publish_date
    ) THEN
      _should_trigger := true;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.published = true THEN
      _should_trigger := true;
    END IF;
  END IF;

  -- Envoyer la requête à l'API de régénération si nécessaire
  IF _should_trigger THEN
    PERFORM
      net.http_post(
        url := 'https://www.hozanaconcept.com/api/regenerate-blog',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA,
          'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW.*) END,
          'old_record', CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD.*) ELSE NULL END
        )
      );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Créer le trigger sur la table blog_posts
-- ============================================================
DROP TRIGGER IF EXISTS trg_blog_posts_webhook ON public.blog_posts;

CREATE TRIGGER trg_blog_posts_webhook
AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_blog_posts_change();

-- ============================================================
-- ✅ VÉRIFICATION
-- ============================================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'blog_posts';

-- ============================================================
-- ❌ SUPPRESSION (si besoin de désactiver)
-- ============================================================
-- DROP TRIGGER IF EXISTS trg_blog_posts_webhook ON public.blog_posts;
-- DROP FUNCTION IF EXISTS public.handle_blog_posts_change();
