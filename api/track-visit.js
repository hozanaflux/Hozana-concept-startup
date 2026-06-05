const { setCors, rejectBadOrigin, rateLimit } = require('./_security');
const { SUPABASE_URL, supabaseServiceKey } = require('./_supabase');

const ALLOWED_FIELDS = new Set([
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

function cleanString(value, max = 240) {
  if (value === undefined || value === null) return null;
  return String(value).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

function cleanNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim();
}

function sanitizePayload(body = {}, req) {
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const payload = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (['latitude', 'longitude', 'accuracy'].includes(key)) payload[key] = cleanNumber(value);
    else payload[key] = cleanString(value, key === 'user_agent' ? 220 : 160);
  }

  payload.page = cleanString(payload.page || 'index', 160);
  payload.visitor_id = cleanString(payload.visitor_id || `v_${Date.now()}`, 80);
  payload.event_type = cleanString(payload.event_type || 'pageview', 40);
  payload.ip_address = payload.ip_address || cleanString(clientIp(req), 80);
  payload.user_agent = payload.user_agent || cleanString(req.headers['user-agent'] || '', 220);
  return payload;
}

module.exports = async (req, res) => {
  setCors(req, res, 'POST, OPTIONS', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (rejectBadOrigin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimit(req, res, 'track-visit', 180, 15 * 60 * 1000)) return;

  const apiKey = supabaseServiceKey();
  if (!apiKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' });

  const payload = sanitizePayload(req.body, req);

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
    console.error('[Track Visit API] Error:', error.message);
    return res.status(500).json({ error: 'Tracking failed' });
  }
};
