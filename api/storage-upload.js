const path = require('path');
const { setCors, rejectBadOrigin, requireAdminWriteHeader, rateLimit } = require('./_security');
const { isAdminRequest } = require('./admin-auth');
const { SUPABASE_URL, supabaseServiceKey } = require('./_supabase');

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_BUCKETS = new Set(['blog-images']);
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(new Error('Image trop lourde (max 5Mo)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function cleanFileName(value = 'upload') {
  return path.basename(String(value)).replace(/[^a-z0-9._-]/gi, '-').slice(-120) || 'upload';
}

function extensionFrom(fileName, contentType) {
  const ext = path.extname(fileName).replace('.', '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/gif') return 'gif';
  return 'jpg';
}

module.exports = async (req, res) => {
  setCors(req, res, 'POST, OPTIONS', 'Content-Type, X-File-Name, X-Hozana-Admin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (rejectBadOrigin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimit(req, res, 'storage-upload', 40, 60 * 60 * 1000)) return;
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Admin session required' });
  if (requireAdminWriteHeader(req, res)) return;
  const serviceKey = supabaseServiceKey();
  if (!serviceKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' });

  const parsed = new URL(req.url, 'http://localhost');
  const bucket = parsed.searchParams.get('bucket') || 'blog-images';
  if (!ALLOWED_BUCKETS.has(bucket)) return res.status(400).json({ error: 'Bucket not allowed' });

  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) return res.status(415).json({ error: 'Format image non autorisé' });

  try {
    const file = await readBody(req);
    if (!file.length) return res.status(400).json({ error: 'Fichier manquant' });

    const originalName = cleanFileName(req.headers['x-file-name'] || 'image');
    const ext = extensionFrom(originalName, contentType);
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body: file
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      return res.status(response.status).send(error || response.statusText);
    }

    return res.status(200).json({
      path: filePath,
      publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
    });
  } catch (error) {
    if (error.message.includes('max 5Mo')) return res.status(413).json({ error: error.message });
    console.error('[Storage Upload] Error:', error.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
};
