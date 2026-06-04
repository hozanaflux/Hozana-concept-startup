/* ─── STATE ─── */
// ── Admin credentials hash (fallback si supabase-config.js ne charge pas) ──
if (typeof ADMIN_EMAIL_HASH === 'undefined') {
  window.ADMIN_EMAIL_HASH    = 'a4976d615b70ef9383759e67e205e204fad71ebddeed9ab327662b389c8d21e4';
  window.ADMIN_PASSWORD_HASH = 'cb2e6d595374831518b59caec6590572569c1d989f19a807e4fc4db9c1a96383';
}

let P = [], COM = [], LEADS = [], VIEWS = [], ORDERS = [], PF = [], PACKS = [], OPTIONS = [], SERVICES = [];
let AUDITS = [];
let CH = {};
let _delCb = null;
let _postsFilter = { q: '', cat: '' };
let _leadsFilter = { q: '', status: '' };
let _auditsFilter = { q: '', status: '' };
let _ordersFilter = { q: '', status: '' };
let _notificationsFilter = '';
let _contactsFilter = '';
let _visitorsFilter = '';
let _blockedVisitors = JSON.parse(localStorage.getItem('hzn-blocked-visitors') || '[]');
let _activeLeadId = null;
let _visitorRefreshTimer = null;
const LBLS = { new:'Nouveau', contacted:'Contacté', qualified:'Qualifié', converted:'Converti', lost:'Perdu' };
const PIPE_COLS = ['new','contacted','qualified','converted'];

function slugifyTitle(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'article';
}

function articleStaticPath(post) {
  const slug = post?.slug || slugifyTitle(post?.title || post?.id);
  return post?.published === false ? `/article.html?id=${post.id}` : `/blog-posts/${slug}.html`;
}

/* ─── AUTH ─── */
// ── Fallback SUPABASE config (si supabase-config.js ne charge pas) ──
if (typeof SUPABASE_URL === 'undefined') {
  window.SUPABASE_URL  = 'https://leadvqrheziyvrwnbiio.supabase.co';
  window.SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYWR2cXJoZXppeXZyd25iaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MTksImV4cCI6MjA5MzU0OTQxOX0.I-L13gdtuQnsJ4ErEb-SWWfdbMUhWOkTvSFOSkNxsD0';
}

/* ─── SHA-256 (Web Crypto avec fallback pur JS pour file://) ─── */
async function sha256(s) {
  // Try native Web Crypto (HTTPS/localhost)
  if (window.crypto && window.crypto.subtle) {
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
    } catch (e) { /* fallback to JS below */ }
  }
  // Pure JS fallback (file://, insecure contexts)
  return sha256JS(s);
}

function sha256JS(s) {
  // SHA-256 pure JS implementation (c) Chris Veness, MIT License
  // Convert string to UTF-8 bytes
  const utf8 = unescape(encodeURIComponent(s));
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const ROTR = (n,x) => (x>>>n)|(x<<(32-n));
  const Σ0 = x => ROTR(2,x)^ROTR(13,x)^ROTR(22,x);
  const Σ1 = x => ROTR(6,x)^ROTR(11,x)^ROTR(25,x);
  const σ0 = x => ROTR(7,x)^ROTR(18,x)^(x>>>3);
  const σ1 = x => ROTR(17,x)^ROTR(19,x)^(x>>>10);
  const Ch = (x,y,z) => (x&y)^(~x&z);
  const Maj = (x,y,z) => (x&y)^(x&z)^(y&z);
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  let msg = utf8 + String.fromCharCode(0x80);
  const l = msg.length/4 + 2;
  const N = Math.ceil(l/16);
  const M = new Array(N);
  for (let i=0; i<N; i++) {
    M[i] = new Array(16);
    for (let j=0; j<16; j++) {
      M[i][j] = (msg.charCodeAt(i*64+j*4+0)<<24)|(msg.charCodeAt(i*64+j*4+1)<<16)|(msg.charCodeAt(i*64+j*4+2)<<8)|(msg.charCodeAt(i*64+j*4+3)<<0)>>>0;
    }
  }
  const lenHi = Math.floor(((msg.length-1)*8)/Math.pow(2,32));
  const lenLo = ((msg.length-1)*8)>>>0;
  M[N-1][14] = lenHi;
  M[N-1][15] = lenLo;
  for (let i=0; i<N; i++) {
    const W = new Array(64);
    for (let t=0; t<16; t++) W[t] = M[i][t];
    for (let t=16; t<64; t++) W[t] = (σ1(W[t-2])+W[t-7]+σ0(W[t-15])+W[t-16])>>>0;
    let a=H[0], b=H[1], c=H[2], d=H[3], e=H[4], f=H[5], g=H[6], h=H[7];
    for (let t=0; t<64; t++) {
      const T1 = (h+Σ1(e)+Ch(e,f,g)+K[t]+W[t])>>>0;
      const T2 = (Σ0(a)+Maj(a,b,c))>>>0;
      h=g; g=f; f=e; e=(d+T1)>>>0; d=c; c=b; b=a; a=(T1+T2)>>>0;
    }
    H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
  }
  return H.map(x => ('00000000'+(x>>>0).toString(16)).slice(-8)).join('');
}
function togglePwd() {
  const i = document.getElementById('l-pass');
  const ic = document.getElementById('eye-ico');
  i.type = i.type === 'password' ? 'text' : 'password';
  ic.className = i.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}
async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('l-btn');
  const err = document.getElementById('l-err');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification…';
  err.style.display = 'none';
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const pass  = document.getElementById('l-pass').value;
  try {
    const [eh, ph] = await Promise.all([sha256(email), sha256(pass)]);
    if (eh === ADMIN_EMAIL_HASH && ph === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem('hzn-auth', '1');
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-app').style.display = 'flex';
      initApp();
    } else {
      err.style.display = 'block';
      err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Email ou mot de passe incorrect';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
    }
  } catch {
    err.style.display = 'block';
    err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erreur, réessayez.';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
  }
}
function doLogout() {
  sessionStorage.removeItem('hzn-auth');
  location.reload();
}

/* ─── NAVIGATION ─── */
const TITLES = { dashboard:'Dashboard', analytics:'Analytics', notifications:'Notifications', articles:'Articles', portfolio:'Portfolio', leads:'Leads CRM', audits:'Audits IA', packs:'Packs Tarifs', publication:'Centre publication', orders:'Commandes', contacts:'Base contacts', visitors:'Visiteurs', services:'Services', comments:'Commentaires', settings:'Paramètres' };
const CTA = { articles:{ label:'Nouvel article', fn:'openArticleModal()' }, portfolio:{ label:'Nouveau projet', fn:'openPfModal()' }, packs:{ label:'Nouveau pack', fn:'openPackModal()' }, services:{ label:'Nouveau service', fn:'openServiceModal()' } };
function nav(btn, panel) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-'+panel)?.classList.add('active');
  document.getElementById('page-title').textContent = TITLES[panel] || panel;
  const cta = CTA[panel];
  const ctaEl = document.getElementById('topbar-cta');
  if (cta) {
    ctaEl.innerHTML = `<i class="fas fa-plus"></i> ${cta.label}`;
    ctaEl.setAttribute('onclick', cta.fn);
    ctaEl.style.display = '';
  } else {
    ctaEl.style.display = 'none';
  }
  // Trigger renders when entering specific panels to ensure visibility
  if (panel === 'dashboard') { renderDashLeads(); renderDashPosts(); renderCharts(); }
  if (panel === 'analytics') renderAnalytics();
  if (panel === 'notifications') renderNotifications();
  if (panel === 'articles')  applyPostsFilter();
  if (panel === 'portfolio') renderPortfolio();
  if (panel === 'leads')     renderLeads();
  if (panel === 'audits')    renderAudits();
  if (panel === 'packs')     { renderPacks(); renderOptions(); }
  if (panel === 'publication') renderPublicationCenter();
  if (panel === 'contacts') renderContacts();
  if (panel === 'visitors') { renderVisitors(); refreshVisitorsOnly(); }
  if (panel === 'services')  renderServices();
  if (panel === 'orders')    renderOrders();
  if (panel === 'comments')  renderComments();

  document.getElementById('sidebar').classList.remove('open');
}

/* ─── DATA LOAD ─── */
async function initApp() {
  await loadAll();
}
async function loadAll() {
  console.log('[Admin] Loading data...');
  try {
    const [pr,cr,lr,vr,or,pfr, pkr, opr, svr, ar] = await Promise.allSettled([
      fetch('tables/blog_posts?order=created_at.desc&limit=200').then(r=>r.json()),
      fetch('tables/comments?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/leads?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/page_views?order=created_at.desc&limit=1000').then(r=>r.json()),
      fetch('tables/orders?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/portfolio_projects?order=sort_order.asc&limit=200').then(r=>r.json()),
      fetch('tables/packs?order=sort_order.asc&limit=50').then(r=>r.json()),
      fetch('tables/pack_options?order=sort_order.asc&limit=100').then(r=>r.json()),
      fetch('tables/services_list?order=sort_order.asc&limit=50').then(r=>r.json()),
      fetch('tables/audits?order=created_at.desc&limit=100').then(r=>r.json()),
    ]);
    
    if (ar.status==='fulfilled' && ar.value) AUDITS = Array.isArray(ar.value.data) ? ar.value.data : [];
    
    if (pr.status==='fulfilled' && pr.value) P = pr.value.data || [];
    if (cr.status==='fulfilled' && cr.value) COM = cr.value.data || [];
    if (lr.status==='fulfilled' && lr.value) LEADS = lr.value.data || [];
    if (vr.status==='fulfilled' && vr.value) VIEWS = vr.value.data || [];
    if (or.status==='fulfilled' && or.value) ORDERS = or.value.data || [];
    if (pfr.status==='fulfilled' && pfr.value) PF = pfr.value.data || [];
    if (pkr.status==='fulfilled' && pkr.value) PACKS = (pkr.value.data || []).filter(p => packItemType(p) !== 'option');
    if (opr.status==='fulfilled' && opr.value) OPTIONS = opr.value.data || [];
    if (svr.status==='fulfilled' && svr.value) SERVICES = svr.value.data || [];

    console.log('[Admin] Data loaded:', { posts: P.length, leads: LEADS.length, packs: PACKS.length, options: OPTIONS.length });
  } catch(e) { 
    console.error('[Admin] loadAll error:', e);
    toast('Erreur de chargement','err'); 
  }

  updateBadges();
  renderKPIs();
  renderDashLeads();
  renderDashPosts();
  renderCharts();
  renderCockpit();
  renderNotifications();
  renderPublicationCenter();
  renderContacts();
  renderVisitors();
  applyPostsFilter();
  renderPortfolio();
  renderLeads();
  renderPacks();
  renderOptions();
  renderServices();
  renderOrders();
  renderAudits();
  startAdminVisitorRefresh();
}
async function refreshVisitorsOnly() {
  try {
    const r = await fetch('tables/page_views?order=created_at.desc&limit=1000');
    const j = await r.json();
    VIEWS = j.data || [];
    renderVisitors();
  } catch {}
}
function startAdminVisitorRefresh() {
  if (_visitorRefreshTimer) return;
  _visitorRefreshTimer = setInterval(() => {
    if (document.getElementById('panel-visitors')?.classList.contains('active')) {
      refreshVisitorsOnly();
    }
  }, 15000);
}
async function refreshAll() {
  toast('Actualisation…','info');
  await loadAll();
  toast('Données mises à jour ✓','ok');
}

