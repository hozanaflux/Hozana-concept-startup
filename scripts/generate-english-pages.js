/* ============================================================
   Hozana Concept - English Static Site Generator
   Creates /en pages with forced English runtime, local navigation,
   canonical and hreflang tags for international SEO.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const EN_ROOT = path.join(ROOT, 'en');
const SITE_URL = 'https://www.hozanaconcept.com';
const COMPONENTS_PATH = path.join(ROOT, 'js', 'components.js');

const ROOT_PAGES = [
  'index.html',
  'platform.html',
  'pricing.html',
  'blog.html',
  'company.html',
  'contact.html',
  'portfolio.html',
  'demo.html',
  'audit.html',
  'article.html',
  'pack-detail.html',
  'service-ia.html',
  'service-branding.html',
  'service-marketing.html',
  'service-dev.html',
  'service-business.html',
  'service-consulting.html',
  'privacy.html',
  'legal.html',
  'terms.html',
  'refund.html'
];

function listHtmlFiles(dir, prefix) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir)
    .filter(file => file.endsWith('.html'))
    .map(file => `${prefix}/${file}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toUrlPath(rel) {
  return rel === 'index.html' ? '' : rel.replace(/\\/g, '/');
}

function depthPrefix(rel) {
  const depth = rel.split('/').length;
  return '../'.repeat(depth);
}

function pagePrefix(rel) {
  const parts = rel.split('/');
  return parts.length === 1 ? './' : '../'.repeat(parts.length - 1);
}

function isExternal(value) {
  return /^(https?:|mailto:|tel:|#|javascript:|\/\/)/i.test(value || '');
}

function normalizeAsset(value, assetRoot) {
  if (!value || isExternal(value) || value.startsWith('data:')) return value;
  const clean = value.replace(/^(\.\/|\.\.\/)+/, '');
  if (/^(css|js|images|assets)\//.test(clean) || clean === 'favicon.ico') {
    return `${assetRoot}${clean}`;
  }
  return value;
}

function normalizeInternalHref(value, rel, pageRoot) {
  if (!value || isExternal(value) || value.startsWith('data:')) return value;
  if (/\.(pdf|zip|png|jpe?g|webp|svg|gif|ico)$/i.test(value)) return value;

  let hash = '';
  let href = value;
  const hashIndex = href.indexOf('#');
  if (hashIndex >= 0) {
    hash = href.slice(hashIndex);
    href = href.slice(0, hashIndex);
  }

  const clean = href.replace(/^(\.\/|\.\.\/)+/, '');
  if (!clean || clean.startsWith('admin-hozana-concept-admin/')) return value;
  if (clean.endsWith('.html') || clean === 'index' || /^[a-z0-9-]+$/i.test(clean)) {
    return `${pageRoot}${clean}${hash}`;
  }
  if (/^(blog-posts|pack-details)\//.test(clean)) return `${pageRoot}${clean}${hash}`;
  return value;
}

function upsertLink(document, rel, href, attrs = {}) {
  const selector = attrs.hreflang
    ? `link[rel="${rel}"][hreflang="${attrs.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let link = document.querySelector(selector);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  link.setAttribute('href', href);
}

function upsertMeta(document, name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertPropertyMeta(document, property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function extractConstObject(source, name) {
  const start = source.indexOf(`const ${name} = `);
  if (start < 0) return {};
  const objectStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = objectStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) {
      const literal = source.slice(objectStart, i + 1);
      return vm.runInNewContext(`(${literal})`, {});
    }
  }
  return {};
}

function loadEnglishMaps() {
  const source = fs.readFileSync(COMPONENTS_PATH, 'utf8');
  return {
    text: extractConstObject(source, 'PAGE_TEXT_EN'),
    placeholders: extractConstObject(source, 'PLACEHOLDER_EN'),
    phrases: extractConstObject(source, 'PHRASE_TEXT_EN')
  };
}

const EN_MAPS = loadEnglishMaps();

function preserveWhitespace(original, replacement) {
  const lead = original.match(/^\s*/)?.[0] || '';
  const trail = original.match(/\s*$/)?.[0] || '';
  return `${lead}${replacement}${trail}`;
}

function applyEnglishPhrases(value) {
  let result = value || '';
  Object.entries(EN_MAPS.phrases)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([from, to]) => { result = result.replaceAll(from, to); });
  return result;
}

