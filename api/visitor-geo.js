/* ============================================================
   Hozana Concept — Visitor Geo API
   Resolves the visitor IP server-side from Vercel headers, then
   enriches it with public IP geolocation data when available.
   ============================================================ */

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = getClientIp(req);
  const fallback = { ip, country: '', city: '', region: '', timezone: '', isp: '' };

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
