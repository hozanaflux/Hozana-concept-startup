/* ============================================================
   HOZANA CONCEPT - Static Blog Generator
   Generates static HTML files for each blog post
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { generateSchemaMarkup, enhanceMetaTags, enhanceImageAltText } = require('./blog-seo-node');

// Configuration
const BLOG_DIR = path.join(__dirname, '../blog');
const TEMPLATE_PATH = path.join(__dirname, '../article.html');
const OUTPUT_DIR = path.join(__dirname, '../blog-posts');
const TEST_ARTICLE_PATH = path.join(__dirname, '../scripts/test-article.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load template
let templateContent;
try {
  templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch (err) {
  console.error('Error loading template:', err);
  process.exit(1);
}

// Function to generate static HTML for a post
async function generateStaticPost(post) {
  try {
    // Create a new DOM from the template
    const dom = new JSDOM(templateContent);
    const document = dom.window.document;

    // Update meta tags
    enhanceMetaTags(post, document);

    // Add schema markup
    const schemaMarkup = generateSchemaMarkup(post);
    document.head.insertAdjacentHTML('beforeend', schemaMarkup);

    // Enhance image alt text
    enhanceImageAltText(document);

    // Update content
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = post.title;

    const coverEl = document.getElementById('article-cover');
    if (coverEl) {
      const img = resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover);
      coverEl.src = img;
      coverEl.alt = post.title;
    }

    const bodyEl = document.getElementById('article-body');
    if (bodyEl) {
      bodyEl.innerHTML = post.content || generateDemoContent(post);
    }

    // Update other elements
    const catBreadcrumb = document.getElementById('article-cat-breadcrumb');
    if (catBreadcrumb) catBreadcrumb.textContent = post.category || 'IA';

    const badgesEl = document.getElementById('article-badges');
    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="badge badge-red">${escapeHtml(post.category || 'IA')}</span>
        ${post.featured ? '<span class="badge badge-orange">⭐ Featured</span>' : ''}
      `;
    }

    // Update meta elements
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

    // Update tags
    const tagsEl = document.getElementById('article-tags');
    if (tagsEl && post.tags) {
      const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',') : []);
      tagsEl.innerHTML = tags.map(t => `
        <span style="padding:0.3rem 0.875rem;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-full);font-size:0.78rem;color:var(--white-50);font-family:var(--font-accent);">#${escapeHtml(t.trim())}</span>
      `).join('');
    }

    // Generate filename
    const slug = post.slug || post.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filename = `${slug}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Write file
    fs.writeFileSync(filepath, dom.serialize());

    console.log(`Generated static post: ${filename}`);
    return { filename, slug, title: post.title };
  } catch (err) {
    console.error(`Error generating post ${post.id}:`, err);
    return null;
  }
}

// Function to generate sitemap
function generateSitemap(posts) {
  const baseUrl = 'https://www.hozanaconcept.com/blog-posts/';
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  posts.forEach(post => {
    if (post && post.filename) {
      sitemap += `
  <url>
    <loc>${baseUrl}${post.filename}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  });

  sitemap += `
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully');
}

// Main function
async function generateStaticBlog() {
  try {
    // Check for test article
    let posts = [];

    if (fs.existsSync(TEST_ARTICLE_PATH)) {
      try {
        const testArticle = JSON.parse(fs.readFileSync(TEST_ARTICLE_PATH, 'utf8'));
        posts.push(testArticle);
      } catch (err) {
        console.error('Error reading test article:', err);
      }
    }

    // Add mock posts
    const mockPosts = [
      {
        id: 1,
        title: "L'IA transforme votre business",
        slug: "ia-transforme-votre-business",
        excerpt: "Découvrez comment l'IA peut révolutionner votre entreprise",
        content: "<h2>Introduction</h2><p>L'IA est en train de transformer le paysage professionnel...</p>",
        category: "IA",
        author: "Jean Dupont",
        publish_date: "2023-05-15",
        cover_image: "ia-business.jpg",
        tags: "ia, business, transformation",
        featured: true
      },
      {
        id: 2,
        title: "Automatisation des processus métiers",
        slug: "automatisation-processus-metiers",
        excerpt: "Comment automatiser vos processus métiers avec des outils no-code",
        content: "<h2>Introduction</h2><p>L'automatisation des processus métiers est un enjeu majeur...</p>",
        category: "Automatisation",
        author: "Marie Martin",
        publish_date: "2023-06-20",
        cover_image: "automatisation.jpg",
        tags: "automatisation, no-code, processus",
        featured: false
      }
    ];

    posts = [...posts, ...mockPosts];

    // Generate static posts
    const generatedPosts = [];
    for (const post of posts) {
      const result = await generateStaticPost(post);
      if (result) generatedPosts.push(result);
    }

    // Generate sitemap
    generateSitemap(generatedPosts);

    console.log('Static blog generation completed successfully');
  } catch (err) {
    console.error('Error generating static blog:', err);
  }
}

// Helper functions
function resolveImageURL(path) {
  if (!path || typeof path !== 'string') return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=70';
  const p = path.trim();
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  if (p.startsWith('images/')) return p;
  if (!p.includes('/')) return `images/${p}`;
  return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${p}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');
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

// Run the generator
generateStaticBlog();