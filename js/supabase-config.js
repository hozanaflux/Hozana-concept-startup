/* ============================================================
   Hozana Concept — Supabase Configuration
   Tableau de bord Supabase → Settings → API
   ============================================================ */

const SUPABASE_URL  = 'https://leadvqrheziyvrwnbiio.supabase.co';      // ex: https://abcdefgh.supabase.co
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYWR2cXJoZXppeXZyd25iaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MTksImV4cCI6MjA5MzU0OTQxOX0.I-L13gdtuQnsJ4ErEb-SWWfdbMUhWOkTvSFOSkNxsD0'; // clé publique "anon"

// Google Analytics Measurement ID
const GA_ID = 'G-D0GFCE5S90'; // ex: G-XXXXXXXXXX

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

    const tablesIdx = url.indexOf('tables/');
    // Ignore storage and other non-table requests
    if (tablesIdx === -1 || url.includes('/storage/v1/')) return _orig(input, init || {});

    const method = ((init && init.method) || 'GET').toUpperCase();
    const isAdminPage = location.pathname === '/admin' ||
      location.pathname.indexOf('/admin-hozana-concept-admin') !== -1;

    // Décomposer "tables/tablename/optional-id?querystring"
    const withoutPrefix = url.slice(tablesIdx + 7);
    const qIdx          = withoutPrefix.indexOf('?');
    const pathPart      = qIdx >= 0 ? withoutPrefix.slice(0, qIdx) : withoutPrefix;
    const queryStr      = qIdx >= 0 ? withoutPrefix.slice(qIdx + 1) : '';

    const segments  = pathPart.split('/').filter(Boolean);
    const tableName = segments[0];
    const recordId  = segments[1];

    if (isAdminPage) {
      const adminParams = new URLSearchParams(queryStr);
      adminParams.set('table', tableName);
      if (recordId) adminParams.set('recordId', recordId);
      const adminUrl = '/api/tables?' + adminParams.toString();
      return _orig(adminUrl, init || {});
    }

    const params = new URLSearchParams(queryStr);
    if (recordId) {
      params.set('id', 'eq.' + recordId);
      if (method === 'GET') params.set('limit', '1');
    }

    const supaUrl = SUPABASE_URL + '/rest/v1/' + tableName +
                    (params.toString() ? '?' + params.toString() : '');

    const headers = {
      'apikey':        SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON
    };
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
      headers['Prefer']       = 'return=representation';
    }
    if (init && init.headers) {
      Object.assign(headers, init.headers);
    }

    const supaInit = Object.assign({}, init || {}, { method, headers });

    let resp;
    try {
      resp = await _orig(supaUrl, supaInit);
    } catch (e) {
      console.error('[Supabase Interceptor] Fetch error:', e);
      throw e;
    }

    if (!resp.ok) {
      console.warn(`[Supabase Interceptor] ${method} ${tableName} failed:`, resp.status, resp.statusText);
      return resp;
    }

    if (resp.status === 204 || resp.headers.get('content-length') === '0') {
      return new Response('null', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let raw;
    try {
      raw = await resp.json();
    } catch (e) {
      return resp;
    }

    let result;
    if (method === 'GET') {
      result = recordId
        ? (Array.isArray(raw) ? (raw[0] || null) : raw)
        : { data: Array.isArray(raw) ? raw : [] };
    } else {
      result = Array.isArray(raw) ? (raw[0] || null) : raw;
    }

    return new Response(JSON.stringify(result), {
      status:  resp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
