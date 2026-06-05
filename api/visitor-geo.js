/* ============================================================
   Hozana Concept — Visitor Geo API
   Resolves the visitor IP server-side from Vercel headers, then
   enriches it with public IP geolocation data when available.
   ============================================================ */

const { setCors, rejectBadOrigin, rateLimit } = require('../server/security');
const { SUPABASE_URL, supabaseServiceKey } = require('../server/supabase');

const TRACK_FIELDS = new Set([
  'page',
  'visitor_id',
  'referrer',
  'user_agent',
  'ip_address',
  'country',
  'city',
  'region',
  'timezone',
  'isp',
  'device_type',
  'browser_language',
  'latitude',
  'longitude',
  'accuracy',
  'geo_source',
  'event_type'
]);

function firstHeaderValue(value) {
  return String(value || '').split(',')[0].trim();
}

function getClientIp(req) {
  return firstHeaderValue(
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.headers['x-vercel-forwarded-for']
  );
}

function cleanString(value, max = 240) {
  if (value === undefined || value === null) return null;
  return String(value).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

function cleanNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeTrackPayload(body = {}, req) {
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const payload = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (!TRACK_FIELDS.has(key)) continue;
    if (['latitude', 'longitude', 'accuracy'].includes(key)) payload[key] = cleanNumber(value);
    else payload[key] = cleanString(value, key === 'user_agent' ? 220 : 160);
  }

  payload.page = cleanString(payload.page || 'index', 160);
  payload.visitor_id = cleanString(payload.visitor_id || `v_${Date.now()}`, 80);
  payload.event_type = cleanString(payload.event_type || 'pageview', 40);
  payload.ip_address = payload.ip_address || cleanString(getClientIp(req), 80);
  payload.user_agent = payload.user_agent || cleanString(req.headers['user-agent'] || '', 220);
  return payload;
}

async function trackVisit(req, res) {
  if (rateLimit(req, res, 'visitor-track', 180, 15 * 60 * 1000)) return;

  const apiKey = supabaseServiceKey();
  if (!apiKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' });

  const payload = sanitizeTrackPayload(req.body, req);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text || response.statusText);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[Visitor Track] Error:', error.message);
    return res.status(500).json({ error: 'Tracking failed' });
  }
}

module.exports = async (req, res) => {
  setCors(req, res, 'GET, POST, OPTIONS', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (rejectBadOrigin(req, res)) return;
  if (req.method === 'POST') return trackVisit(req, res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimit(req, res, 'visitor-geo', 120, 15 * 60 * 1000)) return;

  const ip = getClientIp(req);
  const fallback = {
    ip,
    country: req.headers['x-vercel-ip-country'] || '',
    city: req.headers['x-vercel-ip-city'] ? decodeURIComponent(String(req.headers['x-vercel-ip-city'])) : '',
    region: req.headers['x-vercel-ip-country-region'] || '',
    timezone: '',
    isp: ''
  };

  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return res.status(200).json(fallback);
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2200);
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'HozanaConceptVisitorGeo/1.0' }
    });
    clearTimeout(timer);

    if (!response.ok) return res.status(200).json(fallback);

    const data = await response.json();
    return res.status(200).json({
      ip,
      country: data.country_name || data.country || '',
      city: data.city || '',
      region: data.region || data.region_code || '',
      timezone: data.timezone || '',
      isp: data.org || data.asn || ''
    });
  } catch {
    return res.status(200).json(fallback);
  }
};
