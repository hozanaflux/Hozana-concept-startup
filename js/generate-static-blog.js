/* ============================================================
   Hozana Concept - Static Blog Generator
   Generates static HTML files for each blog post from Supabase
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { generateSchemaMarkup, enhanceMetaTags, enhanceImageAltText } = require('./blog-seo-node');

// ─── Supabase Config (public anon key — safe for server-side) ───
const SUPABASE_URL  = 'https://leadvqrheziyvrwnbiio.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYWR2cXJoZXppeXZyd25iaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM0MTksImV4cCI6MjA5MzU0OTQxOX0.I-L13gdtuQnsJ4ErEb-SWWfdbMUhWOkTvSFOSkNxsD0';
const SITE_URL      = 'https://www.hozanaconcept.com';

// ─── Paths ───
const TEMPLATE_PATH    = path.join(__dirname, '..', 'article.html');
const OUTPUT_DIR       = path.join(__dirname, '..', 'blog-posts');
const PACK_OUTPUT_DIR  = path.join(__dirname, '..', 'pack-details');
const SITEMAP_PATH     = path.join(__dirname, '..', 'sitemap.xml');
const ROBOTS_PATH      = path.join(__dirname, '..', 'robots.txt');
const SCRIPTS_DIR      = path.join(__dirname, '..', 'scripts');
const BLOG_PAGE_PATH   = path.join(__dirname, '..', 'blog.html');
const PRICING_PATH     = path.join(__dirname, '..', 'pricing.html');
const PACK_TEMPLATE_PATH = path.join(__dirname, '..', 'pack-detail.html');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(PACK_OUTPUT_DIR)) {
  fs.mkdirSync(PACK_OUTPUT_DIR, { recursive: true });
}

// ─── Load Template ───
let templateContent;
try {
  templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch (err) {
  console.error('❌ Error loading template:', err.message);
  process.exit(1);
}

/* ============================================================
   FETCH POSTS FROM SUPABASE
   ============================================================ */
async function fetchPublishedPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=*&published=eq.true&order=publish_date.desc.nullslast,created_at.desc`;

  const headers = {
    'apikey':        SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Accept':        'application/json'
  };

  // Use Node.js 18+ global fetch
  const response = await fetch(url, { headers, cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.status} ${response.statusText}`);
  }

  const posts = await response.json();
  console.log(`📄 Fetched ${posts.length} published posts from Supabase`);
  return Array.isArray(posts) ? posts : [];
}

async function fetchPacks() {
  const catalog = await fetchCatalog();
  return catalog.packs;
}

async function fetchCatalog() {
  const fallback = getDefaultPacks();
  const url = `${SUPABASE_URL}/rest/v1/packs?select=*&order=sort_order.asc.nullslast,name.asc`;
  const headers = {
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const rows = await response.json();
    const enriched = Array.isArray(rows) ? rows.map(enrichPack) : [];
    const packRows = enriched.filter(item => item.itemType !== 'option');
    const packs = normalizeFeaturedPack(packRows.length ? mergeWithDefaultPacks(packRows) : fallback);
    const options = await fetchPackOptions();
    console.log(`📦 Fetched ${packs.length} pricing pack(s) and ${options.length} option(s) from Supabase`);
    return { packs, options };
  } catch (err) {
    console.warn(`⚠️  Could not fetch packs from Supabase (${err.message}). Using static fallback packs.`);
    return { packs: fallback, options: getDefaultOptions() };
  }
}

async function fetchPackOptions() {
  const url = `${SUPABASE_URL}/rest/v1/pack_options?select=*&order=sort_order.asc.nullslast,name.asc`;
  const headers = {
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const rows = await response.json();
    const options = Array.isArray(rows) ? rows.map(enrichOption) : [];
    return options.length ? options : getDefaultOptions();
  } catch (err) {
    console.warn(`⚠️  Could not fetch pack_options from Supabase (${err.message}). Using static fallback options.`);
    return getDefaultOptions();
  }
}

/* ============================================================
   GENERATE STATIC POST
   ============================================================ */