/* ─── BADGES ─── */
function updateBadges() {
  set('badge-posts', P.length);
  set('badge-pf', PF.length);
  set('badge-com', COM.filter(c=>!c.approved).length||COM.length);
  set('badge-leads', LEADS.filter(l=>l.status==='new').length);
  set('badge-audits', AUDITS.filter(a=>a.status==='new').length);
  set('badge-orders', ORDERS.filter(o=>o.status==='paid').length);
  set('badge-packs', PACKS.length);
  set('badge-notifs', getNotifications().filter(n=>!isNotificationRead(n.id)).length);
}
function set(id,v) { const el=document.getElementById(id); if(el) el.textContent=v; }

/* ─── KPIs ─── */
function renderKPIs() {
  const newLeads = LEADS.filter(l=>l.status==='new').length;
  const pubPosts = P.filter(p=>p.published!==false).length;
  const paid = ORDERS.filter(o=>o.status==='paid');
  const rev  = paid.reduce((s,o)=>s+(parseInt(o.amount)||0),0);
  const topPack = (() => {
    const m={}; paid.forEach(o=>{ m[o.pack]=(m[o.pack]||0)+1; });
    const e=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];
    return e?e[0]:'—';
  })();
  set('k-leads', LEADS.length);
  set('k-leads-new', `↑ ${newLeads} nouveau${newLeads>1?'x':''} ce mois`);
  set('k-posts', pubPosts);
  set('k-posts-sub', `${P.length} total · ${P.length-pubPosts} brouillon${P.length-pubPosts!==1?'s':''}`);
  set('k-orders', paid.length);
  set('k-orders-sub', `Pack: ${topPack}`);
  set('k-rev', rev.toLocaleString('fr-FR')+'€');
  set('ord-paid', paid.length);
  set('ord-rev', rev.toLocaleString('fr-FR')+'€');
  set('ord-top', topPack);
}

