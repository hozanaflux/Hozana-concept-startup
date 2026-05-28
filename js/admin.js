'use strict';

/* ─── STATE ─── */
let P = [], COM = [], LEADS = [], VIEWS = [], ORDERS = [], PF = [], SVCS = [], PACKS = [];
let CH = {};
let _delCb = null;
let _postsFilter = { q: '', cat: '' };
let _leadsFilter = { q: '', status: '' };
let _ordersFilter = { q: '', status: '' };
let _pfFilter = '';
let _comFilter = '';

const LBLS = { new:'Nouveau', contacted:'Contacté', qualified:'Qualifié', converted:'Converti', lost:'Perdu' };
const PIPE_COLS = ['new','contacted','qualified','converted'];

/* ─── AUTH ─── */
async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function togglePwd() {
  const i = document.getElementById('l-pass');
  const ic = document.getElementById('eye-ico');
  if (!i || !ic) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  ic.className = i.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('l-btn');
  const err = document.getElementById('l-err');
  if (!btn || !err) return;
  
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
  } catch (e) {
    console.error(e);
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
const TITLES = { 
  dashboard:'Dashboard', 
  analytics:'Analytics', 
  articles:'Articles', 
  portfolio:'Portfolio', 
  services:'Services',
  packs:'Packs & Tarifs',
  leads:'Leads CRM', 
  orders:'Commandes', 
  comments:'Commentaires', 
  settings:'Paramètres' 
};

const CTA = { 
  articles: { label:'Nouvel article', fn:'openArticleModal()' }, 
  portfolio: { label:'Nouveau projet', fn:'openPfModal()' },
  services: { label:'Nouveau service', fn:'openServiceModal()' },
  packs: { label:'Nouveau pack', fn:'openPackModal()' }
};

function nav(btn, panel) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('panel-' + panel);
  if (target) target.classList.add('active');
  
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = TITLES[panel] || panel;
  
  const cta = CTA[panel];
  const ctaEl = document.getElementById('topbar-cta');
  if (ctaEl) {
    if (cta) {
      ctaEl.innerHTML = `<i class="fas fa-plus"></i> ${cta.label}`;
      ctaEl.setAttribute('onclick', cta.fn);
      ctaEl.style.display = '';
    } else {
      ctaEl.style.display = 'none';
    }
  }
  
  if (panel === 'analytics') renderAnalytics();
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

/* ─── DATA LOAD ─── */
async function initApp() {
  await loadAll();
}

async function loadAll() {
  try {
    const [pr, cr, lr, vr, or, pfr, sr, pkr] = await Promise.allSettled([
      fetch('tables/blog_posts?order=created_at.desc&limit=200').then(r=>r.json()),
      fetch('tables/comments?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/leads?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/page_views?limit=1000').then(r=>r.json()),
      fetch('tables/orders?order=created_at.desc&limit=300').then(r=>r.json()),
      fetch('tables/portfolio_projects?order=sort_order.asc&limit=200').then(r=>r.json()),
      fetch('tables/services?order=sort_order.asc&limit=100').then(r=>r.json()),
      fetch('tables/packs?order=sort_order.asc&limit=50').then(r=>r.json()),
    ]);
    
    if (pr.status==='fulfilled') P     = pr.value.data||[];
    if (cr.status==='fulfilled') COM   = cr.value.data||[];
    if (lr.status==='fulfilled') LEADS = lr.value.data||[];
    if (vr.status==='fulfilled') VIEWS = vr.value.data||[];
    if (or.status==='fulfilled') ORDERS= or.value.data||[];
    if (pfr.status==='fulfilled') PF   = pfr.value.data||[];
    if (sr.status==='fulfilled') SVCS  = sr.value.data||[];
    if (pkr.status==='fulfilled') PACKS = pkr.value.data||[];
  } catch(e) { 
    console.error(e);
    toast('Erreur de chargement','err'); 
  }

  updateBadges();
  renderKPIs();
  renderDashLeads();
  renderDashPosts();
  renderCharts();
  renderPosts();
  renderPortfolio();
  renderServices();
  renderPacks();
  renderLeads();
  renderOrders();
  renderComments();
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
  set('badge-svcs', SVCS.length);
  set('badge-packs', PACKS.length);
  set('badge-com', COM.filter(c=>!c.approved).length||COM.length);
  set('badge-leads', LEADS.filter(l=>l.status==='new').length);
  set('badge-orders', ORDERS.filter(o=>o.status==='paid').length);
}

function set(id,v) { 
  const el=document.getElementById(id); 
  if(el) el.textContent=v; 
}

/* ─── KPIs ─── */
function renderKPIs() {
  const newLeads = LEADS.filter(l=>l.status==='new').length;
  const pubPosts = P.filter(p=>p.published!==false).length;
  const paid = ORDERS.filter(o=>o.status==='paid');
  const rev  = paid.reduce((s,o)=>s+(parseInt(o.amount)||0),0);
  const topPack = (() => {
    const m={}; 
    paid.forEach(o=>{ m[o.pack]=(m[o.pack]||0)+1; });
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
  if (!el) return;
  const data = LEADS.slice(0,5);
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="5">Aucun lead pour l'instant</td></tr>`; return; }
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
    </tr>`).join('');
}

function renderDashPosts() {
  const el = document.getElementById('dash-posts');
  if (!el) return;
  const data = [...P].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="5">Aucun article</td></tr>`; return; }
  el.innerHTML = data.map(p=>`
    <tr>
      <td><div class="text-clip t-strong">${p.title}</div></td>
      <td><span class="badge badge-red">${p.category||'—'}</span></td>
      <td class="t-sm">${(p.views||0).toLocaleString()}</td>
      <td class="t-sm">❤️ ${p.likes||0}</td>
      <td><span class="badge ${p.published!==false?'badge-green':'badge-gray'}">${p.published!==false?'Publié':'Brouillon'}</span></td>
    </tr>`).join('');
}

/* ─── CHARTS ─── */
const CO = { 
  responsive:true, 
  maintainAspectRatio:false,
  plugins:{ 
    legend:{ labels:{ color:'rgba(240,240,245,.5)', font:{ family:'Space Grotesk', size:11 } } } 
  },
  scales:{ 
    x:{ ticks:{ color:'rgba(240,240,245,.35)', font:{size:10} }, grid:{ color:'rgba(255,255,255,.05)' } },
    y:{ ticks:{ color:'rgba(240,240,245,.35)', font:{size:10} }, grid:{ color:'rgba(255,255,255,.05)' } } 
  }
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
    dayCounts.push(LEADS.filter(l=>l.created_at && l.created_at.startsWith(ds)).length);
  }
  
  mkChart('chart-leads-line','line',
    days.filter((_,i)=>i%3===0||i===29), 
    [{ 
      label:'Leads', 
      data:dayCounts.filter((_,i)=>i%3===0||i===29),
      borderColor:'#FF2E2E', 
      backgroundColor:'rgba(255,46,46,.08)',
      fill:true, tension:.4, pointRadius:3, pointBackgroundColor:'#FF2E2E', borderWidth:2 
    }]
  );

  // Leads donut
  const src={}; 
  LEADS.forEach(l=>{ src[l.source||'direct']=(src[l.source||'direct']||0)+1; });
  
  mkChart('chart-leads-donut','doughnut',
    Object.keys(src), 
    [{ 
      data:Object.values(src),
      backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6','#f59e0b'],
      borderWidth:0, hoverOffset:8 
    }],
    { 
      scales:{}, 
      plugins:{ legend:{ position:'bottom', labels:{ color:'rgba(240,240,245,.5)', boxWidth:12, font:{size:11} } } } 
    }
  );
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
  const pMap={}; 
  VIEWS.forEach(v=>{ pMap[v.page||'index']=(pMap[v.page||'index']||0)+1; });
  const tot = Object.values(pMap).reduce((s,v)=>s+v,0);
  const el = document.getElementById('an-pages');
  if (el) {
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
  }

  // Charts
  setTimeout(()=>{
    const cc={}; 
    P.forEach(p=>{ cc[p.category||'IA']=(cc[p.category||'IA']||0)+1; });
    mkChart('chart-cat','bar',Object.keys(cc),
      [{ 
        data:Object.values(cc), 
        backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e','#8b5cf6'],
        borderRadius:4, borderWidth:0 
      }],
      { scales:CO.scales, plugins:{ legend:{display:false} } }
    );

    const pc={}; 
    ORDERS.filter(o=>o.status==='paid').forEach(o=>{ pc[o.pack]=(pc[o.pack]||0)+1; });
    mkChart('chart-packs','doughnut',Object.keys(pc),
      [{ 
        data:Object.values(pc), 
        backgroundColor:['#FF2E2E','#FF6A00','#3b82f6','#22c55e'], 
        borderWidth:0, hoverOffset:6 
      }],
      { 
        scales:{}, 
        plugins:{ legend:{ position:'bottom', labels:{ color:'rgba(240,240,245,.5)', boxWidth:12, font:{size:11} } } } 
      }
    );
  }, 150);
}

/* ─── ARTICLES ─── */
function renderPosts(data=P) {
  set('posts-count', data.length);
  const el = document.getElementById('posts-body');
  if (!el) return;
  if (!data.length) { el.innerHTML=`<tr class="empty-row"><td colspan="8">Aucun article trouvé</td></tr>`; return; }
  el.innerHTML = data.map(p=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:.625rem;">
          <img class="thumb" src="${p.cover_image||''}" onerror="this.style.display='none'">
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
        <button class="act" onclick="editArticle('${p.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <a class="act" href="/article?id=${p.id}" target="_blank" title="Voir"><i class="fas fa-eye"></i></a>
        <button class="act del" onclick="confirmDel(()=>delPost('${p.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
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

function openArticleModal(post=null) {
  document.getElementById('m-article-title').textContent = post?'Modifier l\'article':'Nouvel article';
  document.getElementById('a-id').value = post?.id||'';
  document.getElementById('a-title').value = post?.title||'';
  document.getElementById('a-cat').value = post?.category||'IA';
  document.getElementById('a-author').value = post?.author||'Marcus Hozana';
  document.getElementById('a-excerpt').value = post?.excerpt||'';
  document.getElementById('a-content').value = post?.content||'';
  document.getElementById('a-img').value = post?.cover_image||'';
  document.getElementById('a-readtime').value = post?.read_time||5;
  document.getElementById('a-tags').value = Array.isArray(post?.tags)?post.tags.join(', '):(post?.tags||'');
  document.getElementById('a-pub').value = post?.published!==false?'true':'false';
  openModal('m-article');
}

function editArticle(id) { const p=P.find(x=>x.id===id); if(p) openArticleModal(p); }

async function saveArticle() {
  const id = document.getElementById('a-id').value;
  const title = document.getElementById('a-title').value.trim();
  if (!title) { toast('Le titre est obligatoire','err'); return; }
  const tags = document.getElementById('a-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const data = {
    title, category:document.getElementById('a-cat').value,
    author:document.getElementById('a-author').value,
    excerpt:document.getElementById('a-excerpt').value,
    content:document.getElementById('a-content').value,
    cover_image:document.getElementById('a-img').value,
    read_time:parseInt(document.getElementById('a-readtime').value)||5,
    tags, published:document.getElementById('a-pub').value==='true',
    slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
    updated_at:new Date().toISOString()
  };
  if (!id) { data.views=0; data.likes=0; data.created_at=new Date().toISOString(); }
  try {
    if (id) {
      const r = await fetch(`tables/blog_posts/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json();
      const i = P.findIndex(p=>p.id===id);
      if (i>-1) P[i]={...P[i],...up};
      toast('Article mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/blog_posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json();
      if (cr) P.unshift(cr);
      toast('Article créé ✓','ok');
    }
    closeModal('m-article');
    renderPosts(); renderDashPosts(); updateBadges();
  } catch(e) { console.error(e); toast('Erreur lors de la sauvegarde','err'); }
}

async function delPost(id) {
  await fetch(`tables/blog_posts/${id}`,{method:'DELETE'});
  P = P.filter(p=>p.id!==id);
  renderPosts(); renderDashPosts(); updateBadges(); renderKPIs();
  toast('Article supprimé','ok');
}

/* ─── PORTFOLIO ─── */
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
      ${p.image
        ? `<img class="pf-img" src="${p.image}" alt="${p.title}" onerror="this.parentElement.querySelector('.pf-img').remove()">`
        : `<div class="pf-img-placeholder"><i class="fas fa-image"></i></div>`}
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
  if (!wrap || !img) return;
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
  } catch(e) { console.error(e); toast('Erreur lors de la sauvegarde','err'); }
}

async function delPortfolio(id) {
  await fetch(`tables/portfolio_projects/${id}`,{method:'DELETE'});
  PF = PF.filter(p=>p.id!==id);
  renderPortfolio(); updateBadges();
  toast('Projet supprimé','ok');
}

/* ─── SERVICES ─── */
function renderServices() {
  set('svcs-count', SVCS.length);
  const el = document.getElementById('svcs-body');
  if (!el) return;
  if (!SVCS.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun service défini</td></tr>`; return; }
  el.innerHTML = SVCS.map(s=>`
    <tr>
      <td><div class="t-strong t-sm">${s.title}</div></td>
      <td class="t-muted t-sm">${s.category_label||'—'}</td>
      <td class="t-muted t-sm">${s.slug}</td>
      <td><span class="badge ${s.is_star?'badge-orange':'badge-gray'}">${s.is_star?'⭐ Star':'Normal'}</span></td>
      <td class="t-sm">${s.sort_order||0}</td>
      <td><div class="acts">
        <button class="act" onclick="editService('${s.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="act del" onclick="confirmDel(()=>delService('${s.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function openServiceModal(svc=null) {
  document.getElementById('m-svc-title').textContent = svc?'Modifier le service':'Nouveau service';
  document.getElementById('svc-id').value = svc?.id||'';
  document.getElementById('svc-title').value = svc?.title||'';
  document.getElementById('svc-slug').value = svc?.slug||'';
  document.getElementById('svc-icon').value = svc?.icon||'';
  document.getElementById('svc-cat').value = svc?.category_label||'';
  document.getElementById('svc-desc').value = svc?.description||'';
  document.getElementById('svc-order').value = svc?.sort_order||0;
  document.getElementById('svc-star').value = svc?.is_star?'true':'false';
  document.getElementById('svc-features').value = Array.isArray(svc?.features)?svc.features.join('\n'):'';
  openModal('m-service');
}

function editService(id) { const s=SVCS.find(x=>x.id===id); if(s) openServiceModal(s); }

async function saveService() {
  const id = document.getElementById('svc-id').value;
  const title = document.getElementById('svc-title').value.trim();
  if (!title) { toast('Titre obligatoire','err'); return; }
  const data = {
    title, slug:document.getElementById('svc-slug').value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    icon:document.getElementById('svc-icon').value,
    category_label:document.getElementById('svc-cat').value,
    description:document.getElementById('svc-desc').value,
    sort_order:parseInt(document.getElementById('svc-order').value)||0,
    is_star:document.getElementById('svc-star').value==='true',
    features:document.getElementById('svc-features').value.split('\n').map(f=>f.trim()).filter(Boolean)
  };
  try {
    if (id) {
      const r = await fetch(`tables/services/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json();
      const i=SVCS.findIndex(x=>x.id===id); if(i>-1) SVCS[i]={...SVCS[i],...up};
      toast('Service mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/services',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json(); if(cr) SVCS.push(cr);
      toast('Service ajouté ✓','ok');
    }
    closeModal('m-service');
    renderServices(); updateBadges();
  } catch(e) { console.error(e); toast('Erreur sauvegarde','err'); }
}

async function delService(id) {
  await fetch(`tables/services/${id}`,{method:'DELETE'});
  SVCS = SVCS.filter(x=>x.id!==id);
  renderServices(); updateBadges();
  toast('Service supprimé','ok');
}

/* ─── PACKS ─── */
function renderPacks() {
  set('packs-count', PACKS.length);
  const el = document.getElementById('packs-body');
  if (!el) return;
  if (!PACKS.length) { el.innerHTML=`<tr class="empty-row"><td colspan="6">Aucun pack défini</td></tr>`; return; }
  el.innerHTML = PACKS.map(p=>`
    <tr>
      <td><div class="t-strong t-sm">${p.name}</div></td>
      <td class="t-sm">${p.price_monthly||0}€ / ${p.price_annual||0}€</td>
      <td><span class="badge ${p.is_featured?'badge-purple':'badge-gray'}">${p.is_featured?'⭐ Featured':'Normal'}</span></td>
      <td class="t-muted t-sm">${p.badge_text||'—'}</td>
      <td class="t-sm">${p.sort_order||0}</td>
      <td><div class="acts">
        <button class="act" onclick="editPack('${p.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="act del" onclick="confirmDel(()=>delPack('${p.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function openPackModal(pack=null) {
  document.getElementById('m-pack-title').textContent = pack?'Modifier le pack':'Nouveau pack';
  document.getElementById('pk-id').value = pack?.id||'';
  document.getElementById('pk-name').value = pack?.name||'';
  document.getElementById('pk-slug').value = pack?.slug||'';
  document.getElementById('pk-price-m').value = pack?.price_monthly||0;
  document.getElementById('pk-price-a').value = pack?.price_annual||0;
  document.getElementById('pk-badge').value = pack?.badge_text||'';
  document.getElementById('pk-desc').value = pack?.description||'';
  document.getElementById('pk-order').value = pack?.sort_order||0;
  document.getElementById('pk-feat').value = pack?.is_featured?'true':'false';
  document.getElementById('pk-features').value = Array.isArray(pack?.features)?pack.features.join('\n'):'';
  document.getElementById('pk-excluded').value = Array.isArray(pack?.excluded_features)?pack.excluded_features.join('\n'):'';
  openModal('m-pack');
}

function editPack(id) { const p=PACKS.find(x=>x.id===id); if(p) openPackModal(p); }

async function savePack() {
  const id = document.getElementById('pk-id').value;
  const name = document.getElementById('pk-name').value.trim();
  if (!name) { toast('Nom obligatoire','err'); return; }
  const data = {
    name, slug:document.getElementById('pk-slug').value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    price_monthly:parseInt(document.getElementById('pk-price-m').value)||0,
    price_annual:parseInt(document.getElementById('pk-price-a').value)||0,
    badge_text:document.getElementById('pk-badge').value,
    description:document.getElementById('pk-desc').value,
    sort_order:parseInt(document.getElementById('pk-order').value)||0,
    is_featured:document.getElementById('pk-feat').value==='true',
    features:document.getElementById('pk-features').value.split('\n').map(f=>f.trim()).filter(Boolean),
    excluded_features:document.getElementById('pk-excluded').value.split('\n').map(f=>f.trim()).filter(Boolean)
  };
  try {
    if (id) {
      const r = await fetch(`tables/packs/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const up = await r.json();
      const i=PACKS.findIndex(x=>x.id===id); if(i>-1) PACKS[i]={...PACKS[i],...up};
      toast('Pack mis à jour ✓','ok');
    } else {
      const r = await fetch('tables/packs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const cr = await r.json(); if(cr) PACKS.push(cr);
      toast('Pack ajouté ✓','ok');
    }
    closeModal('m-pack');
    renderPacks(); updateBadges();
  } catch(e) { console.error(e); toast('Erreur sauvegarde','err'); }
}

async function delPack(id) {
  await fetch(`tables/packs/${id}`,{method:'DELETE'});
  PACKS = PACKS.filter(x=>x.id!==id);
  renderPacks(); updateBadges();
  toast('Pack supprimé','ok');
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
          <option value="lost" ${l.status==='lost'?'selected':''}>Perdu</option>
        </select>
      </td>
      <td class="t-muted t-sm">${fmt(l.created_at)}</td>
      <td><div class="acts"><button class="act del" onclick="confirmDel(()=>delLead('${l.id}'))"><i class="fas fa-trash"></i></button></div></td>
    </tr>`).join('');
}

function filterLeads(q) { _leadsFilter.q=q.toLowerCase(); renderLeads(); }
function filterLeadsStatus(s) { _leadsFilter.status=s; renderLeads(); }

function renderPipeline() {
  const el = document.getElementById('leads-pipeline');
  if (!el) return;
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
          <div class="pipe-item">
            <div class="pipe-item-name">${l.name||l.email||'—'}</div>
            <div class="pipe-item-meta">${l.service||l.source||'—'} · ${fmt(l.created_at)}</div>
          </div>`).join('')}
        ${items.length>5?`<div class="t-muted t-sm" style="padding:.25rem;text-align:center;">+${items.length-5} autres</div>`:''}
      </div>`;
  }).join('');
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
        <button class="act del" onclick="confirmDel(()=>delOrder('${o.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
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
        <button class="act del" onclick="confirmDel(()=>delComment('${c.id}'))" title="Supprimer"><i class="fas fa-trash"></i></button>
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
  const confirmBtn = document.getElementById('confirm-ok');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      try { await _delCb(); } catch (e) { console.error(e); toast('Erreur suppression','err'); }
      closeModal('m-confirm');
    };
  }
  openModal('m-confirm');
}

/* ─── MODAL UTILS ─── */
function openModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.add('open'); 
}

function closeModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.remove('open'); 
}

function closeIfBg(e,id) { 
  if(e.target===document.getElementById(id)) closeModal(id); 
}

document.addEventListener('keydown', e=>{ 
  if(e.key==='Escape') document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open')); 
});

/* ─── TOAST ─── */
function toast(msg, type='info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const t = document.createElement('div');
  t.className = 'toast'+(type==='ok'?' ok':type==='err'?' err':type==='warn'?' warn':'');
  const icons = {ok:'✅', err:'❌', warn:'⚠️', info:'ℹ️'};
  t.innerHTML = `${icons[type]||'💬'} ${msg}`;
  area.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
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
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.onsubmit = doLogin;

  if (sessionStorage.getItem('hzn-auth')==='1') {
    const loginScreen = document.getElementById('login-screen');
    const adminApp = document.getElementById('admin-app');
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminApp) adminApp.style.display = 'flex';
    initApp();
  }
});

// Export to window for inline attributes
window.nav = nav;
window.refreshAll = refreshAll;
window.doLogout = doLogout;
window.togglePwd = togglePwd;
window.openArticleModal = openArticleModal;
window.editArticle = editArticle;
window.saveArticle = saveArticle;
window.confirmDel = confirmDel;
window.delPost = delPost;
window.filterPosts = filterPosts;
window.filterPostsCat = filterPostsCat;
window.openPfModal = openPfModal;
window.editPortfolio = editPortfolio;
window.savePortfolio = savePortfolio;
window.delPortfolio = delPortfolio;
window.filterPortfolio = filterPortfolio;
window.previewPfImg = previewPfImg;
window.updateLeadStatus = updateLeadStatus;
window.delLead = delLead;
window.filterLeads = filterLeads;
window.filterLeadsStatus = filterLeadsStatus;
window.setOrderPaid = setOrderPaid;
window.delOrder = delOrder;
window.filterOrders = filterOrders;
window.filterOrdersStatus = filterOrdersStatus;
window.approveComment = approveComment;
window.delComment = delComment;
window.filterComments = filterComments;
window.closeModal = closeModal;
window.closeIfBg = closeIfBg;
window.setTheme = setTheme;
window.openServiceModal = openServiceModal;
window.editService = editService;
window.saveService = saveService;
window.delService = delService;
window.openPackModal = openPackModal;
window.editPack = editPack;
window.savePack = savePack;
window.delPack = delPack;