async function generateStaticPost(post) {
  try {
    const slug = post.slug || slugify(post.title || post.id) || `article-${post.id || Date.now()}`;
    post = { ...post, slug };
    const dom = new JSDOM(templateContent);
    const document = dom.window.document;

    // ── SEO: meta tags ──
    enhanceMetaTags(post, document);

    // ── Schema markup ──
    const schemaMarkup = generateSchemaMarkup(post);
    document.head.insertAdjacentHTML('beforeend', schemaMarkup);

    // ── Image alt text ──
    enhanceImageAltText(document);

    // ── Update content ──
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = post.title;

    const excerptEl = document.getElementById('article-excerpt');
    if (excerptEl) {
      excerptEl.textContent = post.excerpt || 'Une analyse Hozana Concept pour transformer les idées en décisions concrètes, lisibles et actionnables.';
    }

    const ctaTitleEl = document.getElementById('article-cta-title');
    if (ctaTitleEl) {
      ctaTitleEl.textContent = `Appliquez cette lecture à votre ${post.category ? String(post.category).toLowerCase() : 'croissance'}`;
    }
    const ctaTextEl = document.getElementById('article-cta-text');
    if (ctaTextEl) {
      ctaTextEl.textContent = 'Nos experts peuvent traduire ce sujet en plan opérationnel : audit, priorités, automatisations utiles et premières actions mesurables.';
    }

    const coverEl = document.getElementById('article-cover');
    if (coverEl) {
      const img = resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover);
      coverEl.src = img;
      coverEl.alt = post.title;
      // Remove the JS-driven src override on error since we pre-set it
      coverEl.removeAttribute('onerror');
    }

    const catBreadcrumb = document.getElementById('article-cat-breadcrumb');
    if (catBreadcrumb) catBreadcrumb.textContent = post.category || 'IA';

    const badgesEl = document.getElementById('article-badges');
    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="badge badge-red">${escapeHtml(post.category || 'IA')}</span>
        ${post.featured ? '<span class="badge badge-orange">⭐ Featured</span>' : ''}
      `;
    }

    const metaEl = document.getElementById('article-hero-meta');
    if (metaEl) {
      const initials = (post.author || 'HC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const date = formatDate(post.publish_date || post.created_at);
      metaEl.innerHTML = `
        <span style="display:flex;align-items:center;gap:0.5rem;">
          <span style="width:32px;height:32px;border-radius:50%;background:var(--grad-red);display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;">${initials}</span>
          ${escapeHtml(post.author || 'Hozana Concept')}
        </span>
        ${date ? `<span><i class="fas fa-calendar-alt" style="margin-right:0.3rem;color:var(--red);"></i>${date}</span>` : ''}
        <span><i class="fas fa-clock" style="margin-right:0.3rem;color:var(--red);"></i>${post.read_time || 5} min de lecture</span>
        <span><i class="fas fa-eye" style="margin-right:0.3rem;color:var(--red);"></i>${formatNum((post.views || 0) + 1)} vues</span>
      `;
    }

    // ── Article body ──
    const bodyEl = document.getElementById('article-body');
    if (bodyEl) {
      let content = post.content || '';

      // If content doesn't appear to contain HTML tags, treat as plain text and convert to HTML
      if (content && !/<[a-z][\s\S]*>/i.test(content)) {
        content = convertPlainTextToHtml(content);
      }

      bodyEl.innerHTML = content || '<p>Contenu à venir...</p>';
      normalizeArticleBodyImages(bodyEl, post.title);
    }

    // ── Tags ──
    const tagsEl = document.getElementById('article-tags');
    if (tagsEl && post.tags) {
      const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      if (tags.length > 0) {
        tagsEl.innerHTML = tags.map(t => `
          <span style="padding:0.3rem 0.875rem;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-full);font-size:0.78rem;color:var(--white-50);font-family:var(--font-accent);">#${escapeHtml(t.trim())}</span>
        `).join('');
      }
    }

    // ── Author sidebar ──
    const authorNameEl = document.getElementById('author-name');
    if (authorNameEl) authorNameEl.textContent = post.author || 'Hozana Concept';
    const authorAvatarEl = document.getElementById('author-avatar');
    if (authorAvatarEl) {
      const initials = (post.author || 'HC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      authorAvatarEl.textContent = initials;
    }

    // ── Stats ──
    ['stat-views', 'stat-likes', 'stat-read', 'stat-comments'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'stat-views')      el.textContent = formatNum((post.views || 0) + 1);
      else if (id === 'stat-likes') el.textContent = formatNum(post.likes || 0);
      else if (id === 'stat-read')  el.textContent = `${post.read_time || 5} min`;
      else if (id === 'stat-comments') el.textContent = '0';
    });

    // ── Like count ──
    const likeCountEl = document.getElementById('like-count');
    if (likeCountEl) likeCountEl.textContent = formatNum(post.likes || 0);

    // ── Lang attribute ──
    document.documentElement.setAttribute('lang', 'fr');

    // ── Fix page title ──
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) pageTitleEl.textContent = `${post.title} | Hozana Concept Blog`;

    // ── Fix meta description ──
    const pageDesc = document.getElementById('page-desc');
    if (pageDesc) pageDesc.setAttribute('content', post.excerpt || `Découvrez l'article de Hozana Concept : ${post.title}`);

    // ── Set root path for blog-posts subfolder ──
    // This allows components.js (navbar, footer) to resolve paths correctly
    const rootPathScript = dom.window.document.createElement('script');
    rootPathScript.textContent = 'window.__ROOT_PATH__ = "../";';
    document.head.insertBefore(rootPathScript, document.head.firstChild);

    // ── Inject static post data for client-side interactivity ──
    // This avoids the JS needing to parse ?id= from URL or fetch from Supabase
    const staticDataScript = dom.window.document.createElement('script');
    staticDataScript.textContent = `
window.__STATIC_BLOG_DATA__ = {
  id: ${JSON.stringify(post.id)},
  slug: ${JSON.stringify(post.slug || '')},
  title: ${JSON.stringify(post.title)},
  author: ${JSON.stringify(post.author || 'Hozana Concept')},
  category: ${JSON.stringify(post.category || 'IA')},
  cover_image: ${JSON.stringify(post.cover_image || post.image || post.img || post.thumbnail || post.cover || '')},
  excerpt: ${JSON.stringify(post.excerpt || '')},
  read_time: ${post.read_time || 5},
  views: ${post.views || 0},
  likes: ${post.likes || 0},
  tags: ${JSON.stringify(Array.isArray(post.tags) ? post.tags : (post.tags ? String(post.tags).split(',').map(t => t.trim()).filter(Boolean) : []))},
  publish_date: ${JSON.stringify(post.publish_date || post.created_at || '')},
  updated_at: ${JSON.stringify(post.updated_at || post.publish_date || post.created_at || '')},
  featured: ${!!post.featured}
};
`;
    document.head.appendChild(staticDataScript);

    // ── Generate filename ──
    const filename = `${slug}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // ── Serialize and fix relative paths ──
    let html = dom.serialize();
    html = fixRelativePaths(html);
    fs.writeFileSync(filepath, cleanGeneratedText(html));

    console.log(`✅ Generated: ${filename}`);
    return { filename, slug, title: post.title, id: post.id, post };
  } catch (err) {
    console.error(`❌ Error generating post "${post.title || post.id}":`, err.message);
    return null;
  }
}

/* ============================================================
   SITEMAP GENERATOR
   ============================================================ */
function generateSitemap(posts, packs = []) {
  const baseUrl = `${SITE_URL}/blog-posts/`;
  const now = new Date().toISOString();
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add main pages
  const mainPages = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/platform`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/portfolio`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/pricing`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/contact`, priority: '0.7', changefreq: 'monthly' },
  ];
  const englishPages = [
    { loc: `${SITE_URL}/en/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/en/blog.html`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/en/platform.html`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/en/portfolio.html`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/en/pricing.html`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/en/contact.html`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/en/company.html`, priority: '0.7', changefreq: 'monthly' },
  ];

  for (const page of [...mainPages, ...englishPages]) {
    sitemap += `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  // Add blog posts
  posts.forEach(post => {
    if (post && post.filename) {
      const slug = post.filename.replace('.html', '');
      const lastmod = safeIsoDate(post.post?.updated_at || post.post?.publish_date || post.post?.created_at || now);
      sitemap += `  <url>
    <loc>${baseUrl}${slug}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      sitemap += `  <url>
    <loc>${SITE_URL}/en/blog-posts/${slug}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  });

  packs.forEach(item => {
    if (!item || !item.filename) return;
    sitemap += `  <url>
    <loc>${SITE_URL}/pack-details/${item.filename}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    sitemap += `  <url>
    <loc>${SITE_URL}/en/pack-details/${item.filename}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });

  sitemap += `</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, cleanGeneratedText(sitemap));
  console.log('🗺️  Sitemap generated successfully');
}

function generateRobotsTxt() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-hozana-concept-admin/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(ROBOTS_PATH, cleanGeneratedText(robots));
  console.log('🤖 robots.txt generated successfully');
}

function generateStaticBlogIndex(generatedPosts) {
  if (!fs.existsSync(BLOG_PAGE_PATH)) return;
  const posts = generatedPosts.map(item => ({ ...item.post, slug: item.slug, filename: item.filename }));
  const dom = new JSDOM(fs.readFileSync(BLOG_PAGE_PATH, 'utf8'));
  const document = dom.window.document;
  const featured = posts[0];
  const gridPosts = featured ? posts.filter(p => p.id !== featured.id).slice(0, 6) : posts.slice(0, 6);

  upsertMetaNode(document, 'name', 'description', 'Articles experts Hozana Concept sur l intelligence artificielle, l automatisation, le growth digital et la transformation des entreprises.');
  upsertCanonical(document, `${SITE_URL}/blog`);
  document.title = 'Blog IA, Automatisation & Growth Digital | Hozana Concept';

  const stat = document.getElementById('stat-articles');
  if (stat) stat.textContent = `${posts.length}+`;

  const featuredEl = document.getElementById('featured-section');
  if (featuredEl) {
    featuredEl.innerHTML = featured ? `
      <div class="section-heading-row">
        <h2><i class="fas fa-star"></i> À la une</h2>
      </div>
      ${renderStaticFeaturedPost(featured)}
    ` : '';
  }

  const grid = document.getElementById('articles-grid');
  if (grid) {
    grid.innerHTML = gridPosts.length
      ? gridPosts.map(renderStaticArticleCard).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--white-50);">Aucun article publié pour le moment.</div>';
  }

  const count = document.getElementById('results-count');
  if (count) count.textContent = `(${posts.length} article${posts.length > 1 ? 's' : ''})`;

  const popular = document.getElementById('popular-list');
  if (popular) {
    popular.innerHTML = [...posts]
      .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 2) - ((a.views || 0) + (a.likes || 0) * 2))
      .slice(0, 4)
      .map((p, i) => renderStaticPopularPost(p, i))
      .join('');
  }

  const tagsCloud = document.querySelector('.tags-cloud');
  if (tagsCloud) {
    const tags = collectTags(posts).slice(0, 14);
    tagsCloud.innerHTML = tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
  }

  injectJsonLd(document, {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Hozana Concept',
    description: 'Articles sur l intelligence artificielle, l automatisation et le growth digital.',
    url: `${SITE_URL}/blog`,
    inLanguage: 'fr-FR',
    blogPost: posts.slice(0, 12).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title || '',
      url: `${SITE_URL}/blog-posts/${p.slug}.html`,
      datePublished: safeIsoDate(p.publish_date || p.created_at),
      author: { '@type': 'Person', name: p.author || 'Hozana Concept' }
    }))
  }, 'static-blog-jsonld');

  fs.writeFileSync(BLOG_PAGE_PATH, cleanGeneratedText(dom.serialize()));
  console.log('📰 Static blog listing injected into blog.html');
}