/* ─── DASHBOARD TABLES ─── */
const SB = { new:'badge-blue', contacted:'badge-yellow', qualified:'badge-purple', converted:'badge-green', lost:'badge-gray' };
function renderDashLeads() {
  const el = document.getElementById('dash-leads');
  const data = LEADS.slice(0,5);
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun lead pour l'instant</td></tr>`; return; }
  el.innerHTML = data.map(l=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="avatar">${(l.name||l.email||'?')[0].toUpperCase()}</div>
        <div><div class="t-strong t-sm">${l.name||l.email||'—'}</div><div class="t-muted">${l.company||''}</div></div>
      </div></td>
      <td class="t-muted t-sm">${l.service||'—'}</td>
      <td class="t-muted t-sm">${l.source||'—'}</td>
      <td><span class="badge ${SB[l.status]||'badge-blue'}">${LBLS[l.status]||'Nouveau'}</span></td>
      <td class="t-muted t-sm">${fmt(l.created_at)}</td>
      <td><div class="acts">
        <button class="act" onclick="viewLead('${l.id}')" title="Voir détails"><i class="fas fa-eye"></i></button>
      </div></td>
    </tr>`).join('');
}
function renderDashPosts() {
  const el = document.getElementById('dash-posts');
  if (!el) return;
  const data = [...P].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="5">Aucun article</td></tr>`; return; }
  el.innerHTML = data.map(p=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="thumb-wrap" style="width:40px;height:28px;">
          ${p.cover_image ? `<img class="thumb" src="${p.cover_image}" onerror="this.parentElement.innerHTML='<i class=\'fas fa-image\' style=\'font-size:.6rem;color:var(--muted);\'></i>'">` : `<i class="fas fa-image" style="font-size:.6rem;color:var(--muted);"></i>`}
        </div>
        <div class="text-clip t-strong" style="max-width:160px;">${p.title}</div>
      </div></td>
      <td><span class="badge badge-red">${p.category||'—'}</span></td>
      <td class="t-sm">${(p.views||0).toLocaleString()}</td>
      <td class="t-sm">❤️ ${p.likes||0}</td>
      <td><span class="badge ${p.published!==false?'badge-green':'badge-gray'}">${p.published!==false?'Publié':'Brouillon'}</span></td>
    </tr>`).join('');
}

/* ─── CHARTS ─── */
const CO = { responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ labels:{ color:'rgba(240,240,245,.5)', font:{ family:'Space Grotesk', size:11 } } } },
  scales:{ x:{ ticks:{ color:'rgba(240,240,245,.35)', font:{size:10} }, grid:{ color:'rgba(255,255,255,.05)' } },
           y:{ ticks:{ color:'rgba(240,240,245,.35)', font:{size:10} }, grid:{ color:'rgba(255,255,255,.05)' } } }
};
function mkChart(id, type, labels, datasets, extraOpts={}) {
  const canvas = document.getElementById(id);
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (CH[id]) CH[id].destroy();
  CH[id] = new Chart(ctx, { type, data:{ labels, datasets }, options: Object.assign({},CO,extraOpts) });
}

function renderCharts() {
  // Leads line (30j)
  const days=[]; const dayCounts=[];
  for (let i=29;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    days.push(i===0?'Auj.':i===1?'Hier':d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'}));
    dayCounts.push(LEADS.filter(l=>l.created_at&&l.created_at.startsWith&&l.created_at.startsWith(ds)).length);
  }
  mkChart('chart-leads-line','line',
    days.filter((_,i)=>i%3===0||i===29), dayCounts.filter((_,i)=>i%3===0||i===29),
    [{ label:'Leads', data:dayCounts.filter((_,i)=>i%3===0||i===29),
      borderColor:'#FF2E2E', backgroundColor:'rgba(255,46,46,.08)',
      fill:true, tension:.4, pointRadius:3, pointBackgroundColor:'#FF2E2E', borderWidth:2 }]);

  // Leads donut
  const src={}; LEADS.forEach(l=>{ src[l.source||'direct']=(src[l.source||'direct']||0)+1; });
  const srcLabels = Object.keys(src).length ? Object.keys(src) : ['Aucune donnée'];
  const srcData = Object.values(src).length ? Object.values(src) : [1];
  mkChart('chart-leads-donut','doughnut',
    srcLabels, [{ data:srcData,
      backgroundColor:Object.keys(src).length ? ['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6','#f59e0b'] : ['rgba(255,255,255,.12)'],
      borderWidth:0, hoverOffset:8 }],
    { scales:{}, plugins:{ legend:{ position:'bottom', labels:{ color:'rgba(240,240,245,.5)', boxWidth:12, font:{size:11} } } } });
}

function renderAnalytics() {
  const totalLikes = P.reduce((s,p)=>s+(p.likes||0),0);
  const uniq = new Set(VIEWS.map(v=>v.visitor_id)).size;
  const conv = VIEWS.length>0?((LEADS.length/VIEWS.length)*100).toFixed(1):'0';
  set('an-views', VIEWS.length.toLocaleString());
  set('an-uniq', uniq.toLocaleString());
  set('an-likes', totalLikes.toLocaleString());
  set('an-conv', conv+'%');

  // Pages table
  const pMap={}; VIEWS.forEach(v=>{ pMap[v.page||'index.html']=(pMap[v.page||'index.html']||0)+1; });
  const tot = Object.values(pMap).reduce((s,v)=>s+v,0);
  const el = document.getElementById('an-pages');
  el.innerHTML = Object.entries(pMap).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([pg,cnt])=>`
    <tr>
      <td class="t-sm">${pg}</td>
      <td class="t-sm">${cnt}</td>
      <td><div style="display:flex;align-items:center;gap:.5rem;">
        <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;width:80px;overflow:hidden;">
          <div style="height:100%;width:${tot?Math.round(cnt/tot*100):0}%;background:var(--grad);border-radius:3px;"></div>
        </div>
        <span class="t-sm">${tot?Math.round(cnt/tot*100):0}%</span>
      </div></td>
    </tr>`).join('')||`<tr class="empty-row"><td colspan="3">Aucune donnée</td></tr>`;

  // Cat chart
  setTimeout(()=>{
    const cc={}; P.forEach(p=>{ cc[p.category||'IA']=(cc[p.category||'IA']||0)+1; });
    mkChart('chart-cat','bar',Object.keys(cc),
      [{ data:Object.values(cc), backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6'],
        borderRadius:4, borderWidth:0 }],
      { scales:CO.scales, plugins:{ legend:{display:false} } });

    const pc={}; ORDERS.filter(o=>o.status==='paid').forEach(o=>{ pc[o.pack]=(pc[o.pack]||0)+1; });
    mkChart('chart-packs','doughnut',Object.keys(pc),
      [{ data:Object.values(pc), backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e'], borderWidth:0, hoverOffset:6 }],
      { scales:{}, plugins:{ legend:{ position:'bottom', labels:{ color:'rgba(240,240,245,.5)', boxWidth:12, font:{size:11} } } } });
  }, 80);
}

/* ─── COCKPIT / NOTIFICATIONS / CONTACTS / VISITORS ─── */
function nowMs() { return Date.now(); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.getTime(); }
function asTime(value) { const t = value ? new Date(value).getTime() : 0; return Number.isFinite(t) ? t : 0; }
function recent(items, days = 7) { const min = daysAgo(days); return items.filter(x => asTime(x.created_at || x.updated_at) >= min); }
function notificationReadIds() { return JSON.parse(localStorage.getItem('hzn-read-notifs') || '[]'); }
function saveNotificationReadIds(ids) { localStorage.setItem('hzn-read-notifs', JSON.stringify([...new Set(ids)])); }
function isNotificationRead(id) { return notificationReadIds().includes(id); }

function getNotifications() {
  const items = [];
  LEADS.filter(l => l.status === 'new').forEach(l => items.push({
    id:`lead:${l.id}`, type:'lead', level:'hot', date:l.created_at, title:`Nouveau lead: ${l.name || l.email || 'Contact'}`,
    text:`${l.service || 'Service non précisé'} · ${l.email || 'email absent'}`, action:`viewLead('${l.id}')`
  }));
  LEADS.filter(isLeadFollowupDue).forEach(l => items.push({
    id:`followup:${l.id}`, type:'followup', level:'moderate', date:getLeadCRMState(l.id).followup || l.created_at, title:`Relance CRM: ${l.name || l.email || 'Contact'}`,
    text:`Score ${leadScore(l)}/100 · ${l.service || 'service non précisé'}`, action:`viewLead('${l.id}')`
  }));
  AUDITS.filter(a => a.status === 'new').forEach(a => items.push({
    id:`audit:${a.id}`, type:'audit', level:'hot', date:a.created_at, title:`Audit IA à traiter: ${a.name || a.email || 'Prospect'}`,
    text:`Score ${a.maturity_score || '?'}/10 · ${a.company || 'Entreprise non précisée'}`, action:`viewAudit('${a.id}')`
  }));
  COM.filter(c => !c.approved).forEach(c => items.push({
    id:`comment:${c.id}`, type:'comment', level:'moderate', date:c.created_at, title:`Commentaire en attente`,
    text:`${c.author_name || 'Anonyme'} · ${(c.content || '').slice(0, 90)}`, action:`nav(document.querySelector('[data-panel=comments]'),'comments')`
  }));
  ORDERS.filter(o => o.status === 'pending').forEach(o => items.push({
    id:`order:${o.id}`, type:'order', level:'money', date:o.created_at, title:`Commande en attente: ${o.pack || 'Pack'}`,
    text:`${o.email || 'email absent'} · ${o.amount || 0}€`, action:`nav(document.querySelector('[data-panel=orders]'),'orders')`
  }));
  P.filter(p => p.published === false).forEach(p => items.push({
    id:`draft:${p.id}`, type:'draft', level:'info', date:p.updated_at || p.created_at, title:`Article en brouillon`,
    text:p.title || 'Sans titre', action:`editArticle('${p.id}')`
  }));
  return items.sort((a,b) => asTime(b.date) - asTime(a.date));
}

function renderCockpit() {
  renderOpsPriorities();
  renderOpsPublication();
  renderOpsVisitors();
}

function renderOpsPriorities() {
  const el = document.getElementById('ops-priorities');
  if (!el) return;
  const items = getNotifications().filter(n => !isNotificationRead(n.id)).slice(0, 6);
  if (!items.length) { el.innerHTML = `<div class="ops-empty">Aucune priorité urgente.</div>`; return; }
  el.innerHTML = items.map(n => `
    <button class="ops-item ${n.level}" onclick="markNotificationRead('${n.id}');${n.action}">
      <span class="ops-dot"></span>
      <span><strong>${escapeText(n.title)}</strong><small>${escapeText(n.text)} · ${fmt(n.date)}</small></span>
    </button>`).join('');
}

function renderOpsPublication() {
  const el = document.getElementById('ops-publication');
  if (!el) return;
  const published = P.filter(p => p.published !== false).length;
  const drafts = P.filter(p => p.published === false).length;
  const packs = PACKS.length;
  const options = OPTIONS.length;
  el.innerHTML = `
    <div class="ops-metric"><span>Articles publiés</span><strong>${published}</strong></div>
    <div class="ops-metric"><span>Brouillons</span><strong>${drafts}</strong></div>
    <div class="ops-metric"><span>Packs / options</span><strong>${packs} / ${options}</strong></div>
    <div class="ops-metric"><span>Pages EN</span><strong>32</strong></div>`;
}

function renderOpsVisitors() {
  const el = document.getElementById('ops-visitors');
  if (!el) return;
  const visitors = getVisitorRows().slice(0, 5);
  if (!visitors.length) { el.innerHTML = `<div class="ops-empty">Aucun visiteur enregistré.</div>`; return; }
  el.innerHTML = visitors.map(v => `
    <div class="ops-item">
      <span class="ops-dot"></span>
      <span><strong>${escapeText(v.page || 'Page inconnue')}</strong><small>${escapeText(visitorLocation(v))} · ${fmt(v.last_seen)}</small></span>
    </div>`).join('');
}

function renderNotifications() {
  const list = document.getElementById('notifications-list');
  const all = getNotifications();
  set('notifs-count', all.length);
  updateBadges();
  if (!list) return;
  const data = all.filter(n => _notificationsFilter === 'read' ? isNotificationRead(n.id) : _notificationsFilter === 'unread' ? !isNotificationRead(n.id) : true);
  if (!data.length) { list.innerHTML = `<div class="empty-panel">Aucune notification dans ce filtre.</div>`; return; }
  list.innerHTML = data.map(n => {
    const read = isNotificationRead(n.id);
    return `
      <div class="notif-row ${read ? 'read' : 'unread'}">
        <button class="notif-main" onclick="markNotificationRead('${n.id}');${n.action}">
          <span class="notif-icon ${n.level}"><i class="fas fa-${n.type === 'order' ? 'shopping-cart' : n.type === 'comment' ? 'comments' : n.type === 'audit' ? 'clipboard-check' : n.type === 'draft' ? 'pen' : 'user-plus'}"></i></span>
          <span><strong>${escapeText(n.title)}</strong><small>${escapeText(n.text)} · ${fmt(n.date)}</small></span>
        </button>
        <button class="act" onclick="toggleNotificationRead('${n.id}')" title="${read ? 'Marquer non lu' : 'Marquer lu'}"><i class="fas fa-${read ? 'envelope' : 'check'}"></i></button>
      </div>`;
  }).join('');
}

function filterNotifications(value) { _notificationsFilter = value; renderNotifications(); }
function markNotificationRead(id) { saveNotificationReadIds([...notificationReadIds(), id]); updateBadges(); renderCockpit(); }
function toggleNotificationRead(id) {
  const ids = notificationReadIds();
  saveNotificationReadIds(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  renderNotifications(); renderCockpit();
}
function markAllNotificationsRead() {
  saveNotificationReadIds(getNotifications().map(n => n.id));
  renderNotifications(); renderCockpit(); toast('Notifications marquées comme lues ✓', 'ok');
}

function renderPublicationCenter() {
  set('pub-blog-status', `${P.filter(p=>p.published!==false).length} articles publiés · ${P.filter(p=>p.published===false).length} brouillons`);
  set('pub-packs-status', `${PACKS.length} packs · ${OPTIONS.length} options complémentaires`);
  const el = document.getElementById('publication-checklist');
  if (!el) return;
  const checks = [
    ['Articles publiés', P.filter(p=>p.published!==false).length > 0, `${P.filter(p=>p.published!==false).length} actifs`],
    ['Images de couverture blog', P.filter(p=>p.published!==false).every(p=>!!p.cover_image), 'Recommandé pour SEO/social'],
    ['Packs visibles', PACKS.length > 0, `${PACKS.length} packs configurés`],
    ['Options achat', OPTIONS.length > 0, `${OPTIONS.length} option(s)`],
    ['Commentaires à modérer', COM.filter(c=>!c.approved).length === 0, `${COM.filter(c=>!c.approved).length} en attente`],
    ['Version anglaise', true, '/en généré au build']
  ];
  el.innerHTML = checks.map(([label, ok, meta]) => `
    <div class="check-item ${ok ? 'ok' : 'warn'}">
      <i class="fas fa-${ok ? 'check-circle' : 'exclamation-circle'}"></i>
      <span><strong>${label}</strong><small>${meta}</small></span>
    </div>`).join('');
}

function getContacts() {
  const map = new Map();
  const add = (item, origin) => {
    const email = (item.email || '').trim().toLowerCase();
    const phone = (item.phone || item.telephone || '').trim();
    const key = email || phone || `${origin}:${item.id}`;
    if (!key) return;
    const prev = map.get(key) || {};
    map.set(key, {
      name: prev.name || item.name || [item.firstname, item.lastname].filter(Boolean).join(' ') || '',
      email: prev.email || email,
      phone: prev.phone || phone,
      company: prev.company || item.company || '',
      origin: [...new Set([...(prev.origin ? prev.origin.split(', ') : []), origin])].join(', '),
      last: Math.max(asTime(prev.last), asTime(item.created_at || item.updated_at))
    });
  };
  LEADS.forEach(x => add(x, 'Lead'));
  AUDITS.forEach(x => add(x, 'Audit'));
  ORDERS.forEach(x => add(x, 'Commande'));
  return [...map.values()].sort((a,b)=>b.last-a.last);
}

function renderContacts() {
  const el = document.getElementById('contacts-body');
  const contacts = getContacts().filter(c => {
    const q = _contactsFilter;
    return !q || [c.name,c.email,c.phone,c.company,c.origin].join(' ').toLowerCase().includes(q);
  });
  set('contacts-count', contacts.length);
  if (!el) return;
  if (!contacts.length) { el.innerHTML = `<tr class="empty-row"><td colspan="6">Aucun contact</td></tr>`; return; }
  el.innerHTML = contacts.map(c => `
    <tr>
      <td class="t-strong t-sm">${escapeText(c.name || '—')}</td>
      <td class="t-muted t-sm">${escapeText(c.email || '—')}</td>
      <td class="t-muted t-sm">${escapeText(c.phone || '—')}</td>
      <td class="t-muted t-sm">${escapeText(c.company || '—')}</td>
      <td><span class="badge badge-blue">${escapeText(c.origin)}</span></td>
      <td class="t-muted t-sm">${c.last ? fmt(new Date(c.last).toISOString()) : '—'}</td>
    </tr>`).join('');
}
function filterContacts(q) { _contactsFilter = q.toLowerCase(); renderContacts(); }
function exportContactsCSV() {
  const rows = [['Nom','Email','Téléphone','Entreprise','Origine','Dernière activité'], ...getContacts().map(c => [c.name,c.email,c.phone,c.company,c.origin,c.last ? new Date(c.last).toISOString() : ''])];
  downloadText('hozana-contacts.csv', rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n'), 'text/csv');
}
function exportContactsPDF() {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) return toast('Librairie PDF indisponible', 'err');
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  doc.setFontSize(16); doc.text('Hozana Concept - Base contacts', 40, 42);
  doc.setFontSize(9);
  let y = 70;
  getContacts().slice(0, 80).forEach((c, i) => {
    if (y > 780) { doc.addPage(); y = 42; }
    doc.text(`${i+1}. ${c.name || '-'} | ${c.email || '-'} | ${c.phone || '-'} | ${c.origin}`, 40, y);
    y += 16;
  });
  doc.save('hozana-contacts.pdf');
}

function getVisitorRows() {
  const map = new Map();
  VIEWS.forEach(v => {
    const key = v.visitor_id || v.ip_address || v.ip || `${v.page}:${v.created_at}`;
    const prev = map.get(key) || { views:0, pages:new Set() };
    prev.id = key;
    prev.views += 1;
    prev.pages.add(v.page || 'index');
    prev.page = v.page || prev.page;
    prev.referrer = v.referrer || prev.referrer || 'direct';
    prev.ip = v.ip_address || v.ip || prev.ip || '—';
    prev.country = v.country || prev.country || '';
    prev.city = v.city || prev.city || '';
    prev.region = v.region || prev.region || '';
    prev.timezone = v.timezone || prev.timezone || '';
    prev.isp = v.isp || prev.isp || '';
    prev.device_type = v.device_type || prev.device_type || '';
    prev.browser_language = v.browser_language || prev.browser_language || '';
    prev.latitude = v.latitude || prev.latitude || '';
    prev.longitude = v.longitude || prev.longitude || '';
    prev.accuracy = v.accuracy || prev.accuracy || '';
    prev.geo_source = v.geo_source || prev.geo_source || '';
    prev.user_agent = v.user_agent || prev.user_agent || '';
    prev.last_seen = Math.max(asTime(prev.last_seen), asTime(v.created_at));
    map.set(key, prev);
  });
  return [...map.values()].sort((a,b)=>b.last_seen-a.last_seen);
}
function visitorLocation(v) { return [v.city, v.country].filter(Boolean).join(', ') || 'Localisation non disponible'; }
function visitorMapUrl(v) {
  if (v.latitude && v.longitude) {
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},18z`;
    }
  }
  const q = [v.city, v.region, v.country].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}
