const crypto = require('crypto');
const { setCors, rejectBadOrigin, rateLimit } = require('./security');

const DEFAULT_EMAIL_HASH = 'a4976d615b70ef9383759e67e205e204fad71ebddeed9ab327662b389c8d21e4';
const DEFAULT_PASSWORD_HASH = 'cb2e6d595374831518b59caec6590572569c1d989f19a807e4fc4db9c1a96383';
const COOKIE_NAME = 'hzn_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function safeEqual(a = '', b = '') {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || (!process.env.VERCEL ? DEFAULT_PASSWORD_HASH : '');
  if (!value) throw new Error('Admin session secret is not configured');
  return value;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = Buffer.from(JSON.stringify({ role:'admin', exp, nonce })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySession(token = '') {
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig || !safeEqual(sign(payload), sig)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function cookieOptions(maxAge = MAX_AGE_SECONDS) {
  return [
    `${COOKIE_NAME}=`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ];
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOptions().slice(1).join('; ')}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${cookieOptions(0).join('; ')}`);
}

function readSession(req) {
  const cookies = String(req.headers.cookie || '');
  const match = cookies.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdminRequest(req) {
  return verifySession(readSession(req));
}

function validCredentials(email, password) {
  const emailHash = process.env.ADMIN_EMAIL_HASH || (!process.env.VERCEL ? DEFAULT_EMAIL_HASH : '');
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || (!process.env.VERCEL ? DEFAULT_PASSWORD_HASH : '');
  if (!emailHash || !passwordHash) return false;
  return safeEqual(sha256(String(email || '').trim().toLowerCase()), emailHash)
    && safeEqual(sha256(password || ''), passwordHash);
}

function prepareApi(req, res, key, limit = 20) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }
  if (rejectBadOrigin(req, res)) return false;
  if (rateLimit(req, res, key, limit, 15 * 60 * 1000)) return false;
  return true;
}

module.exports = {
  createSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  readSession,
  isAdminRequest,
  validCredentials,
  prepareApi
};
