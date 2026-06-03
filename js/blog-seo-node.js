/* ============================================================
   Hozana Concept - Blog SEO Enhancements (Node.js version)
   Schema Markup, Meta Tags, and Other SEO Improvements
   ============================================================ */

'use strict';

// Supabase configuration (needed for resolveImageURL in Node.js context)
const SUPABASE_URL = 'https://leadvqrheziyvrwnbiio.supabase.co';
const SITE_URL = 'https://www.hozanaconcept.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80';
const LOGO_URL = `${SITE_URL}/images/logo-main.png`;

/* ============================================================
   SCHEMA MARKUP GENERATION
   ============================================================ */
function generateSchemaMarkup(post) {
  const date = safeIsoDate(post.publish_date || post.created_at || post.updated_at);
  const modified = safeIsoDate(post.updated_at || post.publish_date || post.created_at);
  const author = post.author || 'Hozana Concept';
  const slug = post.slug || post.id;
  const canonicalUrl = `${SITE_URL}/blog-posts/${slug}.html`;
  const imageUrl = absoluteUrl(resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover));
  const keywords = normalizeTags(post.tags);

  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title || '',
    description: post.excerpt || '',
    datePublished: date,
    dateModified: modified,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hozana Concept',
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
        width: 512,
        height: 512
      }
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630
    },
    url: canonicalUrl
  };

  if (keywords.length) blogPosting.keywords = keywords.join(', ');
  if (post.category) blogPosting.articleSection = post.category;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: SITE_URL
    }, {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: `${SITE_URL}/blog`
    }, {
      '@type': 'ListItem',
      position: 3,
      name: post.title || '',
      item: canonicalUrl
    }]
  };

  return `
    <script type="application/ld+json">${jsonLd(blogPosting)}</script>
    <script type="application/ld+json">${jsonLd(breadcrumb)}</script>
  `;
}

/* ============================================================
   META TAGS ENHANCEMENT
   ============================================================ */
function enhanceMetaTags(post, document) {
  const title = `${post.title || 'Article'} | Hozana Concept Blog`;
  const desc = truncate(post.excerpt || 'Découvrez nos articles sur l\'intelligence artificielle, l\'automatisation et la croissance digitale.', 160);
  const slug = post.slug || post.id;
  const img = absoluteUrl(resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover));
  const url = `${SITE_URL}/blog-posts/${slug}.html`;
  const date = safeIsoDate(post.publish_date || post.created_at || post.updated_at);
  const modified = safeIsoDate(post.updated_at || post.publish_date || post.created_at);

  document.title = title;
  upsertMeta(document, 'name', 'description', desc);
  upsertMeta(document, 'name', 'robots', 'index, follow, max-image-preview:large');

  document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]').forEach(el => el.remove());

  [
    ['property', 'og:title', title],
    ['property', 'og:description', desc],
    ['property', 'og:type', 'article'],
    ['property', 'og:url', url],
    ['property', 'og:image', img],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['property', 'og:site_name', 'Hozana Concept'],
    ['property', 'article:published_time', date],
    ['property', 'article:modified_time', modified],
    ['property', 'article:author', post.author || 'Hozana Concept'],
    ['property', 'article:section', post.category || 'IA'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', desc],
    ['name', 'twitter:image', img],
    ['name', 'twitter:site', '@HozanaConcept'],
    ['name', 'twitter:creator', '@HozanaConcept']
  ].forEach(([attr, key, content]) => upsertMeta(document, attr, key, content));

  const canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  canonical.setAttribute('href', url);
  document.head.appendChild(canonical);
}

/* ============================================================
   IMAGE ALT TEXT ENHANCEMENT
   ============================================================ */
function enhanceImageAltText(document) {
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      const parent = img.closest('figure, .article-body, .related-img, .featured-img');
      if (parent) {
        const caption = parent.querySelector('figcaption, .caption, .alt-text');
        if (caption) {
          img.alt = caption.textContent.trim();
        } else {
          const text = parent.textContent.trim();
          img.alt = text.length > 0 && text.length < 100 ? text : 'Image relative à l\'article';
        }
      } else {
        img.alt = 'Image relative à l\'article';
      }
    }
  });
}

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
function resolveImageURL(path) {
  if (!path || typeof path !== 'string') return DEFAULT_IMAGE;
  const p = path.trim();
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  if (p.startsWith('/')) return `${SITE_URL}${p}`;
  if (p.startsWith('images/')) return `${SITE_URL}/${p}`;
  if (!p.includes('/')) return `${SITE_URL}/images/${p}`;
  return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${p}`;
}

function absoluteUrl(url) {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url || DEFAULT_IMAGE;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url.replace(/^\.\.\//, '')}`;
}

function safeIsoDate(value) {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function upsertMeta(document, attr, key, content) {
  if (content === undefined || content === null) return;
  let el = document.querySelector(`meta[${attr}="${cssEscape(key)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function cssEscape(value) {
  return String(value).replace(/"/g, '\\"');
}

function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function truncate(str, max) {
  const s = String(str || '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1).trim()}…` : s;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = {
  generateSchemaMarkup,
  enhanceMetaTags,
  enhanceImageAltText
};