function visitorAccuracyLabel(v) {
  if (v.latitude && v.longitude) return `GPS ±${v.accuracy || '?'} m`;
  return v.geo_source === 'gps' ? 'GPS' : 'IP approximative';
}
function isVisitorOnline(v) { return v.last_seen && (Date.now() - v.last_seen) <= 5 * 60 * 1000; }
function visitorDevice(ua='') {
  const s = String(ua);
  if (!s) return 'Appareil non disponible';
  const os = /Android/i.test(s) ? 'Android' : /iPhone|iPad|iPod/i.test(s) ? 'iOS' : /Windows/i.test(s) ? 'Windows' : /Mac OS/i.test(s) ? 'Mac' : /Linux/i.test(s) ? 'Linux' : 'Appareil';
  const browser = /Edg/i.test(s) ? 'Edge' : /Chrome|CriOS/i.test(s) ? 'Chrome' : /Firefox|FxiOS/i.test(s) ? 'Firefox' : /Safari/i.test(s) ? 'Safari' : 'Navigateur';
  return `${os} · ${browser}`;
}
function visitorDeviceDetails(v) {
  const type = v.device_type ? `${v.device_type[0].toUpperCase()}${v.device_type.slice(1)}` : visitorDevice(v.user_agent);
  const lang = v.browser_language ? ` · ${v.browser_language}` : '';
  return `${type}${lang}`;
}
function renderVisitors() {
  const allRows = getVisitorRows();
  const rows = getVisitorRows().filter(v => {
    const q = _visitorsFilter;
    return !q || [v.id,v.page,v.ip,v.country,v.city,v.region,v.isp,v.timezone,v.referrer,v.device_type,v.browser_language,v.latitude,v.longitude].join(' ').toLowerCase().includes(q);
  });
  set('vis-online', allRows.filter(isVisitorOnline).length);
  set('vis-views', VIEWS.length);
  set('vis-locations', allRows.filter(v=>v.country||v.city).length);
  set('vis-blocked', _blockedVisitors.length);
  const el = document.getElementById('visitors-body');
  if (!el) return;
  if (!rows.length) { el.innerHTML = `<tr class="empty-row"><td colspan="7">Aucune visite</td></tr>`; return; }
  el.innerHTML = rows.map(v => {
    const blocked = _blockedVisitors.includes(v.id) || _blockedVisitors.includes(v.ip);
    const online = isVisitorOnline(v);
    const mapUrl = visitorMapUrl(v);
    const hasGps = !!(v.latitude && v.longitude);
    const locHtml = hasGps ? `
      <div class="t-strong" style="color:#4ade80;">GPS précis</div>
      <div class="t-muted" style="font-size:.68rem;">${escapeText(`${v.latitude}, ${v.longitude}`)}</div>
      <div class="t-muted" style="font-size:.68rem;">${escapeText(visitorAccuracyLabel(v))} · IP: ${escapeText(visitorLocation(v))}</div>` : `
      <div>${escapeText(visitorLocation(v))}</div>
      <div class="t-muted" style="font-size:.68rem;">${escapeText([v.region, v.timezone].filter(Boolean).join(' · ') || '—')}</div>
      <div class="t-muted" style="font-size:.68rem;">${escapeText(visitorAccuracyLabel(v))}</div>`;
    return `
      <tr>
        <td><div class="t-strong t-sm ${online ? 'online-dot' : 'online-dot offline-dot'}">${escapeText(String(v.id).slice(0, 18))}</div><div class="t-muted">${online ? 'En ligne' : 'Hors ligne'} · ${v.views} vue(s)</div></td>
        <td class="t-muted t-sm">${escapeText([...v.pages].slice(0,3).join(', '))}</td>
        <td class="t-muted t-sm">${mapUrl ? `<a href="${escapeAttr(mapUrl)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">${locHtml}</a>` : locHtml}</td>
        <td class="t-muted t-sm"><div>${escapeText(v.ip)}</div><div class="t-muted text-clip" style="font-size:.68rem;max-width:150px;" title="${escapeAttr(v.isp || '')}">${escapeText(v.isp || 'Réseau inconnu')}</div></td>
        <td class="t-muted t-sm text-clip" title="${escapeAttr(v.user_agent || '')}">${escapeText(visitorDeviceDetails(v))}</td>
        <td class="t-muted t-sm">${v.last_seen ? fmt(new Date(v.last_seen).toISOString()) : '—'}</td>
        <td><div class="acts">
          ${mapUrl ? `<a class="act ${hasGps ? 'ok' : ''}" href="${escapeAttr(mapUrl)}" target="_blank" rel="noopener" title="${hasGps ? 'Ouvrir le point GPS précis' : 'Ouvrir la zone IP dans Maps'}"><i class="fas fa-map-marked-alt"></i></a>` : ''}
          <button class="act" onclick="openVisitorMessage('${escapeAttr(v.id)}')" title="Envoyer un message"><i class="fas fa-comment-dots"></i></button>
          <button class="act ${blocked ? 'ok' : 'del'}" onclick="toggleVisitorBlock('${escapeAttr(v.id)}','${escapeAttr(v.ip)}')" title="${blocked ? 'Débloquer' : 'Bloquer'}"><i class="fas fa-${blocked ? 'unlock' : 'ban'}"></i></button>
        </div></td>
      </tr>`;
  }).join('');
}
function filterVisitors(q) { _visitorsFilter = q.toLowerCase(); renderVisitors(); }
function openVisitorMessage(visitorId) {
  document.getElementById('vm-visitor-id').value = visitorId;
  document.getElementById('vm-target').value = visitorId;
  document.getElementById('vm-title').value = 'Message Hozana Concept';
  document.getElementById('vm-message').value = '';
  document.getElementById('vm-level').value = 'info';
  openModal('m-visitor-message');
}
async function sendVisitorMessage() {
  const visitor_id = document.getElementById('vm-visitor-id').value;
  const title = document.getElementById('vm-title').value.trim() || 'Message Hozana Concept';
  const message = document.getElementById('vm-message').value.trim();
  const level = document.getElementById('vm-level').value || 'info';
  if (!visitor_id || !message) return toast('Message vide ou visiteur manquant', 'err');
  try {
    const res = await fetch('tables/visitor_messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ visitor_id, title, message, level })
    });
    if (!res.ok) throw new Error('send failed');
    closeModal('m-visitor-message');
    toast('Message envoyé au visiteur', 'ok');
  } catch {
    toast('Erreur envoi message. Vérifie la table visitor_messages dans Supabase.', 'err');
  }
}
function toggleVisitorBlock(id, ip) {
  const key = ip && ip !== '—' ? ip : id;
  _blockedVisitors = _blockedVisitors.includes(key) ? _blockedVisitors.filter(x => x !== key) : [..._blockedVisitors, key];
  localStorage.setItem('hzn-blocked-visitors', JSON.stringify(_blockedVisitors));
  renderVisitors(); renderCockpit(); toast(_blockedVisitors.includes(key) ? 'Visiteur ajouté à la liste de blocage' : 'Visiteur débloqué', 'ok');
}

function downloadText(filename, content, type='text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}
function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function escapeAttr(value) { return escapeText(value).replace(/`/g, '&#096;'); }

/* ─── ARTICLES ─── */
let _postsData = [];
function renderPosts(data=P) {
  _postsData = data;
  set('posts-count', data.length);
  const el = document.getElementById('posts-body');
  if (!el) return;
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="8">Aucun article trouvé</td></tr>`; return; }
  el.innerHTML = data.map(p=>{
    const publicUrl = articleStaticPath(p);
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:.625rem;">
          <div class="thumb-wrap">
            ${p.cover_image ? `<img class="thumb" src="${p.cover_image}" onerror="this.parentElement.innerHTML='<div class=\'thumb-placeholder\'><i class=\'fas fa-image\'></i></div>'">` : `<div class="thumb-placeholder"><i class="fas fa-image"></i></div>`}
          </div>
          <div class="text-clip t-strong">${p.title}</div>
        </div>
      </td>
      <td><span class="badge badge-red">${p.category||'—'}</span></td>
      <td class="t-muted t-sm">${p.author||'—'}</td>
      <td class="t-sm">${(p.views||0).toLocaleString()}</td>
      <td class="t-sm">❤️ ${p.likes||0}</td>
      <td><span class="badge ${p.published!==false?'badge-green':'badge-gray'}">${p.published!==false?'Publié':'Brouillon'}</span></td>
      <td class="t-muted t-sm">${fmt(p.created_at)}</td>
      <td><div class="acts">
        <button class="act ${p.published!==false?'ok':'warn'}" onclick="togglePostStatus('${p.id}')" title="${p.published!==false?'Passer en brouillon':'Publier'}">
          <i class="fas fa-${p.published!==false?'check-circle':'pause-circle'}"></i>
        </button>
        <button class="act" onclick="editArticle('${p.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <a class="act" href="${publicUrl}" target="_blank" title="Voir la page publique"><i class="fas fa-eye"></i></a>
        <button class="act del" onclick="confirmDel(()=>delPost('${p.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterPosts(q) { _postsFilter.q=q.toLowerCase(); applyPostsFilter(); }
function filterPostsCat(c) { _postsFilter.cat=c; applyPostsFilter(); }
function applyPostsFilter() {
  renderPosts(P.filter(p=>{
    const mq = !_postsFilter.q || p.title.toLowerCase().includes(_postsFilter.q)||(p.author||'').toLowerCase().includes(_postsFilter.q);
    const mc = !_postsFilter.cat || p.category===_postsFilter.cat;
    return mq && mc;
  }));
}

/* ─── QUILL INIT ─── */
let quillEditor = null;
function initQuill() {
  const container = document.getElementById('quill-editor');
  // Prevent double init — Quill ajoute la classe ql-container sur le div cible
  if (!container || container.classList.contains('ql-container')) return;
  
  // Register ImageResize module — NE PAS enregister si ce n'est pas un constructeur valide
  if (typeof ImageResize === 'function') {
    Quill.register('modules/imageResize', ImageResize);
  }
  
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'code-block'],
      ['blockquote', 'clean']
    ]
  };
  // N'ajouter imageResize QUE si le module est effectivement disponible
  if (typeof ImageResize !== 'undefined' && typeof ImageResize === 'function') {
    quillModules.imageResize = {};
  }
  quillEditor = new Quill(container, {
    theme: 'snow',
    modules: quillModules,
    placeholder: 'Rédigez votre article ici…'
  });
  // Restore pre-set content from hidden textarea (fix race condition on first open)
  const savedContent = document.getElementById('a-content').value;
  if (savedContent) {
    quillEditor.root.innerHTML = savedContent;
  }
  // Sync hidden textarea on every change
  quillEditor.on('text-change', () => {
    document.getElementById('a-content').value = quillEditor.root.innerHTML;
  });
}
// Init Quill when article modal opens
const origOpenModal = openModal;
openModal = function(id) {
  origOpenModal(id);
  if (id === 'm-article') {
    // Small delay to ensure the modal is rendered
    setTimeout(initQuill, 50);
  }
};

function openArticleModal(post=null) {
  document.getElementById('m-article-title').textContent = post?'Modifier l\'article':'Nouvel article';
  document.getElementById('a-id').value = post?.id||'';
  document.getElementById('a-title').value = post?.title||'';
  document.getElementById('a-cat').value = post?.category||'IA';
  document.getElementById('a-author').value = post?.author||'Marcus Hozana';
  document.getElementById('a-excerpt').value = post?.excerpt||'';
  // Always save content to hidden textarea as fallback for Quill lazy init
  document.getElementById('a-content').value = post?.content || '';
  // If Quill already initialized, set directly
  if (quillEditor) {
    quillEditor.root.innerHTML = post?.content || '<p></p>';
  }
  document.getElementById('a-img').value = post?.cover_image||'';
  document.getElementById('a-readtime').value = post?.read_time||5;
  document.getElementById('a-tags').value = Array.isArray(post?.tags)?post.tags.join(', '):(post?.tags||'');
  document.getElementById('a-pub').value = post?.published!==false?'true':'false';
  openModal('m-article');
}
function editArticle(id) { const p=P.find(x=>x.id===id); if(p) openArticleModal(p); }

async function saveArticle(genPage=false) {
  const id = document.getElementById('a-id').value;
  const title = document.getElementById('a-title').value.trim();
  if (!title) { toast('Le titre est obligatoire','err'); return; }
  const tags = document.getElementById('a-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const data = {
    title, category:document.getElementById('a-cat').value,
    author:document.getElementById('a-author').value,
    excerpt:document.getElementById('a-excerpt').value,
    content: quillEditor ? quillEditor.root.innerHTML : document.getElementById('a-content').value,
    cover_image:document.getElementById('a-img').value,
    read_time:parseInt(document.getElementById('a-readtime').value)||5,
    tags, published:document.getElementById('a-pub').value==='true',
    slug:slugifyTitle(title),
    updated_at:new Date().toISOString()
  };
  if (!id) {
    data.views=0;
    data.likes=0;
    data.created_at=new Date().toISOString();
    data.publish_date = data.published ? new Date().toISOString() : null;
  } else if (data.published) {
    const current = P.find(p => p.id === id);
    if (!current?.publish_date) data.publish_date = new Date().toISOString();
  }
  
  // ── DEBUG: tracer le contenu sauvegardé ──
  console.log('[saveArticle] Content length:', (data.content || '').length);
  console.log('[saveArticle] Content preview:', (data.content || '').substring(0, 120));
  console.log('[saveArticle] quillEditor exists:', !!quillEditor);
  console.log('[saveArticle] Mode:', id ? 'UPDATE' : 'CREATE', 'ID:', id || 'new');
  
  try {
    if (id) {
      const r = await fetch(`tables/blog_posts/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if (!r.ok) throw new Error(`Supabase PATCH failed: ${r.status}`);
      const up = await r.json();
      if (!up || up.error) throw new Error(up?.error || 'Réponse vide');
      const i = P.findIndex(p=>p.id===id);
      if (i>-1) P[i]={...P[i],...up};
      toast('Article mis à jour ✓','ok');
      if (!genPage && data.published !== false) {
        await triggerStaticBlogGeneration({ silent: true });
      }
    } else {
      const r = await fetch('tables/blog_posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if (!r.ok) throw new Error(`Supabase POST failed: ${r.status}`);
      const cr = await r.json();
      if (!cr || cr.error) throw new Error(cr?.error || 'Réponse vide');
      if (cr) {
        P.unshift(cr);
        document.getElementById('a-id').value = cr.id;
      }
      toast('Article créé ✓','ok');
      if (!genPage && data.published !== false) {
        await triggerStaticBlogGeneration({ silent: true });
      }
    }
    closeModal('m-article');
    renderPosts(); renderDashPosts(); updateBadges();
  } catch(e) { 
    console.error('[saveArticle] Error:', e);
    toast('Erreur: ' + (e.message || 'sauvegarde échouée'),'err'); 
  }
}

async function togglePostStatus(id) {
  const p = P.find(x => x.id === id);
  if (!p) return;
  const newStatus = p.published === false; // toggle: if false -> true, if true/undefined -> false
  try {
    await fetch(`tables/blog_posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        published: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus && !p.publish_date ? { publish_date: new Date().toISOString() } : {})
      })
    });
    p.published = newStatus;
    if (newStatus && !p.publish_date) p.publish_date = new Date().toISOString();
    renderPosts();
    renderDashPosts();
    renderKPIs();
    toast(newStatus ? 'Article publié ✓' : 'Article mis en brouillon', 'ok');
    await triggerStaticBlogGeneration({ silent: true });
  } catch {
    toast('Erreur lors du changement de statut', 'err');
  }
}