function applyStaticEnglishText(document) {
  const walker = document.createTreeWalker(document.body, 4, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) return 2;
      const value = node.nodeValue.trim();
      if (!value || value.length > 220) return 2;
      return 1;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const original = node.nodeValue.trim();
    let translated = EN_MAPS.text[original] || original;
    translated = applyEnglishPhrases(translated);
    if (translated !== original) node.nodeValue = preserveWhitespace(node.nodeValue, translated);
  });

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    const original = el.getAttribute('placeholder');
    if (EN_MAPS.placeholders[original]) el.setAttribute('placeholder', EN_MAPS.placeholders[original]);
  });
}

function rewriteUrlForEnglish(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(`${SITE_URL}/blog-posts/`, `${SITE_URL}/en/blog-posts/`)
    .replace(`${SITE_URL}/pack-details/`, `${SITE_URL}/en/pack-details/`)
    .replace(`${SITE_URL}/blog`, `${SITE_URL}/en/blog.html`)
    .replace(`${SITE_URL}/pricing`, `${SITE_URL}/en/pricing.html`)
    .replace(`${SITE_URL}/contact`, `${SITE_URL}/en/contact.html`);
}

function localizeStructuredValue(value) {
  if (Array.isArray(value)) return value.map(localizeStructuredValue);
  if (value && typeof value === 'object') {
    const next = {};
    Object.entries(value).forEach(([key, item]) => {
      if (key === 'inLanguage') next[key] = 'en-US';
      else if (key === 'areaServed') next[key] = ['US', 'GB', 'EU', 'FR', 'TN'];
      else if (['url', '@id'].includes(key) || (key === 'item' && typeof item === 'string')) next[key] = rewriteUrlForEnglish(item);
      else if (key === 'name' && item === 'Packs et tarifs Hozana Concept') next[key] = 'Hozana Concept Plans and Pricing';
      else if (key === 'description' && typeof item === 'string') next[key] = applyEnglishPhrases(item);
      else if (key === 'serviceType') next[key] = 'AI automation and digital growth';
      else if (key === 'headline' && typeof item === 'string') next[key] = applyEnglishPhrases(item);
      else next[key] = localizeStructuredValue(item);
    });
    return next;
  }
  return typeof value === 'string' ? rewriteUrlForEnglish(applyEnglishPhrases(value)) : value;
}

function localizeStructuredData(document) {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '{}');
      const localized = localizeStructuredValue(data);
      if (localized['@type'] === 'Blog') {
        localized.name = 'Hozana Concept Blog';
        localized.description = 'AI, automation and digital growth insights from Hozana Concept.';
        localized.url = `${SITE_URL}/en/blog.html`;
        localized.inLanguage = 'en-US';
      }
      if (localized['@type'] === 'ItemList' && /pricing|tarifs/i.test(localized.name || '')) {
        localized.name = 'Hozana Concept Plans and Pricing';
        localized.url = `${SITE_URL}/en/pricing.html`;
      }
      script.textContent = JSON.stringify(localized).replace(/</g, '\\u003c');
    } catch {
      // Keep invalid third-party JSON untouched rather than breaking the page.
    }
  });
}

