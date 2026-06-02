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

// ─── Paths ───
const TEMPLATE_PATH    = path.join(__dirname, '..', 'article.html');
const OUTPUT_DIR       = path.join(__dirname, '..', 'blog-posts');
const SITEMAP_PATH     = path.join(__dirname, '..', 'sitemap.xml');
const SCRIPTS_DIR      = path.join(__dirname, '..', 'scripts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=*&published=eq.true&order=created_at.desc`;

  const headers = {
    'apikey':        SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Accept':        'application/json'
  };

  // Use Node.js 18+ global fetch
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.status} ${response.statusText}`);
  }

  const posts = await response.json();
  console.log(`📄 Fetched ${posts.length} published posts from Supabase`);
  return Array.isArray(posts) ? posts : [];
}

/* ============================================================
   GENERATE STATIC POST
   ============================================================ */
async function generateStaticPost(post) {
  try {
    const slug = post.slug || post.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `article-${post.id || Date.now()}`;
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

    // ── Fix canonical URL to point to static page ──
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `https://www.hozanaconcept.com/blog-posts/${slug}.html`);
    }
    // Also fix og:url
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://www.hozanaconcept.com/blog-posts/${slug}.html`);
    }

    // ── Update content ──
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = post.title;

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
  cover_image: ${JSON.stringify(post.cover_image || '')},
  excerpt: ${JSON.stringify(post.excerpt || '')},
  read_time: ${post.read_time || 5},
  views: ${post.views || 0},
  likes: ${post.likes || 0},
  tags: ${JSON.stringify(Array.isArray(post.tags) ? post.tags : (post.tags ? String(post.tags).split(',').map(t => t.trim()).filter(Boolean) : []))},
  publish_date: ${JSON.stringify(post.publish_date || post.created_at || '')},
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
    fs.writeFileSync(filepath, html);

    console.log(`✅ Generated: ${filename}`);
    return { filename, slug, title: post.title, id: post.id };
  } catch (err) {
    console.error(`❌ Error generating post "${post.title || post.id}":`, err.message);
    return null;
  }
}

/* ============================================================
   SITEMAP GENERATOR
   ============================================================ */
function generateSitemap(posts) {
  const baseUrl = 'https://www.hozanaconcept.com/blog-posts/';
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add main pages
  const mainPages = [
    { loc: 'https://www.hozanaconcept.com/', priority: '1.0', changefreq: 'weekly' },
    { loc: 'https://www.hozanaconcept.com/blog', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://www.hozanaconcept.com/platform', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://www.hozanaconcept.com/portfolio', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://www.hozanaconcept.com/pricing', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://www.hozanaconcept.com/contact', priority: '0.7', changefreq: 'monthly' },
  ];

  for (const page of mainPages) {
    sitemap += `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  // Add blog posts
  posts.forEach(post => {
    if (post && post.filename) {
      const slug = post.filename.replace('.html', '');
      sitemap += `  <url>
    <loc>${baseUrl}${slug}.html</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  });

  sitemap += `</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log('🗺️  Sitemap generated successfully');
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
      generateSitemap([]);
      console.log(`\n✅ Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      return [];
    }

    // 2. Generate static HTML for each post
    const generatedPosts = [];
    for (const post of posts) {
      const result = await generateStaticPost(post);
      if (result) generatedPosts.push(result);
    }

    // 3. Generate sitemap
    generateSitemap(generatedPosts);

    // 4. Clean up old files that no longer match any post
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

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
function resolveImageURL(imgPath) {
  if (!imgPath || typeof imgPath !== 'string') return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=70';
  const p = imgPath.trim();
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  if (p.startsWith('images/')) return p;
  if (!p.includes('/')) return `images/${p}`;
  return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${p}`;
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