async function delPost(id) {
  await fetch(`tables/blog_posts/${id}`,{method:'DELETE'});
  P = P.filter(p=>p.id!==id);
  renderPosts(); renderDashPosts(); updateBadges(); renderKPIs();
  toast('Article supprimé','ok');
}

/* ─── PORTFOLIO ─── */
let _pfFilter = '';
function renderPortfolio(data=PF) {
  set('pf-count', PF.length);
  const el = document.getElementById('pf-grid');
  if (!el) return;
  const filtered = _pfFilter?data.filter(p=>p.category===_pfFilter):data;
  if (!filtered.length) {
    el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--muted);">Aucun projet — <button class="btn btn-primary btn-sm" onclick="openPfModal()">Ajouter le premier</button></div>`;
    return;
  }
  el.innerHTML = filtered.map(p=>`
    <div class="pf-card">
      <div class="pf-img-wrap" style="height:160px; overflow:hidden; background:var(--surface2); position:relative;">
        ${p.image
          ? `<img class="pf-img" src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<div class=\'thumb-placeholder\' style=\'display:flex; height:100%; align-items:center; justify-content:center; color:var(--muted);\'><i class=\'fas fa-image fa-2x\'></i></div>'">`
          : `<div class="pf-img-placeholder" style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--muted);"><i class="fas fa-image fa-2x"></i></div>`}
      </div>
      <div class="pf-body">
        <div class="pf-cat">${p.category||'—'}${p.featured?' ⭐':''}</div>
        <div class="pf-name" title="${p.title}">${p.title}</div>
        <div class="pf-tags">${(Array.isArray(p.tags)?p.tags:(p.tags||'').split(',').map(t=>t.trim()).filter(Boolean)).slice(0,4).map(t=>`<span class="pf-tag">${t}</span>`).join('')}</div>
        <div class="pf-actions">
          ${p.link?`<a href="${p.link}" target="_blank" class="act" title="Voir"><i class="fas fa-external-link-alt"></i></a>`:''}
          <button class="act" onclick="editPortfolio('${p.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
          <button class="act del" onclick="confirmDel(()=>delPortfolio('${p.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`).join('');
}
function filterPortfolio(cat) { _pfFilter=cat; renderPortfolio(); }

function openPfModal(proj=null) {
  document.getElementById('m-pf-title').textContent = proj?'Modifier le projet':'Nouveau projet';
  document.getElementById('pf-id').value = proj?.id||'';
  document.getElementById('pf-title').value = proj?.title||'';
  document.getElementById('pf-cat').value = proj?.category||'Sites Web';
  document.getElementById('pf-link').value = proj?.link||'';
  document.getElementById('pf-desc').value = proj?.description||'';
  document.getElementById('pf-img').value = proj?.image||'';
  document.getElementById('pf-tags').value = Array.isArray(proj?.tags)?proj.tags.join(', '):(proj?.tags||'');
  document.getElementById('pf-order').value = proj?.sort_order||0;
  document.getElementById('pf-featured').value = proj?.featured?'true':'false';
  previewPfImg(proj?.image||'');
  openModal('m-portfolio');
}
function editPortfolio(id) { const p=PF.find(x=>x.id===id); if(p) openPfModal(p); }

function previewPfImg(url) {
  const wrap = document.getElementById('pf-img-preview-wrap');
  const img  = document.getElementById('pf-img-preview');
  if (url) { img.src=url; wrap.style.display='block'; }
  else { wrap.style.display='none'; }
}

