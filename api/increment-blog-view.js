const { setCors, rejectBadOrigin, rateLimit } = require('../server/security');
const { SUPABASE_URL, supabaseServiceKey } = require('../server/supabase');

function normalizeId(value) {
  const id = String(value || '').trim();
  return /^[0-9a-f-]{8,}$/i.test(id) ? id : '';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (!req.body) return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

module.exports = async (req, res) => {
  setCors(req, res, 'POST, OPTIONS', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (rejectBadOrigin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimit(req, res, 'blog-view', 120, 15 * 60 * 1000)) return;

  const body = await readBody(req);
  const id = normalizeId(body.id);
  if (!id) return res.status(400).json({ error: 'Invalid post id' });

  const apiKey = supabaseServiceKey();
  if (!apiKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' });

  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  try {
    const readUrl = `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}&select=id,views&limit=1`;
    const readRes = await fetch(readUrl, { headers });
    const rows = await readRes.json().catch(() => []);
    const post = Array.isArray(rows) ? rows[0] : null;
    if (!readRes.ok || !post) return res.status(404).json({ error: 'Post not found' });

    const nextViews = (Number.parseInt(post.views, 10) || 0) + 1;
    const updateUrl = `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ views: nextViews })
    });
    const updated = await updateRes.json().catch(() => []);
    if (!updateRes.ok) return res.status(updateRes.status).json({ error: 'View update failed' });

    const row = Array.isArray(updated) ? updated[0] : updated;
    return res.status(200).json({ ok: true, views: row?.views ?? nextViews });
  } catch (error) {
    console.error('[Blog View] Increment failed:', error.message);
    return res.status(500).json({ error: 'View increment failed' });
  }
};
