/* ─── STATE ─── */
// ── Admin credentials hash (fallback si supabase-config.js ne charge pas) ──
if (typeof ADMIN_EMAIL_HASH === 'undefined') {
  window.ADMIN_EMAIL_HASH    = 'a4976d615b70ef9383759e67e205e204fad71ebddeed9ab327662b389c8d21e4';
  window.ADMIN_PASSWORD_HASH = 'cb2e6d595374831518b59caec6590572569c1d989f19a807e4fc4db9c1a96383';
}

let P = [], COM = [], LEADS = [], VIEWS = [], ORDERS = [], PF = [], PACKS = [], SERVICES = [];
let AUDITS = [];
let CH = {};
let _delCb = null;
let _postsFilter = { q: '', cat: '' };
let _leadsFilter = { q: '', status: '' };
let _auditsFilter = { q: '', status: '' };
let _ordersFilter = { q: '', status: '' };
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
const TITLES = { dashboard:'Dashboard', analytics:'Analytics', articles:'Articles', portfolio:'Portfolio', leads:'Leads CRM', audits:'Audits IA', packs:'Packs Tarifs', orders:'Commandes', services:'Services', comments:'Commentaires', settings:'Paramètres' };
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
  if (panel === 'articles')  applyPostsFilter();
  if (panel === 'portfolio') renderPortfolio();
  if (panel === 'leads')     renderLeads();
  if (panel === 'audits')    renderAudits();
  if (panel === 'packs')     renderPacks();
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
    const [pr,cr,lr,vr,or,pfr, pkr, svr, ar] = await Promise.allSettled([
      fetch('tables/blog_posts?order=created_at.desc&limit=200').then(r=>r.json()),
      fetch('tables/comments?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/leads?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/page_views?limit=1000').then(r=>r.json()),
      fetch('tables/orders?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/portfolio_projects?order=sort_order.asc&limit=200').then(r=>r.json()),
      fetch('tables/packs?order=sort_order.asc&limit=50').then(r=>r.json()),
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
    if (pkr.status==='fulfilled' && pkr.value) PACKS = pkr.value.data || [];
    if (svr.status==='fulfilled' && svr.value) SERVICES = svr.value.data || [];

    console.log('[Admin] Data loaded:', { posts: P.length, leads: LEADS.length, packs: PACKS.length });
  } catch(e) { 
    console.error('[Admin] loadAll error:', e);
    toast('Erreur de chargement','err'); 
  }

  updateBadges();
  renderKPIs();
  renderDashLeads();
  renderDashPosts();
  renderCharts();
  applyPostsFilter();
  renderPortfolio();
  renderLeads();
  renderPacks();
  renderServices();
  renderOrders();
  renderAudits();
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
  const ctx = document.getElementById(id);
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
  mkChart('chart-leads-donut','doughnut',
    Object.keys(src), [{ data:Object.values(src),
      backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6','#f59e0b'],
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
function renderLeads(data=LEADS) {
  set('leads-count', LEADS.length);
  renderPipeline();
  const el = document.getElementById('leads-body');
  if (!el) return;
  const filtered = data.filter(l=>{
    const mq=!_leadsFilter.q||(l.name||'').toLowerCase().includes(_leadsFilter.q)||(l.email||'').toLowerCase().includes(_leadsFilter.q);
    const ms=!_leadsFilter.status||l.status===_leadsFilter.status;
    return mq&&ms;
  });
  if (!filtered.length) { el.innerHTML=`<tr class="empty-row"><td colspan="7">Aucun lead</td></tr>`; return; }
  el.innerHTML = filtered.map(l=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:.625rem;">
        <div class="avatar">${(l.name||l.email||'?')[0].toUpperCase()}</div>
        <div><div class="t-strong t-sm">${l.name||'—'}</div><div class="t-muted" style="font-size:.7rem;">${l.company||''}</div></div>
      </div></td>
      <td class="t-muted t-sm">${l.email||'—'}</td>
      <td class="t-muted t-sm">${l.service||'—'}</td>
      <td class="t-muted t-sm">${l.source||'—'}</td>
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
    </tr>`).join('');
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
  document.getElementById('v-lead-name').textContent = l.name || '—';
  document.getElementById('v-lead-email').textContent = l.email || '—';
  document.getElementById('v-lead-phone').textContent = l.phone || '—';
  document.getElementById('v-lead-company').textContent = l.company || '—';
  document.getElementById('v-lead-service').textContent = l.service || '—';
  document.getElementById('v-lead-source').textContent = l.source || '—';
  document.getElementById('v-lead-message').textContent = l.message || 'Aucun message.';
  
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
  renderPipeline(); updateBadges();
  toast('Statut mis à jour ✓','ok');
}
async function delLead(id) {
  await fetch(`tables/leads/${id}`,{method:'DELETE'});
  LEADS=LEADS.filter(l=>l.id!==id);
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
  set('packs-count', data.length);
  const el = document.getElementById('packs-body');
  if (!el) return;
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun pack</td></tr>`; return; }
  el.innerHTML = data.map(p=>`
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
  document.getElementById('pk-period').value = p?.period||'par mois';
  document.getElementById('pk-desc').value = p?.description||'';
  document.getElementById('pk-features').value = Array.isArray(p?.features)?p.features.join('\n'):'';
  document.getElementById('pk-features-excluded').value = Array.isArray(p?.features_excluded)?p.features_excluded.join('\n'):'';
  document.getElementById('pk-featured').value = p?.is_featured?'true':'false';
  document.getElementById('pk-order').value = p?.sort_order||0;
  document.getElementById('pk-link').value = p?.link||'';
  openModal('m-pack');
}
function editPack(id) { const p=PACKS.find(x=>x.id===id); if(p) openPackModal(p); }

async function savePack() {
  const id = document.getElementById('pk-id').value;
  const name = document.getElementById('pk-name').value.trim();
  if (!name) return toast('Le nom est requis','err');
  const features = document.getElementById('pk-features').value.split('\n').filter(Boolean);
  const features_excluded = document.getElementById('pk-features-excluded').value.split('\n').filter(Boolean);
  const data = {
    name, badge:document.getElementById('pk-badge').value,
    price:document.getElementById('pk-price').value,
    period:document.getElementById('pk-period').value,
    description:document.getElementById('pk-desc').value,
    features, features_excluded,
    is_featured:document.getElementById('pk-featured').value==='true',
    sort_order:parseInt(document.getElementById('pk-order').value)||0,
    link:document.getElementById('pk-link').value
  };
  try {
    if (id) {
      const r = await fetch(`tables/packs/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json(); const i=PACKS.findIndex(x=>x.id===id); if(i>-1) PACKS[i]={...PACKS[i],...up};
      toast('Pack mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/packs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json(); if(cr) PACKS.push(cr);
      toast('Pack ajouté ✓','ok');
    }
    closeModal('m-pack'); renderPacks(); updateBadges();
    await triggerStaticBlogGeneration({ silent: true });
  } catch { toast('Erreur sauvegarde','err'); }
}
async function delPack(id) {
  await fetch(`tables/packs/${id}`,{method:'DELETE'});
  PACKS=PACKS.filter(x=>x.id!==id);
  renderPacks(); updateBadges(); toast('Pack supprimé','ok');
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