async function savePortfolio() {
  const id = document.getElementById('pf-id').value;
  const title = document.getElementById('pf-title').value.trim();
  if (!title) { toast('Le titre est obligatoire','err'); return; }
  const tags = document.getElementById('pf-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const data = {
    title, category:document.getElementById('pf-cat').value,
    link:document.getElementById('pf-link').value,
    description:document.getElementById('pf-desc').value,
    image:document.getElementById('pf-img').value,
    tags, sort_order:parseInt(document.getElementById('pf-order').value)||0,
    featured:document.getElementById('pf-featured').value==='true'
  };
  try {
    if (id) {
      const r = await fetch(`tables/portfolio_projects/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json();
      const i=PF.findIndex(p=>p.id===id); if(i>-1) PF[i]={...PF[i],...up};
      toast('Projet mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/portfolio_projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json(); if(cr) PF.push(cr);
      toast('Projet ajouté ✓','ok');
    }
    closeModal('m-portfolio');
    renderPortfolio(); updateBadges();
  } catch { toast('Erreur lors de la sauvegarde','err'); }
}
async function delPortfolio(id) {
  await fetch(`tables/portfolio_projects/${id}`,{method:'DELETE'});
  PF = PF.filter(p=>p.id!==id);
  renderPortfolio(); updateBadges();
  toast('Projet supprimé','ok');
}

/* ─── LEADS ─── */
function getLeadCRMStore() {
  try { return JSON.parse(localStorage.getItem('hzn-lead-crm') || '{}'); }
  catch { return {}; }
}
function saveLeadCRMStore(store) { localStorage.setItem('hzn-lead-crm', JSON.stringify(store)); }
function getLeadCRMState(id) { return getLeadCRMStore()[id] || {}; }
function saveLeadCRMState(id, patch) {
  const store = getLeadCRMStore();
  store[id] = { ...(store[id] || {}), ...patch, updated_at:new Date().toISOString() };
  saveLeadCRMStore(store);
  return store[id];
}
function defaultLeadPriority(score) {
  if (score >= 85) return 'urgent';
  if (score >= 70) return 'high';
  if (score < 35) return 'low';
  return 'normal';
}
function priorityLabel(priority) {
  return { urgent:'Urgente', high:'Haute', normal:'Normale', low:'Basse' }[priority] || 'Normale';
}
function leadScore(lead) {
  const crm = getLeadCRMState(lead.id);
  let score = 20;
  if (lead.email) score += 12;
  if (lead.phone) score += 14;
  if (lead.company) score += 10;
  if (lead.service) score += 12;
  if ((lead.message || '').length > 60) score += 10;
  if (['qualified','converted'].includes(lead.status)) score += 18;
  if (String(lead.source || '').match(/audit|chat|devis|site|website/i)) score += 8;
  if (crm.priority === 'high') score += 8;
  if (crm.priority === 'urgent') score += 14;
  if (crm.followup) score += 4;
  return Math.max(0, Math.min(100, score));
}
function crmScoreClass(score) {
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  return '';
}
function isLeadFollowupDue(lead) {
  if (['converted','lost'].includes(lead.status)) return false;
  const crm = getLeadCRMState(lead.id);
  if (!crm.followup) return true;
  const due = new Date(`${crm.followup}T23:59:59`).getTime();
  return Number.isFinite(due) && due <= Date.now();
}
function followupLabel(lead) {
  const crm = getLeadCRMState(lead.id);
  if (!crm.followup) return '<span class="badge badge-yellow">À planifier</span>';
  const due = isLeadFollowupDue(lead);
  return `<span class="badge ${due ? 'badge-red' : 'badge-blue'}">${escapeText(crm.followup)}</span>`;
}
function saveLeadCRMField(field, value) {
  if (!_activeLeadId) return;
  saveLeadCRMState(_activeLeadId, { [field]: value });
  renderLeads();
  renderDashLeads();
  renderNotifications();
  renderCockpit();
  toast('CRM mis à jour', 'ok', 1600);
}
function renderCRMStats() {
  const hot = LEADS.filter(l => leadScore(l) >= 70).length;
  const followups = LEADS.filter(isLeadFollowupDue).length;
  const qualified = LEADS.filter(l => ['qualified','converted'].includes(l.status)).length;
  set('crm-hot', hot);
  set('crm-followups', followups);
  set('crm-qualified-rate', LEADS.length ? `${Math.round((qualified / LEADS.length) * 100)}%` : '0%');
}
function renderCRMCharts() {
  const pipe = {};
  PIPE_COLS.forEach(s => pipe[LBLS[s]] = LEADS.filter(l => l.status === s).length);
  mkChart('chart-crm-pipeline','bar',Object.keys(pipe),
    [{ label:'Leads', data:Object.values(pipe), backgroundColor:['#60a5fa','#facc15','#c084fc','#4ade80'], borderRadius:6, borderWidth:0 }],
    { plugins:{ legend:{display:false} } });

  const src = {};
  LEADS.forEach(l => { src[l.source || 'direct'] = (src[l.source || 'direct'] || 0) + 1; });
  const labels = Object.keys(src).length ? Object.keys(src) : ['Aucune donnée'];
  const data = Object.values(src).length ? Object.values(src) : [1];
  mkChart('chart-crm-sources','doughnut',labels,
    [{ data, backgroundColor:Object.keys(src).length ? ['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6','#f59e0b'] : ['rgba(255,255,255,.12)'], borderWidth:0, hoverOffset:6 }],
    { scales:{}, plugins:{ legend:{ position:'bottom', labels:{ color:'rgba(240,240,245,.5)', boxWidth:12, font:{size:11} } } } });
}

function renderLeads(data=LEADS) {
  set('leads-count', LEADS.length);
  renderPipeline();
  renderCRMStats();
  setTimeout(renderCRMCharts, 60);
  const el = document.getElementById('leads-body');
  if (!el) return;
  const filtered = data.filter(l=>{
    const mq=!_leadsFilter.q||(l.name||'').toLowerCase().includes(_leadsFilter.q)||(l.email||'').toLowerCase().includes(_leadsFilter.q);
    const ms=!_leadsFilter.status||l.status===_leadsFilter.status;
    return mq&&ms;
  });
  if (!filtered.length) { el.innerHTML=`<tr class="empty-row"><td colspan="9">Aucun lead</td></tr>`; return; }
  el.innerHTML = filtered.map(l=>{
    const score = leadScore(l);
    const crm = getLeadCRMState(l.id);
    const priority = crm.priority || defaultLeadPriority(score);
    return `
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="avatar">${(l.name||l.email||'?')[0].toUpperCase()}</div>
        <div><div class="t-strong t-sm">${escapeText(l.name||'—')}</div><div class="t-muted" style="font-size:.7rem;">${escapeText(l.company||priorityLabel(priority))}</div></div>
      </div></td>
      <td class="t-muted t-sm">${escapeText(l.email||'—')}</td>
      <td class="t-muted t-sm">${escapeText(l.service||'—')}</td>
      <td class="t-muted t-sm">${escapeText(l.source||'—')}</td>
      <td><span class="crm-score-pill small ${crmScoreClass(score)}">${score}</span></td>
      <td>${followupLabel(l)}</td>
      <td>
        <select class="status-sel" onchange="updateLeadStatus('${l.id}',this.value)">
          ${PIPE_COLS.map(s=>`<option value="${s}" ${l.status===s?'selected':''}>${LBLS[s]}</option>`).join('')}
        </select>
      </td>
      <td class="t-muted t-sm">${fmt(l.created_at)}</td>
      <td><div class="acts">
        <button class="act" onclick="viewLead('${l.id}')" title="Voir détails"><i class="fas fa-eye"></i></button>
        <button class="act del" onclick="confirmDel(()=>delLead('${l.id}'))"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterLeads(q) { _leadsFilter.q=q.toLowerCase(); renderLeads(); }
function filterLeadsStatus(s) { _leadsFilter.status=s; renderLeads(); }

function renderPipeline() {
  const el = document.getElementById('leads-pipeline');
  const colors = { new:'#60a5fa', contacted:'#facc15', qualified:'#c084fc', converted:'#4ade80' };
  el.innerHTML = PIPE_COLS.map(col=>{
    const items = LEADS.filter(l=>l.status===col);
    return `
      <div class="pipe-col">
        <div class="pipe-head" style="color:${colors[col]};">
          ${LBLS[col]}
          <span class="pipe-count">${items.length}</span>
        </div>
        ${items.slice(0,5).map(l=>`
          <div class="pipe-item" onclick="viewLead('${l.id}')">
            <div class="pipe-item-name">${l.name||l.email||'—'}</div>
            <div class="pipe-item-meta">${l.service||l.source||'—'} · ${fmt(l.created_at)}</div>
          </div>`).join('')}
        ${items.length>5?`<div class="t-muted t-sm" style="padding:.25rem;text-align:center;">+${items.length-5} autres</div>`:''}
      </div>`;
  }).join('');
}

function viewLead(id) {
  const l = LEADS.find(x => x.id === id);
  if (!l) return;
  _activeLeadId = id;
  const crm = getLeadCRMState(id);
  const score = leadScore(l);
  document.getElementById('v-lead-name').textContent = l.name || '—';
  document.getElementById('v-lead-email').textContent = l.email || '—';
  document.getElementById('v-lead-phone').textContent = l.phone || '—';
  document.getElementById('v-lead-company').textContent = l.company || '—';
  document.getElementById('v-lead-service').textContent = l.service || '—';
  document.getElementById('v-lead-source').textContent = l.source || '—';
  document.getElementById('v-lead-message').textContent = l.message || 'Aucun message.';
  const scoreEl = document.getElementById('v-lead-score');
  if (scoreEl) {
    scoreEl.className = `crm-score-pill ${crmScoreClass(score)}`;
    scoreEl.textContent = `${score}/100`;
  }
  const priorityEl = document.getElementById('v-lead-priority');
  if (priorityEl) priorityEl.value = crm.priority || defaultLeadPriority(score);
  const followupEl = document.getElementById('v-lead-followup');
  if (followupEl) followupEl.value = crm.followup || '';
  const notesEl = document.getElementById('v-lead-notes');
  if (notesEl) notesEl.value = crm.notes || '';
  
  const replyBtn = document.getElementById('v-lead-reply');
  if (l.email) {
    const subject = encodeURIComponent(`Hozana Concept — Réponse à votre demande (${l.service || 'Contact'})`);
    replyBtn.href = `mailto:${l.email}?subject=${subject}`;
    replyBtn.style.display = 'inline-flex';
  } else {
    replyBtn.style.display = 'none';
  }
  
  openModal('m-lead');
}

async function updateLeadStatus(id, status) {
  await fetch(`tables/leads/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  const l=LEADS.find(x=>x.id===id); if(l) l.status=status;
  renderLeads(); renderDashLeads(); renderCharts(); renderNotifications(); renderCockpit(); updateBadges();
  toast('Statut mis à jour ✓','ok');
}
async function delLead(id) {
  await fetch(`tables/leads/${id}`,{method:'DELETE'});
  LEADS=LEADS.filter(l=>l.id!==id);
  const store = getLeadCRMStore();
  delete store[id];
  saveLeadCRMStore(store);
  renderLeads(); renderDashLeads(); updateBadges(); renderKPIs();
  toast('Lead supprimé','ok');
}

/* ─── AUDITS ─── */
function renderAudits(data=AUDITS) {
  set('audits-count', AUDITS.length);
  const el = document.getElementById('audits-body');
  if (!el) return;
  const filtered = data.filter(a=>{
    const mq=!_auditsFilter.q||(a.name||'').toLowerCase().includes(_auditsFilter.q)||(a.email||'').toLowerCase().includes(_auditsFilter.q)||(a.company||'').toLowerCase().includes(_auditsFilter.q);
    const ms=!_auditsFilter.status||a.status===_auditsFilter.status;
    return mq&&ms;
  });
  if (!filtered.length) { el.innerHTML=`<tr class="empty-row"><td colspan="8">Aucun audit</td></tr>`; return; }
  el.innerHTML = filtered.map(a=>{
    const initials = (a.name||a.email||'?')[0]?.toUpperCase()||'?';
    return `
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="avatar">${initials}</div>
        <div><div class="t-strong t-sm">${a.name||'—'}</div><div class="t-muted" style="font-size:.7rem;">${a.company||''}</div></div>
      </div></td>
      <td class="t-muted t-sm">${a.email||'—'}</td>
      <td class="t-muted t-sm">${a.company||'—'}</td>
      <td class="t-muted t-sm">${a.sector||'—'}</td>
      <td><span class="badge ${a.maturity_score>=7?'badge-green':a.maturity_score>=4?'badge-yellow':'badge-blue'}" style="font-size:.7rem;">${a.maturity_score||'?'}/10</span></td>
      <td>
        <select class="status-sel" onchange="updateAuditStatus('${a.id}',this.value)">
          ${PIPE_COLS.map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${LBLS[s]}</option>`).join('')}
        </select>
      </td>
      <td class="t-muted t-sm">${fmt(a.created_at)}</td>
      <td><div class="acts">
        <button class="act" onclick="viewAudit('${a.id}')" title="Voir détails"><i class="fas fa-eye"></i></button>
        <button class="act del" onclick="confirmDel(()=>delAudit('${a.id}'))"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function filterAudits(q) { _auditsFilter.q=q.toLowerCase(); renderAudits(); }
function filterAuditsStatus(s) { _auditsFilter.status=s; renderAudits(); }

async function updateAuditStatus(id, status) {
  await fetch(`tables/audits/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  const a=AUDITS.find(x=>x.id===id); if(a) a.status=status;
  updateBadges();
  toast('Statut mis à jour ✓','ok');
}

async function delAudit(id) {
  await fetch(`tables/audits/${id}`,{method:'DELETE'});
  AUDITS=AUDITS.filter(a=>a.id!==id);
  renderAudits(); updateBadges();
  toast('Audit supprimé','ok');
}

function viewAudit(id) {
  const a = AUDITS.find(x => x.id === id);
  if (!a) return;
  
  const scoreColor = a.maturity_score>=7?'#4ade80':a.maturity_score>=4?'#facc15':'#60a5fa';
  
  const html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div class="form-grp"><label class="form-label">Nom</label><div class="t-strong">${a.name||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Email</label><div class="t-muted">${a.email||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Téléphone</label><div class="t-muted">${a.phone||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Entreprise</label><div class="t-muted">${a.company||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Secteur</label><div class="t-muted">${a.sector||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Score maturité</label><div style="font-size:1.5rem;font-weight:800;color:${scoreColor};">${a.maturity_score||'?'}/10</div></div>
    </div>
    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
      <div class="form-grp"><label class="form-label">Maturité digitale</label><div class="t-muted">${a.maturity||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Outils utilisés</label><div class="t-muted">${a.tools||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Portée / trafic</label><div class="t-muted">${a.reach||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Défi principal</label><div class="t-muted">${a.top_challenge||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Processus manuels</label><div class="t-muted">${a.manual_processes||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Usage IA</label><div class="t-muted">${a.ia_usage||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Heures répétitives/sem</label><div class="t-muted">${a.repetitive_hours||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Objectif principal</label><div class="t-muted">${a.main_goal||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Concurrence</label><div class="t-muted">${a.competition||'—'}</div></div>
      <div class="form-grp"><label class="form-label">Budget</label><div class="t-muted">${a.budget||'—'}</div></div>
    </div>
    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
      <div class="form-grp"><label class="form-label">Message / Notes</label>
        <div style="background:var(--surface2);padding:1rem;border-radius:var(--radius-sm);border:1px solid var(--border);white-space:pre-wrap;line-height:1.6;">${a.message||'Aucune note'}</div>
      </div>
    </div>
  `;
  
  document.getElementById('audit-detail-view').innerHTML = html;
  
  const replyBtn = document.getElementById('v-audit-reply');
  if (a.email) {
    const subject = encodeURIComponent('Hozana Concept — Suite de votre audit IA gratuit');
    replyBtn.href = `mailto:${a.email}?subject=${subject}`;
    replyBtn.style.display = 'inline-flex';
  } else {
    replyBtn.style.display = 'none';
  }
  
  openModal('m-audit');
}

/* ─── GENERATE STATIC SEO PAGES ─── */
let _generatingPage = false;
async function triggerStaticBlogGeneration(options = {}) {
  const silent = !!options.silent;
  try {
    const res = await fetch('/api/regenerate-blog', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      if (!silent) toast(data.message || 'Page générée ✓', 'ok');
      else if (data.mode === 'deploy-hook' || data.mode === 'github-action') toast('Publication SEO programmée ✓', 'ok');
    } else {
      toast('SEO statique: ' + (data.message || data.error || 'génération non disponible'), 'err');
    }
    return data;
  } catch (e) {
    toast('SEO statique indisponible: ' + (e.message || 'erreur réseau'), silent ? 'info' : 'err');
    return { success: false, error: e.message };
  }
}

async function generateArticlePage(options = {}) {
  if (_generatingPage) return;
  _generatingPage = true;
  try {
    let id = document.getElementById('a-id').value;
    if (!id) {
      await saveArticle(true);
      id = document.getElementById('a-id').value;
    }
    await triggerStaticBlogGeneration(options);
  } finally {
    _generatingPage = false;
  }
}

/* ─── REGENERATE STATIC BLOG ─── */
async function regenerateBlog() {
  const btn = document.getElementById('btn-regenerate');
  const status = document.getElementById('regenerate-status');
  if (!btn || !status) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération en cours…';
  status.innerHTML = '<span style="color:var(--orange);">Appel API en cours…</span>';
  try {
    const res = await fetch('/api/regenerate-blog', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      status.innerHTML = `<span style="color:#4ade80;">✅ ${data.message || 'Blog régénéré avec succès'}</span>`;
      toast('Blog régénéré ✓','ok');
    } else {
      status.innerHTML = `<span style="color:var(--red);">❌ ${data.message || data.error || 'Erreur'}</span>`;
      toast('Erreur régénération','err');
    }
  } catch (e) {
    status.innerHTML = `<span style="color:var(--red);">❌ Erreur : ${e.message}</span>`;
    toast('Erreur réseau','err');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Régénérer tous les articles statiques';
  }
}

/* ─── PACKS ─── */
function renderPacks(data=PACKS) {
  const rows = data.filter(p => p && p.id && p.name && packItemType(p) !== 'option');
  set('packs-count', rows.length);
  const el = document.getElementById('packs-body');
  if (!el) return;
  if (!rows.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun pack</td></tr>`; return; }
  el.innerHTML = rows.map(p=>`
    <tr>
      <td><div class="t-strong t-sm">${p.name}</div><div class="t-muted" style="font-size:.7rem;">${p.badge||''}</div></td>
      <td class="t-sm">${p.price||'—'}</td>
      <td class="t-muted t-sm">${p.period||'—'}</td>
      <td><span class="badge ${p.is_featured?'badge-green':'badge-gray'}">${p.is_featured?'Oui':'Non'}</span></td>
      <td class="t-sm">${p.sort_order||0}</td>
      <td><div class="acts">
        <button class="act" onclick="editPack('${p.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="act del" onclick="confirmDel(()=>delPack('${p.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function openPackModal(p=null) {
  document.getElementById('m-pack-title').textContent = p?'Modifier le pack':'Nouveau pack';
  document.getElementById('pk-id').value = p?.id||'';
  document.getElementById('pk-name').value = p?.name||'';
  document.getElementById('pk-badge').value = p?.badge||'';
  document.getElementById('pk-price').value = p?.price||'';
  document.getElementById('pk-old-price').value = p?.old_price||p?.price_before||p?.compare_at_price||'';
  document.getElementById('pk-period').value = p?.period||'par mois';
  document.getElementById('pk-desc').value = p?.description||'';
  document.getElementById('pk-features').value = Array.isArray(p?.features)?p.features.join('\n'):'';
  document.getElementById('pk-features-excluded').value = Array.isArray(p?.features_excluded)?p.features_excluded.join('\n'):'';
  document.getElementById('pk-featured').value = p?.is_featured?'true':'false';
  document.getElementById('pk-button-mode').value = /contact/i.test(p?.link || '') || /contact/i.test(p?.button_text || '') ? 'contact' : 'detail';
  document.getElementById('pk-order').value = p?.sort_order||0;
  document.getElementById('pk-link').value = p?.link||'';
  document.getElementById('pk-comparison').value = comparisonToText(p?.comparison || p?.compare || p?.comparison_rows);
  openModal('m-pack');
}
function editPack(id) {
  if (!id || id === 'undefined') return toast('Offre invalide, actualisez la page','err');
  const p=PACKS.find(x=>x.id===id);
  if(p) openPackModal(p);
  else toast('Offre introuvable','err');
}

function packItemType(p) {
  const explicit = String(p?.item_type || p?.type || p?.category || '').toLowerCase();
  const buttonText = String(p?.button_text || '').toLowerCase();
  return explicit === 'option' || buttonText.includes('ajouter au panier') ? 'option' : 'pack';
}

function comparisonToText(value) {
  if (!value) return '';
  let data = value;
  if (typeof value === 'string') {
    try { data = JSON.parse(value); } catch { return value; }
  }
  if (Array.isArray(data)) {
    return data.map(item => typeof item === 'string' ? item : `${item.label || item.name || ''}: ${item.value || item.text || ''}`).filter(Boolean).join('\n');
  }
  return Object.entries(data).map(([label, val]) => `${label}: ${val}`).join('\n');
}

function comparisonFromText(value) {
  return Object.fromEntries(String(value || '').split(/\r?\n/).map(line => {
    const parts = line.split(':');
    return [parts.shift()?.trim(), parts.join(':').trim()];
  }).filter(([label, val]) => label && val));
}

async function parseJsonSafe(response) {
  try { return await response.json(); } catch { return null; }
}

function isMissingColumnError(payload) {
  const msg = `${payload?.message || ''} ${payload?.details || ''} ${payload?.hint || ''}`;
  return /column|schema cache|could not find|item_type|old_price|comparison|pack_options/i.test(msg);
}

function legacyPackPayload(data) {
  const legacy = { ...data };
  delete legacy.old_price;
  delete legacy.comparison;
  return legacy;
}

async function savePackToSupabase(id, data) {
  const url = id ? `tables/packs/${id}` : 'tables/packs';
  const method = id ? 'PATCH' : 'POST';
  let response = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  let payload = await parseJsonSafe(response);

  if (!response.ok && isMissingColumnError(payload)) {
    response = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(legacyPackPayload(data)) });
    payload = await parseJsonSafe(response);
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Erreur Supabase';
    throw new Error(message);
  }
  if (!payload || !payload.id || !payload.name) {
    throw new Error('Réponse Supabase invalide');
  }
  return payload;
}

async function savePack() {
  const id = document.getElementById('pk-id').value;
  const name = document.getElementById('pk-name').value.trim();
  if (!name) return toast('Le nom est requis','err');
  const features = document.getElementById('pk-features').value.split('\n').filter(Boolean);
  const features_excluded = document.getElementById('pk-features-excluded').value.split('\n').filter(Boolean);
  const buttonMode = document.getElementById('pk-button-mode').value;
  const manualLink = document.getElementById('pk-link').value.trim();
  const data = {
    name, badge:document.getElementById('pk-badge').value,
    price:document.getElementById('pk-price').value,
    old_price:document.getElementById('pk-old-price').value,
    period:document.getElementById('pk-period').value,
    description:document.getElementById('pk-desc').value,
    features, features_excluded,
    is_featured:document.getElementById('pk-featured').value==='true',
    sort_order:parseInt(document.getElementById('pk-order').value)||0,
    link: buttonMode === 'contact' ? (manualLink || `contact.html?pack=${encodeURIComponent(name)}`) : manualLink,
    button_text: buttonMode === 'contact' ? 'Contactez-nous' : 'Voir le détail du pack',
    button_class: buttonMode === 'contact' ? 'btn-primary' : '',
    comparison: comparisonFromText(document.getElementById('pk-comparison').value)
  };
  try {
    if (id) {
      const up = await savePackToSupabase(id, data);
      const i=PACKS.findIndex(x=>x.id===id);
      if(i>-1) PACKS[i]={...PACKS[i],...up};
      toast('Offre mise à jour ✓','ok');
    } else {
      const cr = await savePackToSupabase('', data);
      PACKS.push(cr);
      toast('Offre ajoutée ✓','ok');
    }
    closeModal('m-pack'); renderPacks(); updateBadges();
    await triggerStaticBlogGeneration({ silent: true });
  } catch (e) {
    console.error('[Admin] savePack failed:', e);
    toast(e.message || 'Erreur sauvegarde','err');
  }
}
async function delPack(id) {
  if (!id || id === 'undefined') return toast('Offre invalide','err');
  const res = await fetch(`tables/packs/${id}`,{method:'DELETE'});
  if (!res.ok) return toast('Erreur suppression','err');
  PACKS=PACKS.filter(x=>x.id!==id);
  renderPacks(); updateBadges(); toast('Offre supprimée','ok');
  await triggerStaticBlogGeneration({ silent: true });
}

/* ─── OPTIONS TARIFAIRES ─── */
function renderOptions(data=OPTIONS) {
  const rows = data.filter(o => o && o.id && o.name);
  set('options-count', rows.length);
  const el = document.getElementById('options-body');
  if (!el) return;
  if (!rows.length) { el.innerHTML=`<tr class="empty-row"><td colspan="5">Aucune option</td></tr>`; return; }
  el.innerHTML = rows.map(o=>`
    <tr>
      <td><div class="t-strong t-sm">${o.name}</div><div class="t-muted" style="font-size:.7rem;">${o.description||''}</div></td>
      <td class="t-sm">${o.price||'—'}</td>
      <td class="t-muted t-sm">${o.period||'—'}</td>
      <td class="t-sm">${o.sort_order||0}</td>
      <td><div class="acts">
        <button class="act" onclick="editOption('${o.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="act del" onclick="confirmDel(()=>delOption('${o.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function openOptionModal(o=null) {
  document.getElementById('m-option-title').textContent = o ? 'Modifier l’option' : 'Nouvelle option';
  document.getElementById('op-id').value = o?.id || '';
  document.getElementById('op-name').value = o?.name || '';
  document.getElementById('op-badge').value = o?.badge || '';
  document.getElementById('op-price').value = o?.price || '';
  document.getElementById('op-old-price').value = o?.old_price || '';
  document.getElementById('op-period').value = o?.period || 'par mois';
  document.getElementById('op-order').value = o?.sort_order || 0;
  document.getElementById('op-desc').value = o?.description || '';
  document.getElementById('op-features').value = Array.isArray(o?.features) ? o.features.join('\n') : '';
  openModal('m-option');
}

function editOption(id) {
  if (!id || id === 'undefined') return toast('Option invalide','err');
  const option = OPTIONS.find(o => o.id === id);
  if (option) openOptionModal(option);
  else toast('Option introuvable','err');
}

async function saveOption() {
  const id = document.getElementById('op-id').value;
  const name = document.getElementById('op-name').value.trim();
  if (!name) return toast('Le nom est requis','err');
  const data = {
    name,
    badge: document.getElementById('op-badge').value,
    price: document.getElementById('op-price').value,
    old_price: document.getElementById('op-old-price').value,
    period: document.getElementById('op-period').value,
    sort_order: parseInt(document.getElementById('op-order').value, 10) || 0,
    description: document.getElementById('op-desc').value,
    features: document.getElementById('op-features').value.split('\n').map(v => v.trim()).filter(Boolean)
  };
  try {
    const saved = await saveOptionToSupabase(id, data);
    if (id) {
      const i = OPTIONS.findIndex(o => o.id === id);
      if (i > -1) OPTIONS[i] = { ...OPTIONS[i], ...saved };
    } else {
      OPTIONS.push(saved);
    }
    closeModal('m-option'); renderOptions(); updateBadges();
    toast(id ? 'Option mise à jour ✓' : 'Option ajoutée ✓','ok');
    await triggerStaticBlogGeneration({ silent: true });
  } catch (e) {
    console.error('[Admin] saveOption failed:', e);
    toast(e.message || 'Erreur option','err');
  }
}

async function saveOptionToSupabase(id, data) {
  const url = id ? `tables/pack_options/${id}` : 'tables/pack_options';
  const method = id ? 'PATCH' : 'POST';
  const response = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  const payload = await parseJsonSafe(response);
  if (!response.ok) throw new Error(payload?.message || 'Table pack_options indisponible');
  if (!payload || !payload.id || !payload.name) throw new Error('Réponse Supabase invalide');
  return payload;
}

async function delOption(id) {
  if (!id || id === 'undefined') return toast('Option invalide','err');
  const res = await fetch(`tables/pack_options/${id}`,{method:'DELETE'});
  if (!res.ok) return toast('Erreur suppression option','err');
  OPTIONS = OPTIONS.filter(o => o.id !== id);
  renderOptions(); updateBadges(); toast('Option supprimée','ok');
  await triggerStaticBlogGeneration({ silent: true });
}

/* ─── SERVICES ─── */
function renderServices(data=SERVICES) {
  set('services-count', data.length);
  const el = document.getElementById('services-body');
  if (!el) return;
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="4">Aucun service</td></tr>`; return; }
  el.innerHTML = data.map(s=>`
    <tr>
      <td><div class="t-strong t-sm">${s.title}</div><div class="t-muted" style="font-size:.7rem;max-width:300px;">${s.description||''}</div></td>
      <td class="t-sm"><i class="${s.icon||'fas fa-cube'}"></i> ${s.icon||'—'}</td>
      <td class="t-sm">${s.sort_order||0}</td>
      <td><div class="acts">
        <button class="act" onclick="editService('${s.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="act del" onclick="confirmDel(()=>delService('${s.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}
function openServiceModal(s=null) {
  document.getElementById('m-service-title').textContent = s?'Modifier le service':'Nouveau service';
  document.getElementById('sv-id').value = s?.id||'';
  document.getElementById('sv-title').value = s?.title||'';
  document.getElementById('sv-icon').value = s?.icon||'fas fa-robot';
  document.getElementById('sv-order').value = s?.sort_order||0;
  document.getElementById('sv-desc').value = s?.description||'';
  document.getElementById('sv-features').value = Array.isArray(s?.features)?s.features.join('\n'):'';
  openModal('m-service');
}
function editService(id) { const s=SERVICES.find(x=>x.id===id); if(s) openServiceModal(s); }

async function saveService() {
  const id = document.getElementById('sv-id').value;
  const title = document.getElementById('sv-title').value.trim();
  if (!title) return toast('Le titre est requis','err');
  const features = document.getElementById('sv-features').value.split('\n').filter(Boolean);
  const data = {
    title, icon:document.getElementById('sv-icon').value,
    sort_order:parseInt(document.getElementById('sv-order').value)||0,
    description:document.getElementById('sv-desc').value,
    features
  };
  try {
    if (id) {
      const r = await fetch(`tables/services_list/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json(); const i=SERVICES.findIndex(x=>x.id===id); if(i>-1) SERVICES[i]={...SERVICES[i],...up};
      toast('Service mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/services_list',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json(); if(cr) SERVICES.push(cr);
      toast('Service ajouté ✓','ok');
    }
    closeModal('m-service'); renderServices(); updateBadges();
  } catch { toast('Erreur sauvegarde','err'); }
}
async function delService(id) {
  await fetch(`tables/services_list/${id}`,{method:'DELETE'});
  SERVICES=SERVICES.filter(x=>x.id!==id);
  renderServices(); updateBadges(); toast('Service supprimé','ok');
}

/* ─── ORDERS ─── */
const OS = { paid:'badge-green', pending:'badge-gray', cancelled:'badge-red', refunded:'badge-yellow' };
const OL = { paid:'✅ Payé', pending:'⏳ En attente', cancelled:'❌ Annulé', refunded:'↩ Remboursé' };
function renderOrders(data=ORDERS) {
  renderKPIs();
  const el = document.getElementById('orders-body');
  if (!el) return;
  const filtered = data.filter(o=>{
    const mq=!_ordersFilter.q||(o.email||'').toLowerCase().includes(_ordersFilter.q)||(o.pack||'').toLowerCase().includes(_ordersFilter.q)||(o.firstname||'').toLowerCase().includes(_ordersFilter.q)||(o.lastname||'').toLowerCase().includes(_ordersFilter.q);
    const ms=!_ordersFilter.status||o.status===_ordersFilter.status;
    return mq&&ms;
  });
  if (!filtered.length) { el.innerHTML=`<tr class="empty-row"><td colspan="7">Aucune commande</td></tr>`; return; }
  el.innerHTML = filtered.map(o=>{
    const client = `${o.firstname||''} ${o.lastname||''}`.trim()||o.email||'—';
    const initials = client.split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'CL';
    return `
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="avatar" style="font-size:.65rem;">${initials}</div>
        <div><div class="t-strong t-sm">${client}</div><div class="t-muted" style="font-size:.7rem;">${o.email||''}</div></div>
      </div></td>
      <td><span class="badge badge-red">${o.pack||'—'}</span></td>
      <td class="t-muted t-sm">${o.billing==='annual'?'📅 Annuel':'📆 Mensuel'}</td>
      <td class="t-strong t-sm" style="color:#4ade80;">${o.amount?o.amount.toLocaleString('fr-FR')+'€':'—'}</td>
      <td><span class="badge ${OS[o.status]||'badge-gray'}">${OL[o.status]||o.status||'—'}</span></td>
      <td class="t-muted t-sm">${fmt(o.created_at)}</td>
      <td><div class="acts">
        ${o.status!=='paid'?`<button class="act ok" onclick="setOrderPaid('${o.id}')" title="Marquer payé"><i class="fas fa-check"></i></button>`:''}
        <button class="act del" onclick="confirmDel(()=>delOrder('${o.id}'))"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterOrders(q) { _ordersFilter.q=q.toLowerCase(); renderOrders(); }
function filterOrdersStatus(s) { _ordersFilter.status=s; renderOrders(); }
async function setOrderPaid(id) {
  await fetch(`tables/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'paid'})});
  const o=ORDERS.find(x=>x.id===id); if(o) o.status='paid';
  renderOrders(); updateBadges(); renderKPIs();
  toast('Commande marquée payée ✓','ok');
}
async function delOrder(id) {
  await fetch(`tables/orders/${id}`,{method:'DELETE'});
  ORDERS=ORDERS.filter(o=>o.id!==id);
  renderOrders(); updateBadges(); renderKPIs();
  toast('Commande supprimée','ok');
}

/* ─── COMMENTS ─── */
let _comFilter = '';
function renderComments() {
  set('com-count', COM.filter(c=>!c.approved).length);
  const el = document.getElementById('com-body');
  if (!el) return;
  const data = _comFilter==='pending'?COM.filter(c=>!c.approved):_comFilter==='approved'?COM.filter(c=>c.approved):COM;
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun commentaire</td></tr>`; return; }
  el.innerHTML = data.map(c=>{
    const post = P.find(p=>p.id===c.post_id);
    return `
    <tr>
      <td><div style="display:flex;align-items:center;gap:.5rem;">
        <div class="avatar" style="width:28px;height:28px;font-size:.65rem;">${(c.author_name||'A')[0].toUpperCase()}</div>
        <div><div class="t-strong t-sm">${c.author_name||'Anonyme'}</div><div class="t-muted" style="font-size:.7rem;">${c.author_email||''}</div></div>
      </div></td>
      <td><div class="text-clip t-sm" style="max-width:260px;">${c.content||''}</div></td>
      <td class="t-muted t-sm">${post?.title||c.post_id||'—'}</td>
      <td class="t-muted t-sm">${fmt(c.created_at)}</td>
      <td><span class="badge ${c.approved?'badge-green':'badge-yellow'}">${c.approved?'Approuvé':'En attente'}</span></td>
      <td><div class="acts">
        ${!c.approved?`<button class="act ok" onclick="approveComment('${c.id}')" title="Approuver"><i class="fas fa-check"></i></button>`:''}
        <button class="act del" onclick="confirmDel(()=>delComment('${c.id}'))"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterComments(v) { _comFilter=v; renderComments(); }
async function approveComment(id) {
  await fetch(`tables/comments/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({approved:true})});
  const c=COM.find(x=>x.id===id); if(c) c.approved=true;
  renderComments(); updateBadges();
  toast('Commentaire approuvé ✓','ok');
}
async function delComment(id) {
  await fetch(`tables/comments/${id}`,{method:'DELETE'});
  COM=COM.filter(c=>c.id!==id);
  renderComments(); updateBadges();
  toast('Commentaire supprimé','ok');
}

/* ─── SETTINGS ─── */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('hzn-theme',t);
}

/* ─── CONFIRM DELETE ─── */
function confirmDel(cb) {
  _delCb = cb;
  document.getElementById('confirm-ok').onclick = async () => {
    try { await _delCb(); } catch { toast('Erreur suppression','err'); }
    closeModal('m-confirm');
  };
  openModal('m-confirm');
}

/* ─── MODAL UTILS ─── */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeIfBg(e,id) { if(e.target===document.getElementById(id)) closeModal(id); }
document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open')); });

/* ─── TOAST ─── */
function toast(msg, type='info') {
  const area = document.getElementById('toast-area');
  const t = document.createElement('div');
  t.className = 'toast'+(type==='ok'?' ok':type==='err'?' err':type==='warn'?' warn':'');
  const icons = {ok:'✅', err:'❌', warn:'⚠️', info:'ℹ️'};
  t.innerHTML = `${icons[type]||'💬'} ${msg}`;
  area.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}

/* ─── FILE UPLOAD (Supabase Storage) ─── */
async function uploadToSupabase(file, bucket = 'blog-images') {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const filePath = fileName;

  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;
  
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'apikey': SUPABASE_ANON,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: file
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ message: resp.statusText }));
      throw new Error(errorData.message || 'Upload failed');
    }
    
    // Construct public URL
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
  } catch (err) {
    console.error('[Storage] Upload error details:', err);
    throw err;
  }
}

async function handleFileUpload(input, targetId, callback) {
  const file = input.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    toast('Image trop lourde (max 5Mo)', 'err');
    input.value = '';
    return;
  }
  
  toast('Téléchargement en cours...', 'info');
  try {
    const publicUrl = await uploadToSupabase(file);
    document.getElementById(targetId).value = publicUrl;
    if (callback) callback(publicUrl);
    toast('Image stockée sur Supabase ✓', 'ok');
  } catch (err) {
    let msg = 'Erreur: ' + err.message;
    if (err.message.includes('bucket not found')) {
      msg = 'Erreur: Le bucket "blog-images" n\'existe pas.';
    } else if (err.message.includes('New policies')) {
      msg = 'Erreur: Permissions (RLS) manquantes sur le bucket.';
    }
    toast(msg, 'err');
  }
}

/* ─── HELPERS ─── */
function fmt(dt) {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}); }
  catch { return '—'; }
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('hzn-theme')||'dark';
  document.documentElement.setAttribute('data-theme', theme);
  if (sessionStorage.getItem('hzn-auth')==='1') {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';
    initApp();
  }
});