function localizeContactPage(document) {
  const mapFrame = document.querySelector('.map-iframe');
  if (mapFrame) {
    mapFrame.setAttribute('title', 'Hozana Concept international presence');
    mapFrame.setAttribute('aria-label', 'International presence map');
  }

  const faqHead = document.querySelector('#faq .text-center');
  if (faqHead) {
    faqHead.innerHTML = `
      <div class="section-label">Frequently Asked Questions</div>
      <h2 class="text-h1">Everything you need to <span class="gradient-text">know</span></h2>
      <p style="color:var(--white-60);margin-top:0.75rem;max-width:520px;margin-left:auto;margin-right:auto;">
        Still unsure? Here are the answers to the questions our clients ask most often before getting started.
      </p>`;
  }

  const faqList = document.getElementById('faq-list');
  if (faqList) {
    const items = [
      ['🌐 How much does a website cost?', 'Pricing depends on your needs. A business website starts from <strong>990€</strong> and an e-commerce store from <strong>1,990€</strong>. We also offer monthly plans from <strong>490€/month</strong> including website, maintenance and social media support. <a href="./pricing.html">View all plans →</a>'],
      ['⏱️ How long does it take to build my website?', 'We usually deliver a business website in <strong>10 to 21 days</strong> and an e-commerce store in <strong>3 to 4 weeks</strong>. More advanced projects such as apps or AI systems usually take 30 to 60 days. Everything starts with a free audit to define a precise timeline.'],
      ['🎨 I know nothing about design. Do you handle everything?', '<strong>Absolutely.</strong> You do not need technical knowledge. You share your ideas, activity and preferences, and we handle the rest: logo, visual identity, website, social media visuals and launch assets. You review, approve and move forward.'],
      ['📱 Do you also create visuals for social media?', 'Yes. We create <strong>posts, stories, reels and templates</strong> for Instagram, Facebook, TikTok and LinkedIn. Depending on your plan, we can also manage your full social media presence, including publishing, comments and editorial strategy.'],
      ['💳 How do payments work?', 'For custom projects: <strong>50% at order, 50% at delivery</strong>. Monthly plans are billed monthly by card or bank transfer. We can also arrange staged payments for projects above 1,500€.'],
      ['📊 How do I know if it works?', 'We define <strong>clear indicators from day one</strong>: traffic, conversion rate, generated leads, social engagement and operational savings. You receive regular reporting, and our clients typically see stronger ROI and lower operating costs within a few months.'],
      ['🌍 Do you work with clients outside France?', 'Yes. Hozana Concept works remotely with clients across several markets. Our delivery model is cloud-based, so strategy sessions, design reviews, automation setup and reporting can all be managed online.'],
      ['🚀 What is the first step?', 'Start with our <strong>free 30-minute audit</strong>. Fill out the form above and an expert will contact you within 24h. We analyze your situation, objectives and budget, then propose the most suitable solution with no commitment.']
    ];
    faqList.innerHTML = items.map(([q, a], index) => `
      <div class="faq-item reveal${index ? ` delay-${Math.min(index, 3)}` : ''}" onclick="toggleFaq(this)">
        <div class="faq-q">
          <div class="faq-q-text">${q}</div>
          <div class="faq-icon"><i class="fas fa-plus"></i></div>
        </div>
        <div class="faq-a">
          <div class="faq-a-inner">${a}</div>
        </div>
      </div>`).join('');
  }

  const faqCta = document.querySelector('#faq .text-center.mt-lg');
  if (faqCta) {
    faqCta.innerHTML = `
      <p style="color:var(--white-50);margin-bottom:1.25rem;">Do you have another question?</p>
      <a href="https://wa.me/+21651474751?text=Hello, I have a question for Hozana Concept" target="_blank" class="btn btn-glass btn-lg" style="margin-right:1rem;" data-site-link="phone">
        <i class="fab fa-whatsapp" style="color:#25D366;"></i> Direct WhatsApp
      </a>
      <a href="mailto:info@hozanaconcept.com" class="btn btn-outline" data-site-link="email">
        <i class="fas fa-envelope"></i> Send an email
      </a>`;
  }

  document.querySelectorAll('script').forEach(script => {
    if (!script.textContent) return;
    script.textContent = script.textContent
      .replace("Veuillez remplir tous les champs obligatoires.", "Please fill in all required fields.")
      .replace("Erreur lors de l\\'envoi. Contactez-nous directement par WhatsApp.", "Error while sending. Please contact us directly on WhatsApp.")
      .replace("Envoi...", "Sending...");
  });
}

function translateMetadata(document, rel) {
  const title = document.querySelector('title');
  const descriptions = {
    'index.html': 'Hozana Concept is an AI, automation and digital growth agency for ambitious companies in the US, UK, Europe and Africa.',
    'platform.html': 'Explore Hozana Concept services: AI engines, automation, growth intelligence, platform SDK, business insights and expert strategy.',
    'pricing.html': 'Compare Hozana Concept AI plans, automation packages and growth options for international companies.',
    'blog.html': 'AI, automation and digital growth insights from Hozana Concept.',
    'company.html': 'Discover Hozana Concept, an international AI and automation company helping businesses scale with technology.',
    'contact.html': 'Contact Hozana Concept for a free AI, automation or digital growth audit.'
  };

  if (title) {
    title.textContent = applyEnglishPhrases(title.textContent
      .replace('Agence IA & Automatisation', 'AI & Automation Agency')
      .replace('Tunisie, France, Afrique', 'USA, UK, Europe & Africa')
      .replace('Packs & Tarifs', 'Plans & Pricing')
      .replace('Actualités', 'Insights')
      .replace('À Propos', 'Company')
      .replace('Contact', 'Contact'));
    if (rel === 'contact.html') title.textContent = 'Contact & Free Audit | Hozana Concept - Reply within 24h';
  }
  if (descriptions[rel]) {
    upsertMeta(document, 'description', descriptions[rel]);
    upsertPropertyMeta(document, 'og:description', descriptions[rel]);
    upsertMeta(document, 'twitter:description', descriptions[rel]);
  }
  const pageTitle = applyEnglishPhrases(title?.textContent || 'Hozana Concept | AI & Automation');
  upsertPropertyMeta(document, 'og:title', pageTitle);
  upsertMeta(document, 'twitter:title', pageTitle);
  upsertPropertyMeta(document, 'og:locale', 'en_US');
}

