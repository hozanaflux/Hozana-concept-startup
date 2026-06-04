const defaultAllowedOrigins = [
  'https://www.hozanaconcept.com',
  'https://hozanaconcept.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

function normalizeOrigin(origin = '') {
  const value = String(origin).trim().replace(/\/$/, '');
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function configuredOrigins() {
  const values = [
    ...defaultAllowedOrigins,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    ...(process.env.ALLOWED_ORIGINS || '').split(',')
  ];
  return new Set(values.map(normalizeOrigin).filter(Boolean));
}

const buckets = global.__hznRateBuckets || (global.__hznRateBuckets = new Map());

function isAllowedOrigin(origin = '') {
  if (!origin) return true;
  if (configuredOrigins().has(normalizeOrigin(origin))) return true;
  try {
    new URL(origin);
    return false;
  } catch {
    return false;
  }
}

function setCors(req, res, methods = 'POST, OPTIONS', headers = 'Content-Type') {
  const origin = req.headers.origin || '';
  if (isAllowedOrigin(origin) && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.hozanaconcept.com');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);
}

function rejectBadOrigin(req, res) {
  const origin = req.headers.origin || '';
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' });
    return true;
  }
  return false;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function rateLimit(req, res, key, limit, windowMs) {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(id) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(id, bucket);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - bucket.count)));
  if (bucket.count > limit) {
    res.status(429).json({ error: 'Too many requests' });
    return true;
  }
  return false;
}

module.exports = { setCors, rejectBadOrigin, rateLimit };
