/* ============================================================
   Hozana Concept — Supabase Webhook Endpoint
   Called automatically when a blog_post is inserted/updated
   Triggers static blog regeneration for published articles
   ============================================================ */

const path = require('path');
const { execSync } = require('child_process');

// Optional: set WEBHOOK_SECRET env var in Vercel to secure the endpoint
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;

module.exports = async (req, res) => {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Validate webhook secret (optional but recommended) ──
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
