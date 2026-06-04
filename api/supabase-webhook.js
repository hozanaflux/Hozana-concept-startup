/* ============================================================
   Hozana Concept — Supabase Webhook Endpoint
   Endpoint secondaire pour déclencher la régénération du blog.
   La voie principale déclenche GitHub Actions pour commiter
   les pages statiques générées dans le repo.
   ============================================================ */

const path = require('path');
const { execSync } = require('child_process');

// Optional: set WEBHOOK_SECRET env var in Vercel to secure the endpoint
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;
const isVercelRuntime = !!process.env.VERCEL;
const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'hozanaflux/Hozana-concept-startup';
const GITHUB_DISPATCH_EVENT = process.env.GITHUB_DISPATCH_EVENT || 'generate-blog';
const { setCors, rejectBadOrigin, rateLimit } = require('./_security');

module.exports = async (req, res) => {
  // ── CORS ──
  setCors(req, res, 'POST, OPTIONS', 'Content-Type, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (rejectBadOrigin(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimit(req, res, 'supabase-webhook', 20, 60 * 60 * 1000)) return;

  // ── Validate webhook secret ──
  if (isVercelRuntime && !WEBHOOK_SECRET) {
    console.error('[Supabase Webhook] WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  const requestSecret = req.headers['x-webhook-secret'] || req.body?.secret;
  if (WEBHOOK_SECRET && requestSecret !== WEBHOOK_SECRET) {
    console.warn('[Supabase Webhook] Invalid secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = req.body || {};
    const event = payload.type || 'unknown';   // INSERT | UPDATE | DELETE
    const table = payload.table || 'unknown';

    console.log(`[Supabase Webhook] Received ${event} on ${table}`);

    // ── Handle payload from pg_net trigger ──
    if (payload.record) {
      const record = payload.record;

      // Check if this is a blog_posts event and the article is published
      if (payload.table === 'blog_posts' || payload.type === 'blog_post_changed') {
        const isPublished = record.published === true || record.published === 'true';
        const wasPublished = payload.old_record
          ? (payload.old_record.published === true || payload.old_record.published === 'true')
          : false;

        // Only regenerate if:
        // - New article was inserted and is published
        // - Existing article was updated and is published (and was not already publishing this)
        if (isPublished) {
          console.log(`[Supabase Webhook] Article "${record.title || record.id}" is published — regenerating...`);
        } else {
          console.log(`[Supabase Webhook] Article "${record.title || record.id}" is not published — skipping regeneration`);
          return res.status(200).json({ success: true, skipped: true, reason: 'not_published' });
        }
      } else if (payload.table === 'packs' || payload.table === 'pack_options' || payload.type === 'pack_changed' || payload.type === 'pack_option_changed') {
        console.log(`[Supabase Webhook] Pack "${record.name || record.id}" changed — regenerating pricing and pack pages...`);
      } else {
        console.log(`[Supabase Webhook] Event on ${table} — no action needed`);
        return res.status(200).json({ success: true, skipped: true, reason: 'wrong_table' });
      }
    } else {
      // ── Handle Simple payload (just a ping) ──
      console.log('[Supabase Webhook] No record in payload — running full regeneration');
    }

    // ── Run the static blog generator ──
    console.log('[Supabase Webhook] Starting static blog generation...');

    if (isVercelRuntime) {
      const githubToken = process.env.GH_TOKEN;
      if (githubToken) {
        const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            event_type: GITHUB_DISPATCH_EVENT,
            client_payload: {
              source: 'supabase-webhook',
              event,
              requested_at: new Date().toISOString()
            }
          })
        });
        if (!ghResponse.ok) {
          const ghError = await ghResponse.text().catch(() => '');
          throw new Error(`GitHub dispatch failed: ${ghResponse.status} ${ghError}`);
        }

        return res.status(202).json({
          success: true,
          mode: 'github-action',
          event,
          message: 'Webhook reçu. GitHub Action déclenchée pour générer et commiter les pages statiques.'
        });
      }

      if (deployHookUrl) {
        const hookResponse = await fetch(deployHookUrl, { method: 'POST' });
        if (!hookResponse.ok) {
          throw new Error(`Deploy hook failed: ${hookResponse.status} ${hookResponse.statusText}`);
        }

        return res.status(202).json({
          success: true,
          mode: 'deploy-hook-only',
          event,
          message: 'Build Vercel déclenché, mais GH_TOKEN manque : les pages ne seront pas commitées dans GitHub.'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'GH_TOKEN manquant',
        message: 'Ajoute GH_TOKEN dans Vercel pour déclencher la GitHub Action qui commit les pages statiques.'
      });
    }

    const generatorPath = path.join(process.cwd(), 'js', 'generate-static-blog.js');
    const output = execSync(`node "${generatorPath}"`, {
      encoding: 'utf8',
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024
    });

    console.log('[Supabase Webhook] Generator output:\n', output);

    const match = output.match(/(\d+)\/\d+ static pages/);
    const generatedCount = match ? parseInt(match[1]) : 0;

    return res.status(200).json({
      success: true,
      generated: generatedCount,
      event,
      message: `${generatedCount} page(s) statique(s) régénérée(s) automatiquement`
    });
  } catch (error) {
    console.error('[Supabase Webhook] Error:', error.message);
    const details = error.stdout || error.stderr || error.message;

    return res.status(500).json({
      success: false,
      error: 'Échec de la régénération via webhook',
      details: details.substring(0, 500)
    });
  }
};
