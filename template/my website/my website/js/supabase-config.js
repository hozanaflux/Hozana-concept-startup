/* ============================================================
   HOZANA CONCEPT — Supabase Configuration
   Tableau de bord Supabase → Settings → API
   ============================================================ */

const SUPABASE_URL  = 'https://leadvqrheziyvrwnbiio.supabase.co';      // ex: https://abcdefgh.supabase.co
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYWR2cXJoZXppeXZyd25iaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MTksImV4cCI6MjA5MzU0OTQxOX0.I-L13gdtuQnsJ4ErEb-SWWfdbMUhWOkTvSFOSkNxsD0'; // clé publique "anon"

// Google Analytics Measurement ID
const GA_ID = 'G-D0GFCE5S90'; // ex: G-XXXXXXXXXX

/* ============================================================
   Credentials Admin (hashés — ne jamais exposer en clair en prod)
   SHA-256 de "admin@hozanaconcept.com" et "Efrolach@19935"
   ============================================================ */
const ADMIN_EMAIL_HASH    = 'a4976d615b70ef9383759e67e205e204fad71ebddeed9ab327662b389c8d21e4';
const ADMIN_PASSWORD_HASH = 'cb2e6d595374831518b59caec6590572569c1d989f19a807e4fc4db9c1a96383';

/* ============================================================
   FETCH INTERCEPTOR
   Redirige automatiquement fetch('tables/X') → Supabase REST API
   Format de réponse conservé identique pour toutes les pages :
     GET list  → { data: [...] }
     GET /id   → objet direct
     POST/PUT  → objet créé/mis à jour
   ============================================================ */
(function () {
  if (SUPABASE_URL === 'REMPLACE_PAR_TON_URL_SUPABASE') return; // pas encore configuré

  const _orig = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input
              : (input && input.url)       ? input.url
              : String(input);

    if (!url.startsWith('tables/')) return _orig(input, init || {});

    const method = ((init && init.method) || 'GET').toUpperCase();

    // Décomposer "tables/tablename/optional-id?querystring"
    const withoutPrefix = url.slice(7);                        // retire "tables/"
    const qIdx          = withoutPrefix.indexOf('?');
    const pathPart      = qIdx >= 0 ? withoutPrefix.slice(0, qIdx) : withoutPrefix;
    const queryStr      = qIdx >= 0 ? withoutPrefix.slice(qIdx + 1) : '';

    const segments  = pathPart.split('/').filter(Boolean);
    const tableName = segments[0];
    const recordId  = segments[1];                             // présent pour les opérations sur un seul enregistrement

    // Paramètres de requête
    const params = new URLSearchParams(queryStr);
    if (recordId) {
      params.set('id', 'eq.' + recordId);
      if (method === 'GET') params.set('limit', '1');
    }

    const supaUrl = SUPABASE_URL + '/rest/v1/' + tableName +
                    (params.toString() ? '?' + params.toString() : '');

    // En-têtes Supabase
    const headers = {
      'apikey':        SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON
    };
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
      headers['Prefer']       = 'return=representation';      // retourner l'enregistrement après écriture
    }
    // Fusionner avec les headers fournis par l'appelant
    if (init && init.headers) {
      Object.assign(headers, init.headers);
    }

    const supaInit = Object.assign({}, init || {}, { method, headers });

    let resp;
    try {
      resp = await _orig(supaUrl, supaInit);
    } catch (e) { throw e; }

    if (!resp.ok) return resp;

    // 204 No Content (DELETE)
    if (resp.status === 204 || resp.headers.get('content-length') === '0') {
      return new Response('null', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let raw;
    try { raw = await resp.json(); } catch (e) { return resp; }

    // Transformer la réponse Supabase vers le format attendu par les pages
    let result;
    if (method === 'GET') {
      result = recordId
        ? (Array.isArray(raw) ? (raw[0] || null) : raw)     // /id → objet direct
        : { data: Array.isArray(raw) ? raw : [] };           // liste → { data: [] }
    } else {
      result = Array.isArray(raw) ? (raw[0] || null) : raw;  // POST/PATCH/PUT → objet
    }

    return new Response(JSON.stringify(result), {
      status:  resp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
