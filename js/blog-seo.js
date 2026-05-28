/* ============================================================
   Hozana Concept - Blog SEO Enhancements
   Schema Markup, Meta Tags, and Other SEO Improvements
   ============================================================ */

'use strict';

/* ============================================================
   SCHEMA MARKUP GENERATION
   ============================================================ */
function generateSchemaMarkup(post) {
  const date = new Date(post.publish_date || post.created_at).toISOString();
  const author = post.author || 'Hozana Concept';
  const initials = author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${escapeHtml(post.title)}",
      "description": "${escapeHtml(post.excerpt || '')}",
      "datePublished": "${date}",
      "dateModified": "${date}",
      "author": {
        "@type": "Person",
        "name": "${author}",
        "image": {
          "@type": "ImageObject",
          "url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=120&q=80",
          "caption": "${author}"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Hozana Concept",
        "logo": {
          "@type": "ImageObject",
          "url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=120&q=80",
          "width": 120,
          "height": 120
        }
      },
      "image": {
        "@type": "ImageObject",
        "url": "${resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover)}",
        "width": 1200,
        "height": 630
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.hozanaconcept.com/blog"
      }
    }
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://www.hozanaconcept.com"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.hozanaconcept.com/blog"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "${escapeHtml(post.title)}"
      }]
    }
    </script>
  `;
}

/* ============================================================
   META TAGS ENHANCEMENT
   ============================================================ */
function enhanceMetaTags(post) {
  const title = `${escapeHtml(post.title)} | Hozana Concept Blog`;
  const desc = escapeHtml(post.excerpt || 'Découvrez nos articles sur l\'intelligence artificielle, l\'automatisation et la croissance digitale.');
  const img = resolveImageURL(post.cover_image || post.image || post.img || post.thumbnail || post.cover);
  const url = `https://www.hozanaconcept.com/article?id=${post.id}`;
  const date = new Date(post.publish_date || post.created_at).toISOString();

  // Update title and description
  document.title = title;
  document.querySelector('meta[name="description"]').setAttribute('content', desc);

  // Add Open Graph tags
  const ogTags = `
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Hozana Concept">
    <meta property="article:published_time" content="${date}">
    <meta property="article:modified_time" content="${date}">
    <meta property="article:author" content="${escapeHtml(post.author || 'Hozana Concept')}">
    <meta property="article:section" content="${escapeHtml(post.category || 'IA')}">
  `;

  // Add Twitter Card tags
  const twitterTags = `
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">
    <meta name="twitter:site" content="@HozanaConcept">
    <meta name="twitter:creator" content="@HozanaConcept">
  `;

  // Add canonical URL
  const canonical = `<link rel="canonical" href="${url}">`;

  // Remove existing meta tags to avoid duplicates
  document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]').forEach(el => el.remove());

  // Add new meta tags
  document.head.insertAdjacentHTML('beforeend', ogTags + twitterTags + canonical);
}

/* ============================================================
   IMAGE ALT TEXT ENHANCEMENT
   ============================================================ */
function enhanceImageAltText() {
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      const parent = img.closest('figure, .article-body, .related-img, .featured-img');
      if (parent) {
        const caption = parent.querySelector('figcaption, .caption, .alt-text');
        if (caption) {
          img.alt = escapeHtml(caption.textContent.trim());
        } else {
          // Try to get alt text from surrounding text
          const text = parent.textContent.trim();
          if (text.length > 0 && text.length < 100) {
            img.alt = escapeHtml(text);
          } else {
            img.alt = 'Image relative à l\'article';
          }
        }
      } else {
        img.alt = 'Image relative à l\'article';
      }
    }
  });
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
function initBlogSEO() {
  // Check if we're on a blog or article page
  if (window.location.pathname === '/blog' || window.location.pathname.startsWith('/article')) {
    // Add schema markup for blog page
    if (window.location.pathname === '/blog') {
      const schema = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Blog | Hozana Concept",
          "description": "Découvrez nos articles sur l'intelligence artificielle, l'automatisation et la croissance digitale.",
          "url": "https://www.hozanaconcept.com/blog",
          "publisher": {
            "@type": "Organization",
            "name": "Hozana Concept",
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=120&q=80",
              "width": 120,
              "height": 120
            }
          }
        }
        </script>
      `;
      document.head.insertAdjacentHTML('beforeend', schema);
    }

    // Enhance image alt text
    enhanceImageAltText();

    // Add sitemap reference
    const sitemap = `<link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">`;
    document.head.insertAdjacentHTML('beforeend', sitemap);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogSEO);
} else {
  initBlogSEO();
}