function generatePricingPage(packs, options = []) {
  if (!fs.existsSync(PRICING_PATH)) return;
  const dom = new JSDOM(fs.readFileSync(PRICING_PATH, 'utf8'));
  const document = dom.window.document;
  const container = document.getElementById('packs-container');
  if (container) {
    container.style.gridTemplateColumns = `repeat(${Math.min(Math.max(packs.length, 1), 4)}, 1fr)`;
    container.innerHTML = packs.map(renderStaticPackCard).join('');
  }
  const compare = document.querySelector('.compare-table');
  if (compare) compare.innerHTML = renderComparisonTable(packs);
  const addons = document.getElementById('options-container') || document.querySelector('#pricing-options-grid') || document.querySelector('section:nth-of-type(4) .grid-3');
  if (addons) {
    addons.id = 'options-container';
    addons.innerHTML = options.map(renderOptionCard).join('');
  }

  upsertMetaNode(document, 'name', 'description', 'Comparez les packs IA Hozana Concept : Starter, Growth, Elite et Enterprise. Tarifs HT, fonctionnalités incluses, support, automatisations, chatbots IA et accompagnement.');
  upsertCanonical(document, `${SITE_URL}/pricing`);
  injectJsonLd(document, buildPricingJsonLd(packs), 'static-pricing-jsonld');
  injectJsonLd(document, buildPricingFaqJsonLd(document), 'static-pricing-faq-jsonld');

  fs.writeFileSync(PRICING_PATH, cleanGeneratedText(dom.serialize()));
  console.log('💶 Static pricing packs injected into pricing.html');
}

