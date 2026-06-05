const { prepareApi, isAdminRequest } = require('../server/admin-auth');
const { SUPABASE_URL, supabaseServiceKey } = require('../server/supabase');

function decodeJwtRole(token = '') {
  const parts = String(token).split('.');
  if (parts.length < 2) return { type: token ? 'opaque' : 'missing', role: null };
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return {
      type: 'jwt',
      role: payload.role || null,
      ref: payload.ref || null,
      exp: payload.exp || null
    };
  } catch {
    return { type: 'invalid-jwt', role: null };
  }
}

module.exports = async (req, res) => {
  if (!prepareApi(req, res, 'admin-diagnostics', 20)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required' });

  const serviceKey = supabaseServiceKey();
  const keyInfo = decodeJwtRole(serviceKey);
  const result = {
    ok: false,
    vercel: !!process.env.VERCEL,
    hasServiceKey: !!serviceKey,
    serviceKeyType: keyInfo.type,
    serviceKeyRole: keyInfo.role,
    serviceKeyProjectRef: keyInfo.ref,
    supabaseUrl: SUPABASE_URL,
    tableCheck: null
  };

  if (!serviceKey) return res.status(200).json(result);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=id,title&limit=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      }
    });
    const body = await response.text();
    result.tableCheck = {
      status: response.status,
      ok: response.ok,
      body: body.slice(0, 300)
    };
    result.ok = response.ok;
    return res.status(200).json(result);
  } catch (error) {
    result.tableCheck = { error: error.message };
    return res.status(200).json(result);
  }
};
