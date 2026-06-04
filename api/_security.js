const allowedOrigins = new Set([
  'https://www.hozanaconcept.com',
  'https://hozanaconcept.com',
  'http://localhost:3000',
  'http://localhost:5173'
]);

const buckets = global.__hznRateBuckets || (global.__hznRateBuckets = new Map());

function isAllowedOrigin(origin = '') {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('.vercel.app');
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