function generateStaticPackPages(packs, options = []) {
  if (!fs.existsSync(PACK_TEMPLATE_PATH)) return [];
  const template = fs.readFileSync(PACK_TEMPLATE_PATH, 'utf8');
  const generated = [];

  for (const pack of packs) {
    if (pack.isEnterprise) continue;
    const dom = new JSDOM(template);
    const document = dom.window.document;
    const key = pack.key || slugify(pack.name);
    const slug = pack.slug || key;
    const url = `${SITE_URL}/pack-details/${slug}.html`;

    document.title = `${pack.name} | Pack IA et automatisation Hozana Concept`;
    upsertMetaNode(document, 'name', 'description', `${pack.name} : ${pack.description} Prix, fonctionnalités, planning et résultats attendus pour votre transformation IA.`);
    upsertCanonical(document, url);

    const staticScript = document.createElement('script');
    staticScript.textContent = `window.__STATIC_PACK_KEY__ = ${JSON.stringify(key)};
window.__STATIC_PACK_DATA__ = ${JSON.stringify({
      name: pack.name,
      description: pack.description,
      priceMonthly: pack.priceMonthly,
      priceAnnual: pack.priceAnnual,
      oldPriceMonthly: pack.oldPriceMonthly,
      badge: pack.badge,
      featured: pack.isFeatured,
      isFeatured: pack.isFeatured
    })};`;
    document.head.insertBefore(staticScript, document.head.firstChild);

    const hero = document.getElementById('pack-hero-display');
    if (hero) hero.innerHTML = renderStaticPackHero(pack);
    const features = document.getElementById('feature-groups-display');
    if (features) features.innerHTML = renderStaticPackFeatureGroups(pack);
    const timeline = document.getElementById('timeline-display');
    if (timeline) timeline.innerHTML = renderStaticTimeline(pack);
    const results = document.getElementById('results-display');
    if (results) results.innerHTML = renderStaticResults(pack);
    const testimonial = document.getElementById('testimonial-display');
    if (testimonial) testimonial.innerHTML = renderStaticTestimonial(pack);
    const faq = document.getElementById('faq-display');
    if (faq) faq.innerHTML = getPackFaqs().map((f, i) => `
      <div class="faq-mini-item" id="faq-${i}">
        <div class="faq-mini-q">${escapeHtml(f.q)}<i class="fas fa-plus faq-mini-icon"></i></div>
        <div class="faq-mini-a open" id="faq-a-${i}">${escapeHtml(f.a)}</div>
      </div>
    `).join('');
    const side = document.getElementById('sidebar-features');
    if (side) side.innerHTML = pack.sidebarFeatures.map(f => `<li style="display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:var(--white-70);"><i class="fas fa-check" style="color:#22c55e;font-size:0.75rem;flex-shrink:0;"></i>${escapeHtml(f)}</li>`).join('');
    injectPackOptions(document, options);

    const summaryName = document.getElementById('summary-pack-name');
    if (summaryName) summaryName.textContent = pack.name;
    const summaryBase = document.getElementById('summary-base-price');
    if (summaryBase) summaryBase.textContent = pack.priceMonthly ? `${pack.priceMonthly}€` : 'Sur devis';
    const tva = document.getElementById('summary-tva');
    if (tva) tva.textContent = pack.priceMonthly ? `${Math.round(pack.priceMonthly * 0.2)}€` : 'Sur devis';
    const total = document.getElementById('summary-total');
    if (total) total.textContent = pack.priceMonthly ? `${Math.round(pack.priceMonthly * 1.2).toLocaleString('fr-FR')}€` : 'Sur devis';

    injectJsonLd(document, buildPackJsonLd(pack, url), 'static-pack-jsonld');
    let html = fixRelativePaths(dom.serialize());
    const filepath = path.join(PACK_OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(filepath, cleanGeneratedText(html));
    generated.push({ filename: `${slug}.html`, slug, pack });
    console.log(`✅ Generated pack page: ${slug}.html`);
  }

  cleanupOldPackFiles(generated);
  return generated;
}

/* ============================================================
   MAIN
   ============================================================ */
async function generateStaticBlog() {
  console.log('\n═══ Hozana Concept — Static Blog Generator ═══\n');
  const startTime = Date.now();

  try {
    // 1. Fetch published posts from Supabase
    const posts = await fetchPublishedPosts();

    if (posts.length === 0) {
      console.log('⚠️  No published posts found.');
      // Still generate an empty sitemap with main pages
      const catalog = await fetchCatalog();
      generatePricingPage(catalog.packs, catalog.options);
      const generatedPacks = generateStaticPackPages(catalog.packs, catalog.options);
      generateStaticBlogIndex([]);
      generateSitemap([], generatedPacks);
      generateRobotsTxt();
      console.log(`\n✅ Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      return [];
    }

    // 2. Generate static HTML for each post
    const generatedPosts = [];
    for (const post of posts) {
      const result = await generateStaticPost(post);
      if (result) generatedPosts.push(result);
    }

    // 3. Generate crawlable static landing pages
    const catalog = await fetchCatalog();
    generateStaticBlogIndex(generatedPosts);
    generatePricingPage(catalog.packs, catalog.options);
    const generatedPacks = generateStaticPackPages(catalog.packs, catalog.options);

    // 4. Generate sitemap
    generateSitemap(generatedPosts, generatedPacks);
    generateRobotsTxt();

    // 5. Clean up old files that no longer match any post
    cleanupOldFiles(generatedPosts);

    console.log(`\n✅ Generated ${generatedPosts.length}/${posts.length} static pages in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    return generatedPosts;
  } catch (err) {
    console.error('\n❌ Static blog generation failed:', err.message);
    throw err;
  }
}

/* ============================================================
   CLEANUP — remove orphaned .html files in blog-posts
   that don't match any current post slug
   ============================================================ */
function cleanupOldFiles(generatedPosts) {
  const validSlugs = new Set(generatedPosts.map(p => p.filename));
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));

  let removed = 0;
  for (const file of files) {
    if (!validSlugs.has(file)) {
      try {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
        console.log(`🧹 Removed orphaned: ${file}`);
        removed++;
      } catch (err) {
        console.warn(`⚠️  Could not remove ${file}: ${err.message}`);
      }
    }
  }
  if (removed > 0) console.log(`🧹 Cleaned up ${removed} orphaned file(s)`);
}

function cleanupOldPackFiles(generatedPacks) {
  const valid = new Set(generatedPacks.map(p => p.filename));
  const files = fs.existsSync(PACK_OUTPUT_DIR) ? fs.readdirSync(PACK_OUTPUT_DIR).filter(f => f.endsWith('.html')) : [];
  for (const file of files) {
    if (!valid.has(file)) {
      fs.unlinkSync(path.join(PACK_OUTPUT_DIR, file));
      console.log(`🧹 Removed orphaned pack page: ${file}`);
    }
  }
}

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
function getDefaultPacks() {
  return [
    enrichPack({
      name: 'Pack Starter',
      price: '490€',
      period: 'par mois, HT',
      description: 'L essentiel pour lancer votre première automatisation IA : chatbot, workflows et accompagnement initial.',
      features: ['1 chatbot IA configurable', '3 workflows automatisés', 'Intégration de 2 outils', 'Rapport mensuel PDF', 'Support email 48h', 'Onboarding 2h'],
      features_excluded: ['Analytics temps réel', 'Account manager dédié'],
      sort_order: 1
    }),
    enrichPack({
      name: 'Pack Growth',
      price: '990€',
      period: 'par mois, HT',
      description: 'Le pack le plus complet pour accélérer votre croissance avec IA, automatisation, contenu et analytics.',
      features: ['3 chatbots IA avancés', '10 workflows complexes', 'Intégrations illimitées', 'Analytics temps réel', 'Growth Ads IA 500€/mois', '20 contenus IA/mois', 'Support prioritaire 24h'],
      is_featured: true,
      sort_order: 2
    }),
    enrichPack({
      name: 'Pack Elite',
      price: '1 990€',
      period: 'par mois, HT',
      description: 'Transformation IA complète pour entreprises ambitieuses : workflows illimités, BI, prédictif et support VIP.',
      features: ['IA sur mesure complète', 'Workflows illimités', 'BI et analyse prédictive', 'Growth Ads 2 000€/mois', 'Contenu IA illimité', 'Account manager dédié', 'SLA 4h'],
      sort_order: 3
    }),
    enrichPack({
      name: 'Enterprise',
      price: 'Sur devis',
      period: 'architecture et SLA personnalisés',
      description: 'Solution IA personnalisée pour organisations avec besoins de sécurité, propriété IP et intégrations avancées.',
      features: ['Architecture IA dédiée', 'SLA personnalisé', 'Équipe dédiée', 'Propriété IP', 'Formation certifiante'],
      sort_order: 4
    })
  ];
}

function mergeWithDefaultPacks(packs) {
  const byKey = new Map(getDefaultPacks().map(pack => [pack.key, pack]));
  for (const pack of packs) byKey.set(pack.key, { ...byKey.get(pack.key), ...pack });
  return [...byKey.values()].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
}

function getDefaultOptions() {
  return [
    enrichPack({
      item_type: 'option',
      name: 'Chatbot Supplémentaire',
      description: 'Ajout d un chatbot IA avancé supplémentaire à votre solution existante.',
      price: '150€',
      period: 'par mois',
      badge: 'IA',
      features: ['Configuration du chatbot', 'Intégration site ou messagerie'],
      sort_order: 101
    }),
    enrichPack({
      item_type: 'option',
      name: 'Workflow Complexe',
      description: 'Développement d un workflow d automatisation avancé supplémentaire.',
      price: '200€',
      period: 'par mois',
      badge: 'Automation',
      features: ['Workflow multi-étapes', 'Tests et optimisation'],
      sort_order: 102
    }),
    enrichPack({
      item_type: 'option',
      name: 'Pack Contenu +50',
      description: '50 pièces de contenu IA supplémentaires par mois : articles, posts, emails.',
      price: '250€',
      period: 'par mois',
      badge: 'Contenu',
      features: ['50 contenus IA', 'Adaptation à votre ligne éditoriale'],
      sort_order: 103
    })
  ];
}

function normalizeFeaturedPack(packs) {
  const featured = packs.find(pack => pack.key === 'growth' && pack.isFeatured) || packs.find(pack => pack.isFeatured);
  return packs.map(pack => {
    const isFeatured = featured ? pack.slug === featured.slug : false;
    const isContact = /contact/i.test(pack.buttonHref || '') || /contact/i.test(pack.buttonText || '');
    return {
      ...pack,
      isFeatured,
      buttonClass: isContact ? 'btn-primary' : (isFeatured ? 'btn-primary' : 'btn-glass')
    };
  });
}

function resolvePackButtonText(row, contactMode) {
  const savedText = String(row.button_text || '').trim();
  const isGenericText = /^(démarrer|demarrer|choisir|choisir ce pack|voir le détail du pack|voir le detail du pack)/i.test(savedText);
  if (contactMode && (!savedText || isGenericText)) return 'Contactez-nous';
  return savedText || (contactMode ? 'Contactez-nous' : 'Voir le détail du pack');
}

function enrichOption(row) {
  return enrichPack({
    ...row,
    item_type: 'option',
    button_text: 'Ajouter au panier',
    button_class: 'btn-glass',
    link: ''
  });
}

function enrichPack(row) {
  let name = row.name || row.title || 'Pack IA';
  const explicitType = String(row.item_type || row.type || row.category || '').toLowerCase();
  const itemType = explicitType === 'option' || /ajouter au panier/i.test(row.button_text || '') ? 'option' : 'pack';
  const key = packKey(name);
  if (key === 'starter' && /stater/i.test(name)) name = 'Pack Starter';
  if (key === 'growth' && !/^pack\s+/i.test(name)) name = 'Pack Growth';
  if (key === 'elite' && !/^pack\s+/i.test(name)) name = 'Pack Elite';
  const defaults = getPackDefaults(key);
  const priceMonthly = parsePrice(row.price) || defaults.priceMonthly || 0;
  const oldPriceMonthly = parsePrice(row.old_price || row.price_before || row.compare_at_price);
  const features = normalizeList(row.features).length ? normalizeList(row.features) : defaults.sidebarFeatures;
  const excluded = normalizeList(row.features_excluded);
  const description = row.description || defaults.description || '';
  const explicitSlug = slugify(row.slug || extractPackSlugFromLink(row.link));
  const fallbackSlug = key === 'starter' ? 'starter' : slugify(name.replace(/^pack\s+/i, ''));
  const isFeatured = row.is_featured === true || String(row.is_featured) === 'true';
  const hasFeaturedValue = row.is_featured !== undefined && row.is_featured !== null;
  const isEnterprise = key === 'enterprise' || String(row.price || '').toLowerCase().includes('devis');
  const slug = explicitSlug || fallbackSlug || key;
  const buttonHref = row.link || (isEnterprise ? `contact.html?pack=${encodeURIComponent(name)}` : `pack-details/${slug}.html`);
  const contactMode = /contact/i.test(buttonHref) || isEnterprise;

  return {
    ...defaults,
    ...row,
    key,
    itemType,
    slug,
    name,
    priceMonthly,
    priceAnnual: priceMonthly ? Math.round(priceMonthly * 0.8) : 0,
    oldPriceMonthly,
    oldPrice: row.old_price || row.price_before || row.compare_at_price || '',
    price: row.price || (priceMonthly ? `${priceMonthly.toLocaleString('fr-FR')}€` : 'Sur devis'),
    period: row.period || 'par mois, HT',
    description,
    features,
    excluded,
    isFeatured: hasFeaturedValue ? isFeatured : defaults.featured === true,
    isEnterprise,
    buttonHref,
    buttonText: resolvePackButtonText(row, contactMode),
    buttonClass: row.button_class || (isFeatured ? 'btn-primary' : 'btn-glass'),
    comparison: parseComparison(row.comparison || row.compare || row.comparison_rows),
    sidebarFeatures: defaults.sidebarFeatures.length ? defaults.sidebarFeatures : features.slice(0, 7),
    featureGroups: defaults.featureGroups.length ? defaults.featureGroups : [{
      title: 'Inclus dans le pack',
      features: features.map(f => ({ name: f, desc: 'Inclus dans votre accompagnement Hozana Concept.', type: 'check' }))
    }],
    timeline: defaults.timeline,
    results: defaults.results,
    testimonial: defaults.testimonial,
    badge: row.badge || defaults.badge || name.replace(/^Pack\s+/i, ''),
    emoji: defaults.emoji || '⚡',
    badgeClass: defaults.badgeClass || 'badge-glass',
    color: defaults.color || 'rgba(255,255,255,0.08)',
    borderColor: defaults.borderColor || 'rgba(255,255,255,0.1)'
  };
}

function extractPackSlugFromLink(link) {
  const value = String(link || '').trim();
  const match = value.match(/pack-details\/([^/?#]+)\.html/i);
  return match ? match[1] : '';
}

function getPackDefaults(key) {
  const commonTimeline = [
    { week: 'Semaine 1', title: 'Audit et cadrage', desc: 'Analyse des objectifs, priorisation des automatisations et accès aux outils.' },
    { week: 'Semaines 2-3', title: 'Déploiement', desc: 'Configuration des workflows IA, tests fonctionnels et intégration dans votre stack.' },
    { week: 'Semaine 4', title: 'Optimisation', desc: 'Mesure des premiers résultats, ajustements et transfert de compétences.' }
  ];
  const map = {
    starter: {
      emoji: '🚀', badge: 'Starter', badgeClass: 'badge-glass', priceMonthly: 490,
      description: 'Parfait pour les solopreneurs et TPE qui souhaitent automatiser leurs premières tâches et gagner du temps au quotidien.',
      sidebarFeatures: ['1 chatbot IA', '3 workflows auto', 'Rapport mensuel', 'Support email', 'Onboarding 2h'],
      featureGroups: [
        { title: 'IA et automatisation', features: [
          { name: '1 chatbot IA configurable', desc: 'Assistant virtuel personnalisé pour votre site ou app.', type: 'check' },
          { name: '3 workflows automatisés', desc: 'Automatisation des tâches répétitives prioritaires.', type: 'check' },
          { name: 'Intégration de 2 outils', desc: 'CRM, email marketing ou outils métier selon vos besoins.', type: 'check' }
        ] },
        { title: 'Suivi et support', features: [
          { name: 'Rapport mensuel PDF', desc: 'Synthèse de performance et recommandations.', type: 'check' },
          { name: 'Support email 48h', desc: 'Réponse garantie sous 48 heures ouvrées.', type: 'check' }
        ] }
      ],
      timeline: commonTimeline,
      results: [{ metric: '-40%', label: 'Temps sur tâches répétitives' }, { metric: '+30%', label: 'Productivité équipe' }, { metric: '24/7', label: 'Disponibilité chatbot' }],
      testimonial: { text: 'Nous avons automatisé les relances et gagné du temps dès le premier mois.', name: 'Thomas B.', role: 'Consultant freelance', initials: 'TB' }
    },
    growth: {
      emoji: '⚡', badge: 'Growth', badgeClass: 'badge-red', priceMonthly: 990, featured: true,
      color: 'rgba(255,46,46,0.08)', borderColor: 'rgba(255,46,46,0.3)',
      description: 'Accélérez votre croissance avec une suite complète d IA, d automatisation et de stratégie digitale.',
      sidebarFeatures: ['3 chatbots IA avancés', '10 workflows complexes', 'Analytics temps réel', 'Growth Ads 500€/mois', '20 contenus IA/mois', 'Support 24h'],
      featureGroups: [
        { title: 'IA et automatisation', features: [
          { name: '3 chatbots IA avancés', desc: 'Assistants multi-canaux pour site, WhatsApp ou Messenger.', type: 'check' },
          { name: '10 workflows complexes', desc: 'Automatisations avancées multi-étapes.', type: 'check' },
          { name: 'Intégrations illimitées', desc: 'Connexion de vos outils métier sans limite standard.', type: 'check' }
        ] },
        { title: 'Growth et contenu', features: [
          { name: 'Growth Ads IA', desc: '500€ de budget publicitaire inclus et piloté par IA.', type: 'check' },
          { name: '20 contenus IA/mois', desc: 'Articles, posts, emails ou séquences optimisées.', type: 'check' },
          { name: 'Analytics temps réel', desc: 'Dashboard live avec KPIs et alertes.', type: 'check' }
        ] }
      ],
      timeline: [
        { week: 'Semaine 1', title: 'Audit et stratégie', desc: 'Audit de votre écosystème digital et roadmap IA.' },
        { week: 'Semaine 2', title: 'Déploiement IA', desc: 'Configuration des chatbots, connexions outils et workflows.' },
        { week: 'Semaine 3', title: 'Growth et contenu', desc: 'Lancement des campagnes et production du premier lot de contenus.' },
        { week: 'Semaine 4+', title: 'Optimisation continue', desc: 'A/B tests, mesure ROI et itérations.' }
      ],
      results: [{ metric: '+150%', label: 'Trafic qualifié en 3 mois' }, { metric: '+60%', label: 'Conversion leads' }, { metric: '-60%', label: 'Coût acquisition client' }],
      testimonial: { text: 'Nos leads ont augmenté rapidement et l équipe a gagné plusieurs heures par semaine.', name: 'Sophie M.', role: 'CEO e-commerce', initials: 'SM' }
    },
    elite: {
      emoji: '🏆', badge: 'Elite', badgeClass: 'badge-orange', priceMonthly: 1990,
      color: 'rgba(255,106,0,0.06)', borderColor: 'rgba(255,106,0,0.25)',
      description: 'Solution complète pour les entreprises qui veulent une transformation IA totale et un avantage concurrentiel durable.',
      sidebarFeatures: ['IA sur mesure complète', 'Workflows illimités', 'BI et prédictif', 'Growth Ads 2 000€/mois', 'Contenu IA illimité', 'Account manager dédié', 'SLA 4h'],
      featureGroups: [
        { title: 'IA sur mesure', features: [
          { name: 'IA sur mesure complète', desc: 'Développement adapté à vos processus métier.', type: 'check' },
          { name: 'Workflows illimités', desc: 'Automatisation complète des opérations prioritaires.', type: 'check' },
          { name: 'BI et analyse prédictive', desc: 'Tableaux de bord avancés et anticipation des tendances.', type: 'check' }
        ] },
        { title: 'Accompagnement VIP', features: [
          { name: 'Account manager dédié', desc: 'Interlocuteur expert unique.', type: 'check' },
          { name: 'SLA réponse 4h', desc: 'Engagement contractuel de support rapide.', type: 'check' },
          { name: 'Audit mensuel stratégique', desc: 'Revue des résultats et plan d action.', type: 'check' }
        ] }
      ],
      timeline: commonTimeline,
      results: [{ metric: '+300%', label: 'ROI moyen sur 6 mois' }, { metric: '-70%', label: 'Coûts opérationnels' }, { metric: 'x3', label: 'Vitesse d exécution' }],
      testimonial: { text: 'Le pack Elite nous a donné une vraie avance opérationnelle avec l IA prédictive.', name: 'Alexandre D.', role: 'DG groupe immobilier', initials: 'AD' }
    },
    enterprise: {
      emoji: '🏢', badge: 'Enterprise', badgeClass: 'badge-glass', priceMonthly: 0,
      description: 'Architecture IA personnalisée, sécurité avancée, SLA spécifique et propriété IP selon votre organisation.',
      sidebarFeatures: ['Architecture dédiée', 'SLA personnalisé', 'Équipe dédiée', 'Propriété IP', 'Formation certifiante'],
      featureGroups: [],
      timeline: commonTimeline,
      results: [{ metric: 'SLA', label: 'sur mesure' }, { metric: 'IP', label: 'propriété dédiée' }, { metric: 'RGPD', label: 'gouvernance avancée' }],
      testimonial: null
    }
  };
  return map[key] || { sidebarFeatures: [], featureGroups: [], timeline: commonTimeline, results: [], testimonial: null };
}
function resolveImageURL(imgPath) {
  if (!imgPath || typeof imgPath !== 'string') return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=70';
  const p = imgPath.trim();
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  if (p.startsWith('images/')) return p;
  if (!p.includes('/')) return `images/${p}`;
  return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${p}`;
}

function renderStaticPackCard(pack) {
  const detailHref = pack.buttonHref || (pack.isEnterprise ? `contact.html?pack=${encodeURIComponent(pack.name)}` : `pack-details/${pack.slug}.html`);
  const features = pack.features.slice(0, 7).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  const excluded = pack.excluded.map(f => `<li class="excluded">${escapeHtml(f)}</li>`).join('');
  const priceId = `${pack.key}-price`;
  const oldPrice = pack.oldPriceMonthly ? `<div style="font-size:1rem;color:var(--white-30);text-decoration:line-through;margin-top:0.4rem;">${pack.oldPriceMonthly.toLocaleString('fr-FR')}€</div>` : '';
  return `
      <article class="glass pack-card-full ${pack.isFeatured ? 'featured' : ''} reveal" itemscope itemtype="https://schema.org/Product">
        ${pack.isFeatured ? `<div class="pack-badge">${escapeHtml(pack.badge || 'Mis en avant')}</div>` : ''}
        <div style="margin-top:0.5rem;">
          <div class="badge badge-glass" style="width:fit-content;opacity:0.75;font-size:0.7rem;" itemprop="name">${escapeHtml(pack.name)}</div>
          ${oldPrice}
          <div style="font-size:2.75rem;font-weight:800;font-family:var(--font-title);margin-top:0.5rem;" class="${pack.isFeatured ? 'gradient-text' : ''}" id="${priceId}" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="price">${pack.price}</span>
            <meta itemprop="priceCurrency" content="EUR">
            <link itemprop="availability" href="https://schema.org/InStock">
          </div>
          <div style="font-size:0.875rem;color:var(--white-50);">${escapeHtml(pack.period)}</div>
        </div>
        <p style="font-size:0.875rem;color:var(--white-50);margin:1rem 0;line-height:1.5;" itemprop="description">${escapeHtml(pack.description)}</p>
        <ul class="pack-features" style="flex:1;">${features}${excluded}</ul>
        <a href="${detailHref}" class="btn ${pack.buttonClass || (pack.isFeatured ? 'btn-primary' : 'btn-glass')} w-full mt-lg" style="justify-content:center;">
          ${escapeHtml(pack.buttonText || (pack.isEnterprise ? 'Contactez-nous' : 'Voir le détail du pack'))}
        </a>
      </article>`;
}

function renderOptionCard(option) {
  const icon = optionIcon(option);
  const price = option.priceMonthly ? `+ ${option.priceMonthly.toLocaleString('fr-FR')}€` : escapeHtml(option.price || 'Sur devis');
  const oldPrice = option.oldPriceMonthly ? `<div style="font-size:0.85rem;color:var(--white-30);text-decoration:line-through;margin-top:0.25rem;">${option.oldPriceMonthly.toLocaleString('fr-FR')}€</div>` : '';
  return `
      <div class="glass card reveal" data-option-card>
        <div class="card-icon"><i class="${icon}" style="background:var(--grad-red);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"></i></div>
        <h3 class="card-title">${escapeHtml(option.name)}</h3>
        <p class="card-text">${escapeHtml(option.description || '')}</p>
        ${oldPrice}
        <div style="margin-top:1rem;font-family:var(--font-title);font-size:1.25rem;font-weight:700;">${price}<span style="font-size:0.8rem;color:var(--white-50);font-family:var(--font-body);font-weight:400;"> ${escapeHtml(option.period || 'par mois')}</span></div>
        <button class="btn btn-glass w-full mt-lg" style="justify-content:center;" onclick="addPricingOptionToCart(${escapeHtml(JSON.stringify(optionPayload(option)))});">
          Ajouter au panier
        </button>
      </div>`;
}

function renderComparisonTable(packs) {
  const visiblePacks = packs;
  const rows = comparisonRows(visiblePacks);
  return `
        <thead>
          <tr>
            <th style="width:30%;">Fonctionnalité</th>
            ${visiblePacks.map(pack => `<th>${escapeHtml(pack.name.replace(/^Pack\s+/i, ''))}${pack.isFeatured ? ' ⭐' : ''}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
          <tr>
            <td>${escapeHtml(row.label)}</td>
            ${visiblePacks.map(pack => renderComparisonCell(row.values[pack.slug] || row.values[pack.key] || '')).join('')}
          </tr>`).join('')}
        </tbody>`;
}

function comparisonRows(packs) {
  const defaults = [
    'Chatbot IA', 'Workflows automatisés', 'Analytics temps réel', 'Contenu IA/mois',
    'Growth Ads IA', 'Analyse prédictive', 'Account manager dédié', 'SLA support',
    'Formation équipe', 'Propriété IP'
  ];
  const labels = new Set(defaults);
  for (const pack of packs) Object.keys(pack.comparison || {}).forEach(label => labels.add(label));
  return [...labels].map(label => ({
    label,
    values: Object.fromEntries(packs.map(pack => [pack.slug, comparisonValue(pack, label)]))
  })).filter(row => Object.values(row.values).some(Boolean));
}

function comparisonValue(pack, label) {
  if (pack.comparison && pack.comparison[label]) return pack.comparison[label];
  const included = pack.features.find(f => normalizeCompareLabel(f).includes(normalizeCompareLabel(label)) || normalizeCompareLabel(label).includes(normalizeCompareLabel(f)));
  const excluded = pack.excluded.find(f => normalizeCompareLabel(f).includes(normalizeCompareLabel(label)) || normalizeCompareLabel(label).includes(normalizeCompareLabel(f)));
  if (included) return included;
  if (excluded) return '✗';
  return '';
}

function renderComparisonCell(value) {
  const normalized = String(value || '').trim();
  const cls = /^✓|oui|inclus/i.test(normalized) ? ' class="yes"' : (/^✗|non|exclu/i.test(normalized) ? ' class="no"' : '');
  return `<td${cls}>${escapeHtml(normalized || '—')}</td>`;
}

function optionPayload(option) {
  return {
    id: option.id || option.slug,
    name: option.name,
    price: option.priceMonthly || 0,
    period: option.period || 'par mois',
    description: option.description || ''
  };
}

function optionIcon(option) {
  const name = String(option.name || '').toLowerCase();
  if (name.includes('workflow') || name.includes('automation')) return 'fas fa-cogs';
  if (name.includes('contenu') || name.includes('content')) return 'fas fa-file-alt';
  if (name.includes('audit')) return 'fas fa-chart-line';
  if (name.includes('support')) return 'fas fa-headset';
  return 'fas fa-robot';
}

function renderStaticFeaturedPost(post) {
  const img = absolutePostImage(post, 1200);
  const date = formatDate(post.publish_date || post.created_at);
  const initials = initialsFor(post.author);
  return `
  <a href="blog-posts/${post.slug}.html" class="blog-featured-card reveal visible" style="text-decoration:none;" itemscope itemtype="https://schema.org/BlogPosting">
    <div class="featured-img-wrap" style="min-height:350px; background:rgba(255,255,255,0.03);">
      <img src="${img}" alt="${escapeHtml(post.title)}" class="featured-img" style="width:100%; height:100%; object-fit:cover; display:block;" itemprop="image">
      <div class="featured-badge-overlay">
        <span class="badge badge-red">${escapeHtml(post.category || 'IA')}</span>
        <span class="badge" style="background:rgba(0,0,0,0.6);color:rgba(255,255,255,0.8);border:none;backdrop-filter:blur(8px);">À la une</span>
      </div>
    </div>
    <div class="featured-content">
      <div class="featured-cat">${escapeHtml(post.category || 'IA')}</div>
      <h2 class="featured-title" itemprop="headline">${escapeHtml(post.title)}</h2>
      <p class="featured-excerpt" itemprop="description">${escapeHtml(post.excerpt || '')}</p>
      <div class="featured-meta">
        <span class="featured-author"><span class="author-avatar-sm">${initials}</span><span itemprop="author">${escapeHtml(post.author || 'Hozana Concept')}</span></span>
        <span class="featured-meta-item"><i class="fas fa-clock"></i> ${post.read_time || 5} min</span>
        <span class="featured-meta-item"><i class="fas fa-eye"></i> ${formatNum(post.views || 0)}</span>
        ${date ? `<span class="featured-meta-item"><i class="fas fa-calendar-alt"></i> <time itemprop="datePublished" datetime="${safeIsoDate(post.publish_date || post.created_at)}">${date}</time></span>` : ''}
      </div>
      <div class="btn btn-primary btn-sm" style="width:fit-content;">Lire l'article <i class="fas fa-arrow-right"></i></div>
    </div>
  </a>`;
}

function renderStaticArticleCard(post) {
  const img = absolutePostImage(post, 600);
  const initials = initialsFor(post.author);
  return `
  <a href="blog-posts/${post.slug}.html" class="article-card reveal visible" itemscope itemtype="https://schema.org/BlogPosting">
    <div class="card-img-wrap" style="aspect-ratio:16/9; background:rgba(255,255,255,0.03);">
      <img src="${img}" alt="${escapeHtml(post.title)}" class="card-img" style="width:100%; height:100%; object-fit:cover; display:block;" itemprop="image">
      <div class="card-cat-badge"><span class="badge badge-red">${escapeHtml(post.category || 'IA')}</span></div>
      <div class="card-read-time"><i class="fas fa-clock"></i> ${post.read_time || 5} min</div>
    </div>
    <div class="card-body">
      <h3 class="card-title" itemprop="headline">${escapeHtml(post.title)}</h3>
      <p class="card-excerpt" itemprop="description">${escapeHtml(post.excerpt || '')}</p>
      <div class="card-footer">
        <div class="card-author"><span style="width:24px;height:24px;border-radius:50%;background:var(--grad-red);display:inline-flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:white;flex-shrink:0;">${initials}</span><span itemprop="author">${escapeHtml(post.author || 'Hozana Concept')}</span></div>
        <div class="card-stats"><span><i class="fas fa-eye"></i> ${formatNum(post.views || 0)}</span><span><i class="fas fa-heart"></i> ${formatNum(post.likes || 0)}</span></div>
      </div>
    </div>
  </a>`;
}

function renderStaticPopularPost(post, index) {
  return `
    <li>
      <a href="blog-posts/${post.slug}.html" class="popular-item">
        <span class="popular-num">0${index + 1}</span>
        <div class="popular-info">
          <div class="popular-title">${escapeHtml(post.title)}</div>
          <div class="popular-meta"><i class="fas fa-eye"></i> ${formatNum(post.views || 0)} vues · <i class="fas fa-clock"></i> ${post.read_time || 5} min</div>
        </div>
      </a>
    </li>`;
}

function renderStaticPackHero(pack) {
  const oldPrice = pack.oldPriceMonthly ? `<span style="font-size:1.25rem;color:var(--white-30);text-decoration:line-through;margin-right:0.75rem;">${pack.oldPriceMonthly.toLocaleString('fr-FR')}€</span>` : '';
  return `
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
      <div class="badge ${pack.badgeClass}" style="font-size:0.875rem;">${pack.emoji} ${escapeHtml(pack.badge)}</div>
      ${pack.isFeatured ? '<div class="badge badge-glass" style="font-size:0.75rem;">Mis en avant</div>' : ''}
    </div>
    <h1 class="pack-hero-title">${escapeHtml(pack.name)}</h1>
    <p class="pack-hero-subtitle">${escapeHtml(pack.description)}</p>
    <div class="pack-hero-price">
      ${oldPrice}
      <span class="pack-price-amount gradient-text" id="hero-price">${pack.priceMonthly ? `${pack.priceMonthly}€` : 'Sur devis'}</span>
      <span class="pack-price-period">/mois HT</span>
    </div>`;
}

function injectPackOptions(document, options = []) {
  const existingList = document.getElementById('checkout-options-list');
  const existingBlock = document.getElementById('checkout-options-block');
  if (existingList && options.length) {
    existingList.innerHTML = options.map(renderCheckoutOption).join('');
    if (existingBlock) existingBlock.style.display = 'block';
    return;
  }
  const summary = document.querySelector('.money-back');
  if (!summary || !options.length) return;
  const block = document.createElement('div');
  block.id = 'checkout-options-block';
  block.style.cssText = 'margin-top:1rem;padding-top:1rem;border-top:1px solid var(--glass-border);';
  block.innerHTML = `
    <p style="font-size:0.75rem;font-family:var(--font-accent);font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--white-30);margin-bottom:0.875rem;">Options recommandées</p>
    <div id="checkout-options-list" style="display:flex;flex-direction:column;gap:0.6rem;">
      ${options.map(renderCheckoutOption).join('')}
    </div>`;
  summary.insertAdjacentElement('afterend', block);
}

function renderCheckoutOption(option) {
  const payload = escapeHtml(JSON.stringify(optionPayload(option)));
  const price = option.priceMonthly ? `+${option.priceMonthly.toLocaleString('fr-FR')}€` : 'Sur devis';
  return `
      <button type="button" data-checkout-option="${escapeHtml(option.id || option.slug)}" onclick="toggleCheckoutOption(${payload}, this)" style="width:100%;text-align:left;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:0.75rem;display:flex;justify-content:space-between;gap:0.75rem;color:var(--white);cursor:pointer;">
        <span><strong style="display:block;font-size:0.82rem;">${escapeHtml(option.name)}</strong><small style="color:var(--white-50);line-height:1.3;">${escapeHtml(option.description || '')}</small></span>
        <span style="font-family:var(--font-accent);font-weight:700;color:var(--red);white-space:nowrap;">${price}</span>
      </button>`;
}

function renderStaticPackFeatureGroups(pack) {
  return pack.featureGroups.map(group => `
    <div class="feature-group">
      <div class="feature-group-title">${escapeHtml(group.title)}</div>
      <ul class="feature-list-detailed">
        ${group.features.map(f => `
          <li>
            <div class="feat-icon ${f.type === 'x' ? 'red' : ''}"><i class="fas fa-${f.type === 'x' ? 'times' : 'check'}"></i></div>
            <div><strong ${f.type === 'x' ? 'style="color:var(--white-40);"' : ''}>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.desc)}</span></div>
          </li>`).join('')}
      </ul>
    </div>`).join('');
}

function renderStaticTimeline(pack) {
  return pack.timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-week">${escapeHtml(item.week)}</div>
      <div class="timeline-title">${escapeHtml(item.title)}</div>
      <div class="timeline-desc">${escapeHtml(item.desc)}</div>
    </div>`).join('');
}

function renderStaticResults(pack) {
  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
      ${pack.results.map(r => `<div class="glass" style="padding:1.5rem;text-align:center;border-radius:var(--radius-lg);"><div style="font-size:2.25rem;font-weight:800;font-family:var(--font-title);background:var(--grad-red);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem;">${escapeHtml(r.metric)}</div><div style="font-size:0.8125rem;color:var(--white-50);line-height:1.4;">${escapeHtml(r.label)}</div></div>`).join('')}
    </div>
    <div style="background:rgba(255,46,46,0.06);border:1px solid rgba(255,46,46,0.15);border-radius:var(--radius-lg);padding:1.5rem;">
      <p style="font-size:0.875rem;color:var(--white-70);line-height:1.7;margin:0;"><strong style="color:var(--white);">Note :</strong> Ces résultats sont des moyennes observées et peuvent varier selon votre secteur, votre marché et votre niveau d adoption.</p>
    </div>`;
}

function renderStaticTestimonial(pack) {
  if (!pack.testimonial) return '';
  const t = pack.testimonial;
  return `<p>"${escapeHtml(t.text)}"</p><div class="mini-testimonial-author"><div class="mini-avatar">${escapeHtml(t.initials)}</div><div class="mini-author-info"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.role)}</span></div><div class="stars" style="margin-left:auto;">★★★★★</div></div>`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
}

function packKey(name) {
  const normalized = slugify(String(name || '').replace(/^pack\s+/i, ''));
  if (normalized.includes('starter') || normalized.includes('stater')) return 'starter';
  if (normalized.includes('growth')) return 'growth';
  if (normalized.includes('elite')) return 'elite';
  if (normalized.includes('enterprise')) return 'enterprise';
  return normalized || 'pack';
}

function parsePrice(value) {
  const n = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseComparison(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map(item => {
      if (typeof item === 'string') {
        const parts = item.split(':');
        return [parts.shift()?.trim(), parts.join(':').trim()];
      }
      return [item.label || item.name, item.value || item.text || ''];
    }).filter(([label]) => label));
  }
  try {
    return parseComparison(JSON.parse(String(value)));
  } catch {
    return Object.fromEntries(String(value).split(/\r?\n/).map(line => {
      const parts = line.split(':');
      return [parts.shift()?.trim(), parts.join(':').trim()];
    }).filter(([label, val]) => label && val));
  }
}

function normalizeCompareLabel(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean);
    } catch {}
    return value.split(/\n|,/).map(v => v.trim()).filter(Boolean);
  }
  return [];
}

function initialsFor(name) {
  return (name || 'HC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function absolutePostImage(post, width) {
  const img = post.cover_image || post.image_url || post.image || post.img || post.thumbnail || post.cover;
  const resolved = resolveImageURL(img);
  if (resolved.startsWith('http') || resolved.startsWith('data:')) return resolved;
  if (resolved.startsWith('images/')) return `${SITE_URL}/${resolved}`;
  return `https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=${width || 600}&q=70`;
}

function collectTags(posts) {
  const set = new Set(['IA', 'Automatisation', 'Croissance', 'Stratégie']);
  for (const post of posts) {
    normalizeTagsForStatic(post.tags).forEach(t => set.add(t));
    if (post.category) set.add(post.category);
  }
  return [...set].filter(Boolean);
}

function normalizeTagsForStatic(tags) {
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function upsertMetaNode(document, attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${cssEscape(key)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content).replace(/\s+/g, ' ').trim());
}

function upsertCanonical(document, href) {
  document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
  const link = document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', href);
  document.head.appendChild(link);
}

function injectJsonLd(document, data, id) {
  if (!data) return;
  if (id) document.getElementById(id)?.remove();
  const script = document.createElement('script');
  if (id) script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  document.head.appendChild(script);
}

function buildPricingJsonLd(packs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Packs et tarifs Hozana Concept',
    url: `${SITE_URL}/pricing`,
    itemListElement: packs.map((pack, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildPackJsonLd(pack, pack.isEnterprise ? `${SITE_URL}/contact` : `${SITE_URL}/pack-details/${pack.slug}.html`)
    }))
  };
}

function buildPackJsonLd(pack, url) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pack.name,
    description: pack.description,
    serviceType: 'Automatisation IA et growth digital',
    provider: {
      '@type': 'Organization',
      name: 'Hozana Concept',
      url: SITE_URL
    },
    areaServed: 'FR',
    url
  };
  if (pack.priceMonthly) {
    data.offers = {
      '@type': 'Offer',
      price: pack.priceMonthly,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url
    };
  }
  return data;
}

function buildPricingFaqJsonLd(document) {
  const questions = [...document.querySelectorAll('.faq-item')].map(item => {
    const q = item.querySelector('.faq-question')?.textContent?.replace(/\s+/g, ' ').trim();
    const a = item.querySelector('.faq-answer')?.textContent?.replace(/\s+/g, ' ').trim();
    if (!q || !a) return null;
    return {
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    };
  }).filter(Boolean);
  return questions.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions } : null;
}

function getPackFaqs() {
  return [
    { q: 'Puis-je changer de pack plus tard ?', a: 'Oui, vous pouvez faire évoluer votre pack selon vos besoins. Les ajustements sont cadrés avec notre équipe.' },
    { q: 'Comment se passe l onboarding ?', a: 'Après validation, notre équipe planifie un audit, configure les outils et vous accompagne dans la prise en main.' },
    { q: 'Les prix sont-ils HT ?', a: 'Oui, les prix affichés sont hors taxes. La TVA est calculée dans le récapitulatif.' },
    { q: 'Quand verrai-je les premiers résultats ?', a: 'Les premiers gains apparaissent généralement dans les premières semaines, selon le périmètre et les accès disponibles.' }
  ];
}

function safeIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeArticleBodyImages(bodyEl, title) {
  bodyEl.querySelectorAll('img').forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src) img.setAttribute('src', resolveImageURL(src));
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', index === 0 ? title || 'Image article Hozana Concept' : `Image ${index + 1} de l'article`);
    }
    img.setAttribute('loading', index === 0 ? 'eager' : 'lazy');
    img.setAttribute('decoding', 'async');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cssEscape(value) {
  return String(value).replace(/"/g, '\\"');
}

function cleanGeneratedText(value) {
  return String(value).replace(/[ \t]+$/gm, '').replace(/\s*$/, '\n');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

function formatNum(n) {
  const num = parseInt(n) || 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
}

function convertPlainTextToHtml(text) {
  if (!text) return '';
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    para = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    para = para.replace(/__(.*?)__/g, '<strong>$1</strong>');
    para = para.replace(/\*(.*?)\*/g, '<em>$1</em>');
    para = para.replace(/_(.*?)_/g, '<em>$1</em>');
    para = para.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    para = para.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;display:block;margin:1.5rem 0;border-radius:var(--radius-lg);">');
    if (para.startsWith('# '))      return `<h1>${para.slice(2)}</h1>`;
    if (para.startsWith('## '))     return `<h2>${para.slice(3)}</h2>`;
    if (para.startsWith('### '))    return `<h3>${para.slice(4)}</h3>`;
    if (para.startsWith('#### '))   return `<h4>${para.slice(5)}</h4>`;
    if (para.startsWith('- ') || para.startsWith('* ')) {
      const items = para.split(/\n[-*]/).map(item => item.replace(/^[-*]\s*/, '').trim());
      return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
    return `<p>${para}</p>`;
  }).join('\n');
}

/* ============================================================
   FIX RELATIVE PATHS — blog-posts/ is a subfolder, so we need
   to prefix relative paths with ../ so they resolve correctly
   ============================================================ */
function fixRelativePaths(html) {
  // Fix CSS references
  html = html.replace(/(href=")(css\/)/g, '$1../$2');
  html = html.replace(/(src=")(js\/)/g, '$1../$2');
  html = html.replace(/(href=")(js\/)/g, '$1../$2');
  
  // Fix image paths (only relative ones)
  html = html.replace(/(src=")(images\/)/g, '$1../$2');
  html = html.replace(/(href=")(images\/)/g, '$1../$2');

  // Fix navigation links to root pages
  html = html.replace(/href="blog\.html"/g, 'href="../blog.html"');
  html = html.replace(/href="contact\.html"/g, 'href="../contact.html"');
  html = html.replace(/href="pricing\.html"/g, 'href="../pricing.html"');
  html = html.replace(/href="index"/g, 'href="../index"');

  return html;
}

// ─── Run if called directly ───
if (require.main === module) {
  generateStaticBlog().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateStaticBlog, generateStaticPost, fetchPublishedPosts };
