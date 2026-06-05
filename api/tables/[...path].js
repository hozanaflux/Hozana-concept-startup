const { setCors, rejectBadOrigin, requireAdminWriteHeader, rateLimit } = require('../../server/security');
const { isAdminRequest } = require('../../server/admin-auth');
const { SUPABASE_URL, supabaseServiceKey } = require('../../server/supabase');


const ALLOWED_TABLES = new Set([
  'audits',
  'blog_posts',
  'comments',
  'leads',
  'orders',
  'pack_options',
  'packs',
  'page_views',
  'portfolio_projects',
  'services_list',
  'site_settings',
  'visitor_messages'
]);

function buildSupabaseUrl(req) {
  const parsed = new URL(req.url, 'http://localhost');
  const queryPath = req.query?.path || req.query?.['...path'] || req.query?.['[...path]'] || parsed.searchParams.get('path') || '';
  const routePath = Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath);
  const prefix = '/api/tables/';
  const pathnamePath = parsed.pathname.startsWith(prefix)
    ? decodeURIComponent(parsed.pathname).slice(prefix.length)
    : '';
  const apiPath = routePath || (/^\[?\.\.\.path\]?$/.test(pathnamePath) ? '' : pathnamePath);
  const segments = apiPath.split('/').filter(Boolean);
  const table = segments[0];
  const recordId = segments[1];

  if (!ALLOWED_TABLES.has(table)) {
    return { error: 'Table not allowed' };
  }

  const params = new URLSearchParams(parsed.search);
  params.delete('path');

  if (recordId) {
    params.set('id', `eq.${recordId}`);
    if (req.method === 'GET') params.set('limit', '1');
  }

  const query = params.toString();
  return {
    table,
    recordId,
    url: `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}${query ? `?${query}` : ''}`
  };
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (!req.body) return undefined;
  try {
    return JSON.parse(req.body);
  } catch {
    return undefined;
  }
}

function normalizeResponse(method, recordId, raw) {
  if (method === 'GET') {
    return recordId
      ? (Array.isArray(raw) ? (raw[0] || null) : raw)
      : { data: Array.isArray(raw) ? raw : [] };
  }
  return Array.isArray(raw) ? (raw[0] || null) : raw;
}

module.exports = async (req, res) => {
  setCors(req, res, 'GET, POST, PATCH, DELETE, OPTIONS', 'Content-Type, X-Hozana-Admin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (rejectBadOrigin(req, res)) return;

  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rateLimit(req, res, 'admin-tables', 240, 15 * 60 * 1000)) return;

  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'Admin session required' });
  }
  if (requireAdminWriteHeader(req, res)) return;

  const target = buildSupabaseUrl(req);
  if (target.error) return res.status(400).json({ error: target.error });

  const apiKey = supabaseServiceKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' });
  }

  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`
  };

  const init = { method: req.method, headers };
  if (req.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    headers.Prefer = 'return=representation';
    const body = await readJson(req);
    if (body !== undefined) init.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(target.url, init);
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).send(text || response.statusText);
    }

    if (!text) return res.status(200).json(null);

    const raw = JSON.parse(text);
    return res.status(response.status).json(normalizeResponse(req.method, target.recordId, raw));
  } catch (error) {
    console.error('[Admin Tables API] Error:', error.message);
    return res.status(500).json({ error: 'Supabase proxy failed' });
  }
};