function injectEnglishRuntime(document, rel) {
  document.querySelectorAll('script[data-english-runtime], script')
    .forEach(script => {
      const content = script.textContent || '';
      if (
        content.includes('window.__FORCE_LANG__') ||
        content.includes('window.__ROOT_PATH__') ||
        content.includes('window.__PAGE_ROOT__')
      ) {
        script.remove();
      }
    });

  const script = document.createElement('script');
  script.setAttribute('data-english-runtime', 'true');
  script.textContent = `window.__ROOT_PATH__=${JSON.stringify(depthPrefix(rel))};window.__PAGE_ROOT__=${JSON.stringify(pagePrefix(rel))};window.__FORCE_LANG__='en';`;
  document.head.insertBefore(script, document.head.firstChild);
}

function transformPage(rel) {
  const source = path.join(ROOT, rel);
  if (!fs.existsSync(source)) return null;

  const html = fs.readFileSync(source, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const assetRoot = depthPrefix(rel);
  const localPageRoot = pagePrefix(rel);
  const urlPath = toUrlPath(rel);
  const enUrl = `${SITE_URL}/en/${urlPath}`;
  const frUrl = `${SITE_URL}/${urlPath}`;

  document.documentElement.setAttribute('lang', 'en');
  injectEnglishRuntime(document, rel);
  translateMetadata(document, rel);
  applyStaticEnglishText(document);
  localizeStructuredData(document);
  if (rel === 'contact.html') localizeContactPage(document);
  upsertLink(document, 'canonical', enUrl);
  upsertLink(document, 'alternate', frUrl, { hreflang: 'fr' });
  upsertLink(document, 'alternate', enUrl, { hreflang: 'en-us' });
  upsertLink(document, 'alternate', enUrl, { hreflang: 'en-gb' });
  upsertLink(document, 'alternate', frUrl, { hreflang: 'x-default' });
  upsertMeta(document, 'robots', 'index, follow');

  document.querySelectorAll('[src]').forEach(el => {
    el.setAttribute('src', normalizeAsset(el.getAttribute('src'), assetRoot));
  });
  document.querySelectorAll('[href]').forEach(el => {
    const href = el.getAttribute('href');
    const assetHref = normalizeAsset(href, assetRoot);
    el.setAttribute('href', assetHref === href ? normalizeInternalHref(href, rel, localPageRoot) : assetHref);
  });

  const target = path.join(EN_ROOT, rel);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, dom.serialize().replace(/[ \t]+$/gm, '').replace(/\s*$/, '\n'));
  return rel;
}

function generateEnglishPages() {
  ensureDir(EN_ROOT);
  const pages = [
    ...ROOT_PAGES,
    ...listHtmlFiles('blog-posts', 'blog-posts'),
    ...listHtmlFiles('pack-details', 'pack-details')
  ];

  const generated = pages.map(transformPage).filter(Boolean);
  cleanupEnglishMirror('blog-posts');
  cleanupEnglishMirror('pack-details');
  console.log(`🌍 Generated ${generated.length} English static page(s) in /en`);
}

function cleanupEnglishMirror(dir) {
  const sourceDir = path.join(ROOT, dir);
  const targetDir = path.join(EN_ROOT, dir);
  if (!fs.existsSync(targetDir)) return;
  const sourceFiles = new Set(fs.existsSync(sourceDir)
    ? fs.readdirSync(sourceDir).filter(file => file.endsWith('.html'))
    : []);
  fs.readdirSync(targetDir)
    .filter(file => file.endsWith('.html') && !sourceFiles.has(file))
    .forEach(file => {
      fs.unlinkSync(path.join(targetDir, file));
      console.log(`🧹 Removed orphaned English page: en/${dir}/${file}`);
    });
}

if (require.main === module) generateEnglishPages();

module.exports = { generateEnglishPages };
