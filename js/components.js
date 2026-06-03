/* ============================================================
   Hozana Concept - Shared Components v2.0
   Navbar Glass, Footer Premium, Cookie, Chatbot, WhatsApp
   ============================================================ */

'use strict';

// ── Root path helper for blog-posts subfolder support ──
const R_ = window.__ROOT_PATH__ || '';
const root = () => R_;

// ============================================================
// NAVBAR — effet glass uniquement sur le groupe de liens
// ============================================================
// Catégories du dropdown Services — chaque entrée a sa page dédiée
const SERVICE_CATS = [
  {
    id: 'ia',
    icon: '⚡',
    name: 'Moteur IA Principal',
    tags: 'Réseaux de Neurones · Agents Autonomes · Traitement du Langage · IA Prédictive',
    priority: true,
    href: '',
  },
  {
    id: 'branding',
    icon: '✦',
    name: 'Moteur d\'Automatisation',
    tags: 'Orchestration de Workflows · Intégration API · Logique Event-driven',
    priority: false,
    href: '',
  },
  {
    id: 'marketing',
    icon: '◈',
    name: 'Intelligence Growth',
    tags: 'Marketing Prédictif · Optimisation LTV · Publicité Autonomes',
    priority: false,
    href: '',
  },
  {
    id: 'dev',
    icon: '▣',
    name: 'SDK Plateforme',
    tags: 'Accès API · Documentation · Connecteurs Personnalisés · Sécurité',
    priority: false,
    href: '',
  },
  {
    id: 'business',
    icon: '◉',
    name: 'Insights Entreprise',
    tags: 'Visualisation de Données · Automatisation BI · Analytics Temps Réel',
    priority: false,
    href: '',
  },
  {
    id: 'consulting',
    icon: '◆',
    name: 'Stratégie Expert',
    tags: 'Architecture de Solution · Audit de Sécurité · Planification d\'Échelle',
    priority: false,
    href: '',
  },
];

function renderNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  const isServicesActive = currentPage === 'platform';

  const simpleLinks = [
    { href: R_ + 'index.html',    label: 'Accueil' },
    { href: R_ + 'pricing.html',  label: 'Formules' },
    { href: R_ + 'blog.html',     label: 'Actualités' },
    { href: R_ + 'company.html',  label: 'À Propos' },
    { href: R_ + 'contact.html',  label: 'Contact' },
  ];

  // Dropdown Services item — liens vers les pages dédiées
  const servicePages = ['service-ia.html','service-branding.html','service-marketing.html','service-dev.html','service-business.html','service-consulting.html'];
  const ddCats = SERVICE_CATS.map((c, i) => `
    <a class="dd-cat" href="${root()}${servicePages[i]}" onclick="closeMobileMenu()">
      <div class="dd-cat-icon">${c.icon}</div>
      <div class="dd-cat-body">
        <div class="dd-cat-name">
          ${c.name}
          ${c.priority ? '<span class="dd-priority">CORE</span>' : ''}
        </div>
        <div class="dd-cat-tags">${c.tags}</div>
      </div>
    </a>`).join('');

  const servicesDropdown = `
    <li class="nav-dropdown-wrap" id="nav-services-wrap">
      <span class="nav-dropdown-trigger ${isServicesActive ? 'active' : ''}" id="nav-services-trigger" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
        Service <i class="fas fa-chevron-down dd-chevron"></i>
      </span>
      <div class="nav-dropdown-panel" id="nav-services-panel" role="menu">
        <div class="dd-header">
          <span class="dd-header-title">Nos 6 pôles d'expertise</span>
          <a class="dd-header-cta" href="${root()}platform.html">Tout voir <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="dd-grid">${ddCats}</div>
      </div>
    </li>`;

  const navItems = simpleLinks.map(l => {
    const active = (currentPage === l.href.split('/').pop() || (currentPage === '' && l.href.endsWith('index.html'))) ? 'active' : '';
    return `<li><a href="${l.href}" class="${active}">${l.label}</a></li>`;
  });
  // Insérer Services après Accueil
  navItems.splice(1, 0, servicesDropdown);

  // Mobile dropdown Services — liens vers les pages dédiées
  const mobileDdItems = SERVICE_CATS.map((c, i) =>
    `<a href="${root()}${servicePages[i]}" onclick="closeMobileMenu()">${c.icon} ${c.name}</a>`
  ).join('');

  const mobileItems = [
    `<li><a href="${R_}index.html" ${currentPage==='index'||currentPage===''?'class="active"':''} onclick="closeMobileMenu()">Accueil</a></li>`,
    `<li>
      <div class="mobile-dd-toggle" onclick="toggleMobileServicesDd(this)">
        <span class="${isServicesActive ? 'active' : ''}">Service</span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem;opacity:0.5;transition:transform 0.25s;"></i>
      </div>
      <div class="mobile-dd-list" id="mobile-services-list">${mobileDdItems}</div>
    </li>`,
    ...simpleLinks.slice(1).map(l => {
      const active = currentPage === l.href.split('/').pop() || (currentPage === '' && l.href.endsWith('index.html')) ? 'class="active"' : '';
      return `<li><a href="${l.href}" ${active} onclick="closeMobileMenu()">${l.label}</a></li>`;
    })
  ].join('');

  const html = `
  <nav class="navbar" id="navbar" role="navigation" aria-label="Navigation principale">
    <div class="navbar-container">

      <!-- Logo -->
      <a href="${root()}index.html" class="navbar-logo" aria-label="Hozana Concept - Accueil">
        <img src="${root()}images/logo-main.png" alt="Hozana Concept" class="navbar-logo-img" style="height:44px;width:auto;display:block;object-fit:contain;">
      </a>

      <!-- Nav links pill glass -->
      <div class="navbar-links-glass" aria-label="Menu principal">
        <ul class="navbar-nav" id="navbar-nav">
          ${navItems.join('')}
        </ul>
      </div>

      <!-- Actions -->
      <div class="navbar-actions">
        <button class="theme-toggle" id="theme-toggle" title="Basculer le thème" aria-label="Changer le thème">
          <div class="theme-toggle-track">
            <div class="theme-toggle-thumb" id="theme-thumb">🌙</div>
          </div>
        </button>
        <a href="${root()}contact.html" class="btn btn-primary btn-sm navbar-cta" aria-label="Démarrer un projet">Démarrer →</a>
        <button class="hamburger" id="hamburger" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <div class="mobile-overlay" id="mobile-overlay" onclick="closeMobileMenu()" aria-hidden="true"></div>

  <!-- Mobile Menu Panel -->
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Menu mobile" aria-hidden="true">
    <div class="mobile-menu-header">
      <img src="${root()}images/logo-main.png" alt="Hozana Concept" style="height:36px;width:auto;object-fit:contain;">
      <button class="mobile-close" onclick="closeMobileMenu()" aria-label="Fermer le menu">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <ul class="mobile-nav-list">
      ${mobileItems}
    </ul>
    <div class="mobile-menu-footer">
      <a href="${root()}contact.html" class="btn btn-primary w-full" style="justify-content:center;" onclick="closeMobileMenu()">
        <i class="fas fa-rocket"></i> Démarrer mon projet
      </a>
      <div class="mobile-contact-info">
        <a href="mailto:info@hozanaconcept.com"><i class="fas fa-envelope"></i> info@hozanaconcept.com</a>
        <a href="https://wa.me/21651474751"><i class="fab fa-whatsapp"></i> +216 51 47 47 51</a>
      </div>
    </div>
  </div>`;

  const target = document.getElementById('navbar-placeholder');
  if (target) target.innerHTML = html;

  // Init after render
  _initNavbar();
}

function _initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay   = document.getElementById('mobile-overlay');
  const themeBtn  = document.getElementById('theme-toggle');
  const thumb     = document.getElementById('theme-thumb');

  // Scroll glass effect
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hamburger — mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
  }

  // Theme toggle
  if (themeBtn && thumb) {
    const savedTheme = localStorage.getItem('hozana-theme') || 'dark';
    _applyTheme(savedTheme, thumb);

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      _applyTheme(next, thumb);
      localStorage.setItem('hozana-theme', next);
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMobileMenu(); closeServicesDropdown(); }
  });

  // Services dropdown desktop
  _initServicesDropdown();
}

function _initServicesDropdown() {
  const wrap    = document.getElementById('nav-services-wrap');
  const trigger = document.getElementById('nav-services-trigger');
  const panel   = document.getElementById('nav-services-panel');
  if (!wrap || !trigger || !panel) return;

  const open  = () => { wrap.classList.add('open');  trigger.setAttribute('aria-expanded','true'); };
  const close = () => { wrap.classList.remove('open'); trigger.setAttribute('aria-expanded','false'); };

  // Hover desktop
  wrap.addEventListener('mouseenter', open);
  wrap.addEventListener('mouseleave', close);

  // Click / touch
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.contains('open') ? close() : open();
  });

  // Keyboard
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wrap.classList.contains('open') ? close() : open(); }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });
}

function closeServicesDropdown() {
  const wrap = document.getElementById('nav-services-wrap');
  if (wrap) wrap.classList.remove('open');
}

function toggleMobileServicesDd(el) {
  const list = document.getElementById('mobile-services-list');
  const icon = el.querySelector('i');
  if (!list) return;
  const isOpen = list.classList.toggle('open');
  if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
}

function openMobileMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const burger  = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  overlay && overlay.classList.add('show');
  burger && burger.classList.add('active');
  burger && burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const burger  = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  overlay && overlay.classList.remove('show');
  burger && burger.classList.remove('active');
  burger && burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function _applyTheme(theme, thumb) {
  document.documentElement.setAttribute('data-theme', theme);
  if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
  const track = document.querySelector('.theme-toggle-track');
  if (track) track.classList.toggle('light', theme === 'light');
}

// ============================================================
// FOOTER PREMIUM
// ============================================================
function renderFooter() {
  const year = new Date().getFullYear();
  const html = `
  <footer class="footer-premium" id="site-footer">

    <!-- Main grid -->
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid-premium">

          <!-- Brand Column -->
          <div class="footer-brand-col reveal">
            <a href="${root()}index.html" class="footer-logo-link" aria-label="Hozana Concept">
              <img src="${root()}images/logo-footer.png" alt="Hozana Concept" style="height:52px;width:auto;object-fit:contain;filter:brightness(0) invert(1);">
            </a>
            <p class="footer-brand-desc">
              Plateforme IA de nouvelle génération opérant dans le monde entier. Nous automatisons, accélérons et transformons les entreprises ambitieuses grâce à l'intelligence artificielle.
            </p>
            <div class="footer-social">
              <a href="#" class="social-link" title="Réseau professionnel LinkedIn" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a href="#" class="social-link" title="Réseau social Twitter/X" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link" title="Réseau social Instagram" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link" title="Plateforme vidéo YouTube" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              <a href="#" class="social-link" title="Réseau social TikTok" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
            </div>
            <!-- Badges trust -->
            <div class="footer-trust-badges">
              <div class="trust-badge"><i class="fas fa-shield-alt"></i> RGPD Conforme</div>
              <div class="trust-badge"><i class="fas fa-award"></i> Certifié IA</div>
            </div>
          </div>

          <!-- Services Column -->
          <div class="footer-links-col reveal delay-1">
            <h4 class="footer-col-title">
              <i class="fas fa-bolt" style="color:var(--red);font-size:0.8rem;"></i>
              Plateforme
            </h4>
            <ul class="footer-link-list">
              <li><a href="${root()}platform.html#ia">Moteur IA Principal</a></li>
              <li><a href="${root()}platform.html#automation">Moteur d'Automatisation</a></li>
              <li><a href="${root()}platform.html#growth">Intelligence de Croissance</a></li>
              <li><a href="${root()}platform.html#content">SDK Plateforme</a></li>
              <li><a href="${root()}platform.html#analytics">Perspectives Entreprise</a></li>
            </ul>
          </div>

          <!-- Ressources Column -->
          <div class="footer-links-col reveal delay-2">
            <h4 class="footer-col-title">
              <i class="fas fa-compass" style="color:var(--red);font-size:0.8rem;"></i>
              Ressources
            </h4>
            <ul class="footer-link-list">
              <li><a href="${root()}blog.html">Blog et Perspectives</a></li>
              <li><a href="${root()}pricing.html">Plans Tarifaires</a></li>
              <li><a href="${root()}company.html">Vision de l'Entreprise</a></li>
              <li><a href="${root()}contact.html">Contact</a></li>
              <li><a href="${root()}pricing.html#enterprise">Démo Entreprise</a></li>
            </ul>
          </div>

          <!-- Contact + Legal Column -->
          <div class="footer-links-col reveal delay-3">
            <h4 class="footer-col-title">
              <i class="fas fa-headset" style="color:var(--red);font-size:0.8rem;"></i>
              Contact
            </h4>
            <ul class="footer-contact-list">
              <li>
                <a href="mailto:info@hozanaconcept.com">
                  <span class="contact-icon"><i class="fas fa-envelope"></i></span>
                  <span>info@hozanaconcept.com</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/21651474751" target="_blank" rel="noopener">
                  <span class="contact-icon"><i class="fab fa-whatsapp"></i></span>
                  <span>+216 51 47 47 51</span>
                </a>
              </li>
              <li>
                <span class="contact-icon"><i class="fas fa-map-marker-alt"></i></span>
                <span>Hozana Concept Global Headquarters</span>
              </li>
            </ul>

            <h4 class="footer-col-title" style="margin-top:1.75rem;">
              <i class="fas fa-balance-scale" style="color:var(--red);font-size:0.8rem;"></i>
              Légal
            </h4>
            <ul class="footer-link-list">
              <li><a href="${root()}privacy.html">Politique de Confidentialité</a></li>
              <li><a href="${root()}legal.html">Mentions Légales</a></li>
              <li><a href="${root()}terms.html">Termes & Conditions</a></li>
              <li><a href="${root()}refund.html">Politique de Remboursement</a></li>
            </ul>
          </div>

        </div><!-- /footer-grid-premium -->
      </div>
    </div>

    <!-- Newsletter strip -->
    <div class="footer-newsletter-strip">
      <div class="container">
        <div class="newsletter-strip-inner reveal">
          <div class="newsletter-strip-text">
            <h3>Recevez nos perspectives IA chaque semaine</h3>
            <p>Rejoignez +1 200 entrepreneurs abonnés à notre newsletter.</p>
          </div>
          <form class="newsletter-strip-form" onsubmit="footerSubscribe(event)">
            <input type="email" placeholder="votre@email.com" required aria-label="Votre email">
            <button type="submit" class="btn btn-primary btn-sm">S'abonner →</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom-bar">
      <div class="container">
        <div class="footer-bottom-inner">
          <p class="footer-copyright">
            © ${year} <strong>Hozana Concept</strong>. Tous droits réservés.
          </p>
          <div class="footer-bottom-links">
            <a href="${root()}privacy.html">Confidentialité</a>
            <span class="sep">·</span>
            <a href="${root()}legal.html">Mentions Légales</a>
            <span class="sep">·</span>
            <a href="${root()}terms.html">Termes & Conditions</a>
            <span class="sep">·</span>
            <a href="${root()}refund.html">Politique de Remboursement</a>
          </div>
          <div class="footer-status">
            <span class="status-indicator online"></span>
            <span>Tous les services opérationnels</span>
          </div>
        </div>
      </div>
    </div>
  </footer>`;

  const target = document.getElementById('footer-placeholder');
  if (target) target.innerHTML = html;
}

async function footerSubscribe(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const email = input?.value;
  if (!email) return;
  try {
    await fetch('tables/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'footer-newsletter', status: 'new', name: 'Newsletter Footer' })
    });
    window.HC?.showToast('🎉 Inscription réussie ! Bienvenue dans la communauté.', 'success');
    e.target.reset();
  } catch {
    window.HC?.showToast('Une erreur est survenue. Réessayez.', 'error');
  }
}

// ============================================================
// COOKIE POPUP
// ============================================================
function renderCookiePopup() {
  if (localStorage.getItem('hozana-cookies')) return;

  const html = `
  <div class="cookie-popup" id="cookie-popup" role="dialog" aria-label="Consentement cookies">
    <div class="cookie-popup-inner glass-heavy">
      <div class="cookie-icon">🍪</div>
      <div class="cookie-content">
        <h3>Votre vie privée nous importe</h3>
        <p>Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter ou refuser les cookies non essentiels.</p>
        <a href="privacy.html">En savoir plus →</a>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-glass btn-sm" id="decline-cookies">Refuser</button>
        <button class="btn btn-primary btn-sm" id="accept-cookies">Accepter tout</button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  setTimeout(() => {
    document.getElementById('cookie-popup')?.classList.add('show');
  }, 2500);

  document.getElementById('accept-cookies')?.addEventListener('click', () => {
    localStorage.setItem('hozana-cookies', 'accepted');
    document.getElementById('cookie-popup')?.classList.remove('show');
  });

  document.getElementById('decline-cookies')?.addEventListener('click', () => {
    localStorage.setItem('hozana-cookies', 'declined');
    document.getElementById('cookie-popup')?.classList.remove('show');
  });
}

// ============================================================
// CHATBOT IA — Knowledge base + lead qualification
// ============================================================
const HC_COMPANY_KB = {
  name: 'Hozana Concept',
  positioning: 'Plateforme et agence IA qui conçoit des solutions digitales, automatisées et orientées croissance pour les entreprises ambitieuses.',
  founder: 'Efro Mwanza, fondateur et CEO',
  promise: 'Audit gratuit de 30 minutes, réponse sous 24h, accompagnement à distance pour des clients en France et à l\'international.',
  email: 'info@hozanaconcept.com',
  whatsapp: '+216 51 47 47 51',
  whatsappUrl: 'https://wa.me/21651474751',
  availability: 'WhatsApp disponible 7j/7 de 9h à 21h. Email avec réponse sous 24h.',
  rendezvous: 'Le rendez-vous recommandé est un audit gratuit de 30 minutes pour comprendre le besoin, identifier les opportunités IA et proposer une roadmap.'
};

const HC_ACTIVITY_POLES = [
  {
    id: 'ia',
    name: 'Intelligence Artificielle',
    aliases: ['ia', 'intelligence artificielle', 'chatbot', 'agent ia', 'llm', 'gpt', 'mistral', 'automatisation ia'],
    summary: 'Solutions IA sur mesure : chatbots site et WhatsApp, agents IA personnalisés, analyse prédictive, génération de contenu IA, scoring et qualification.',
    examples: ['Chatbot IA 24/7', 'Agent IA métier', 'RAG sur documents internes', 'Qualification automatique de leads', 'Intégration GPT, Claude ou Mistral']
  },
  {
    id: 'branding',
    name: 'Branding & Création',
    aliases: ['branding', 'logo', 'identité', 'design', 'ui', 'ux', 'création', 'visuel'],
    summary: 'Construction d\'identité visuelle et d\'expériences de marque : logo, charte graphique, UI/UX, motion design et supports créatifs.',
    examples: ['Logo et charte graphique', 'Direction artistique', 'UI/UX design', 'Visuels réseaux sociaux', 'Supports print']
  },
  {
    id: 'marketing',
    name: 'Marketing Digital',
    aliases: ['marketing', 'ads', 'publicité', 'seo', 'social media', 'growth marketing', 'tiktok', 'google ads', 'facebook ads'],
    summary: 'Acquisition et croissance digitale : campagnes ads, social media, SEO, stratégie éditoriale, reporting et optimisation continue.',
    examples: ['Facebook/Google/TikTok Ads', 'SEO', 'Social media management', 'Stratégie de contenu', 'Optimisation CPA']
  },
  {
    id: 'dev',
    name: 'Développement Tech',
    aliases: ['développement', 'site', 'application', 'app', 'web', 'mobile', 'saas', 'api', 'ecommerce'],
    summary: 'Développement web, mobile et logiciel : sites vitrines, e-commerce, apps mobiles, SaaS, API, intégrations et maintenance.',
    examples: ['Site vitrine', 'E-commerce', 'Application mobile', 'SaaS sur mesure', 'API et intégrations']
  },
  {
    id: 'business',
    name: 'Business & Monétisation',
    aliases: ['business', 'monétisation', 'funnel', 'conversion', 'cro', 'email', 'sms', 'revenus', 'vente'],
    summary: 'Systèmes de conversion et de revenus : funnels, CRO, email/SMS automation, upsell, cross-sell, landing pages et checkout.',
    examples: ['Funnel de vente', 'Email automation', 'SMS automation', 'Optimisation checkout', 'Lead magnets']
  },
  {
    id: 'consulting',
    name: 'Consulting Premium',
    aliases: ['consulting', 'audit', 'stratégie', 'coaching', 'formation', 'roadmap', 'transformation digitale'],
    summary: 'Accompagnement stratégique : audit digital, stratégie IA, roadmap, transformation digitale, coaching et formation des équipes.',
    examples: ['Audit digital 360', 'Roadmap IA', 'Coaching dirigeant', 'Formation outils IA', 'Pilotage projet']
  }
];

const HC_PACKS = [
  { name: 'Starter', price: 'à partir de 490€/mois HT', fit: 'premières automatisations, chatbot et accompagnement initial' },
  { name: 'Growth', price: 'à partir de 990€/mois HT', fit: 'PME en croissance, workflows, analytics, contenu IA et acquisition' },
  { name: 'Elite', price: 'à partir de 1 990€/mois HT', fit: 'transformation IA complète, BI, prédictif, support VIP' },
  { name: 'Enterprise', price: 'sur devis', fit: 'architecture dédiée, SLA, sécurité, propriété IP et équipe dédiée' }
];

let _chatLeadDraft = { intent: null, name: '', email: '', phone: '', company: '', service: '', preferredSlot: '', message: '' };
let _chatAwaiting = null;

function _buildChatSystemPrompt() {
  return `Tu es l'assistant IA officiel de Hozana Concept. Tu représentes l'image de l'entreprise : professionnel, clair, exigeant, utile.

IDENTITÉ:
- Hozana Concept est une plateforme/agence IA et digitale.
- Fondateur et CEO : Efro Mwanza.
- Contact : info@hozanaconcept.com, WhatsApp +216 51 47 47 51.
- Audit gratuit : 30 minutes, réponse sous 24h.

6 PÔLES D'ACTIVITÉ:
${HC_ACTIVITY_POLES.map(p => `- ${p.name}: ${p.summary}`).join('\n')}

PACKS:
${HC_PACKS.map(p => `- ${p.name}: ${p.price}, adapté à ${p.fit}.`).join('\n')}

RÈGLES:
1. Réponds en français, de manière courte mais premium.
2. Ne donne jamais d'informations inventées. Si tu ne sais pas, propose un audit gratuit.
3. Pour un besoin projet, qualifie : objectif, service, entreprise, délai, email/téléphone.
4. Quand l'utilisateur veut un rendez-vous, demande les informations manquantes et explique qu'un expert confirme le créneau sous 24h.
5. Termine souvent par une question utile, jamais par un discours vague.`;
}

async function _getMistralResponse(msg) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        systemPrompt: _buildChatSystemPrompt(),
        model: 'mistral-small-latest'
      })
    });

    const data = await response.json();
    if (!response.ok || data.fallback) throw new Error(data.error || `API error: ${response.status}`);
    return _escapeHtml(data.reply);
  } catch (error) {
    console.error('[Chatbot] API proxy error:', error);
    return _getBotResponse(msg);
  }
}

function _getBotResponse(msg) {
  const m = _normalizeChatText(msg);
  if (_isGreeting(m)) return 'Bonjour. Je suis l\'assistant IA de Hozana Concept. Je peux vous orienter sur nos 6 pôles, nos packs, ou préparer un rendez-vous d\'audit gratuit.';
  if (_containsAny(m, ['merci', 'thanks'])) return 'Avec plaisir. Souhaitez-vous que je vous aide à choisir le bon pôle ou à préparer un rendez-vous ?';
  if (_containsAny(m, ['ceo', 'fondateur', 'dirigeant', 'patron', 'efro'])) return `Le fondateur et CEO de Hozana Concept est ${HC_COMPANY_KB.founder}.`;
  if (_containsAny(m, ['email', 'mail', 'contact'])) return `Vous pouvez nous écrire à <strong>${HC_COMPANY_KB.email}</strong>. Pour une réponse plus rapide, WhatsApp : <strong>${HC_COMPANY_KB.whatsapp}</strong>.`;
  if (_containsAny(m, ['whatsapp', 'telephone', 'téléphone', 'appel'])) return `Notre WhatsApp est <strong>${HC_COMPANY_KB.whatsapp}</strong>, disponible 7j/7 de 9h à 21h. Je peux aussi préparer votre demande ici.`;
  if (_containsAny(m, ['rdv', 'rendez', 'rendez-vous', 'audit', 'reservation', 'réservation', 'devis', 'meeting'])) return _startAppointmentFlow(msg);
  if (_containsAny(m, ['prix', 'tarif', 'pack', 'abonnement', 'combien'])) return _renderPackAnswer();
  if (_containsAny(m, ['service', 'pôle', 'pole', 'activité', 'expertise', 'faites quoi', 'que faites'])) return _renderPolesAnswer();
  if (_containsAny(m, ['roi', 'résultat', 'rentable', 'performance', 'retour'])) return 'Nous cadrons chaque mission avec des indicateurs mesurables : leads, taux de conversion, coût d\'acquisition, temps gagné, chiffre d\'affaires ou productivité. Le meilleur point de départ est un audit gratuit pour estimer le potentiel réel.';

  const pole = _matchPole(m);
  if (pole) return _renderPoleAnswer(pole);

  return 'Je peux vous aider sur l IA, le branding, le marketing digital, le développement tech, la monétisation ou le consulting. Quel objectif voulez-vous atteindre en priorité ?';
}

function _renderPolesAnswer() {
  return `
    <strong>Nos 6 pôles d'activité :</strong>
    <ul class="chat-list">
      ${HC_ACTIVITY_POLES.map(p => `<li><strong>${p.name}</strong> — ${p.summary}</li>`).join('')}
    </ul>
    Dites-moi votre objectif, et je vous recommande le bon pôle.`;
}

function _renderPoleAnswer(pole) {
  return `
    <strong>${pole.name}</strong><br>
    ${pole.summary}
    <ul class="chat-list">${pole.examples.slice(0, 5).map(x => `<li>${x}</li>`).join('')}</ul>
    Voulez-vous que je prépare un audit gratuit pour ce besoin ?`;
}

function _renderPackAnswer() {
  return `
    <strong>Nos packs principaux :</strong>
    <ul class="chat-list">
      ${HC_PACKS.map(p => `<li><strong>${p.name}</strong> — ${p.price}. Idéal pour ${p.fit}.</li>`).join('')}
    </ul>
    Pour un conseil fiable, dites-moi votre activité, votre objectif et votre budget approximatif.`;
}

function _startAppointmentFlow(message = '') {
  _chatLeadDraft = { intent: 'appointment', name: '', email: '', phone: '', company: '', service: '', preferredSlot: '', message: '' };
  _chatLeadDraft.message = message || _chatLeadDraft.message;
  _chatAwaiting = 'name';
  return `Très bien. Je vais préparer une demande d'audit gratuit de 30 minutes. Pour commencer, quel est votre <strong>prénom et nom</strong> ?`;
}

function _handleAppointmentStep(msg) {
  const email = _extractEmail(msg);
  const phone = _extractPhone(msg);
  if (email) _chatLeadDraft.email = email;
  if (phone) _chatLeadDraft.phone = phone;

  if (_chatAwaiting === 'name') {
    _chatLeadDraft.name = msg.trim();
    _chatAwaiting = 'email';
    return 'Merci. Quelle est votre <strong>adresse email professionnelle</strong> ?';
  }
  if (_chatAwaiting === 'email') {
    if (!_chatLeadDraft.email) return 'Je n\'ai pas reconnu l\'email. Pouvez-vous me l\'envoyer au format nom@entreprise.com ?';
    _chatAwaiting = 'phone';
    return 'Parfait. Quel numéro WhatsApp ou téléphone pouvons-nous utiliser pour confirmer le rendez-vous ?';
  }
  if (_chatAwaiting === 'phone') {
    if (!_chatLeadDraft.phone) return 'Pouvez-vous préciser votre numéro WhatsApp ou téléphone ?';
    _chatAwaiting = 'company';
    return 'Merci. Quel est le nom de votre entreprise ou projet ?';
  }
  if (_chatAwaiting === 'company') {
    _chatLeadDraft.company = msg.trim();
    _chatAwaiting = 'service';
    return 'Quel pôle vous intéresse le plus : IA, Branding, Marketing, Développement, Business/Monétisation ou Consulting ?';
  }
  if (_chatAwaiting === 'service') {
    const pole = _matchPole(_normalizeChatText(msg));
    _chatLeadDraft.service = pole ? pole.name : msg.trim();
    _chatAwaiting = 'slot';
    return 'Quel créneau préférez-vous pour l audit ? Exemple : demain matin, vendredi 15h, ou cette semaine après-midi.';
  }
  if (_chatAwaiting === 'slot') {
    _chatLeadDraft.preferredSlot = msg.trim();
    _chatAwaiting = 'goal';
    return 'Dernière question : quel est votre objectif principal ou le problème à résoudre ?';
  }
  if (_chatAwaiting === 'goal') {
    _chatLeadDraft.message = [_chatLeadDraft.message, msg.trim()].filter(Boolean).join('\nObjectif: ');
    _chatAwaiting = null;
    _saveChatLead();
    return `
      Votre demande est prête. Un expert Hozana Concept confirmera le rendez-vous sous 24h.
      <div class="chat-summary">
        <div><strong>Nom :</strong> ${_escapeHtml(_chatLeadDraft.name)}</div>
        <div><strong>Email :</strong> ${_escapeHtml(_chatLeadDraft.email)}</div>
        <div><strong>Téléphone :</strong> ${_escapeHtml(_chatLeadDraft.phone)}</div>
        <div><strong>Entreprise :</strong> ${_escapeHtml(_chatLeadDraft.company)}</div>
        <div><strong>Pôle :</strong> ${_escapeHtml(_chatLeadDraft.service)}</div>
        <div><strong>Créneau souhaité :</strong> ${_escapeHtml(_chatLeadDraft.preferredSlot)}</div>
      </div>
      Pour accélérer, vous pouvez aussi écrire directement sur WhatsApp : <a href="${HC_COMPANY_KB.whatsappUrl}" target="_blank" rel="noopener">${HC_COMPANY_KB.whatsapp}</a>.`;
  }
  return null;
}

function renderChatbot() {
  const html = `
  <div class="chatbot-container" id="chatbot" role="complementary" aria-label="Assistant IA">
    <button class="chatbot-toggle" id="chatbot-toggle" title="Assistant IA Hozana" aria-expanded="false">
      <span class="chatbot-icon-open"><i class="fas fa-robot"></i></span>
      <span class="chatbot-icon-close" style="display:none;"><i class="fas fa-times"></i></span>
      <div class="chatbot-pulse"></div>
      <div class="chatbot-notification" id="chatbot-notif">1</div>
    </button>
    <div class="chatbot-window glass-heavy" id="chatbot-window" role="dialog" aria-label="Chat avec l'assistant IA" aria-hidden="true">
      <div class="chatbot-header">
        <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
        <div>
          <div class="chatbot-name">Assistant Hozana IA</div>
          <div class="chatbot-status"><span class="status-dot"></span> Conseil, qualification & rendez-vous</div>
        </div>
        <button class="chatbot-close" id="chatbot-close" aria-label="Fermer le chat"><i class="fas fa-times"></i></button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-message bot">
          <div class="chat-bubble">
            Bonjour. Je suis l'assistant IA de <strong>Hozana Concept</strong>.<br><br>
            Je peux vous orienter sur nos 6 pôles, recommander un pack, qualifier votre besoin ou préparer un rendez-vous d'audit gratuit.
          </div>
          <div class="chat-suggestions">
            <button class="chat-suggestion" data-msg="Présentez-moi vos 6 pôles d'activité">6 pôles</button>
            <button class="chat-suggestion" data-msg="Quel pack me recommandez-vous ?">Choisir un pack</button>
            <button class="chat-suggestion" data-msg="Je veux prendre rendez-vous pour un audit gratuit">Prendre RDV</button>
          </div>
        </div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Votre message..." aria-label="Message pour l'assistant IA" />
        <button class="chatbot-send" id="chatbot-send" aria-label="Envoyer"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  _initChatbot();
}

function _initChatbot() {
  const toggle  = document.getElementById('chatbot-toggle');
  const win     = document.getElementById('chatbot-window');
  const close   = document.getElementById('chatbot-close');
  const input   = document.getElementById('chatbot-input');
  const send    = document.getElementById('chatbot-send');
  const notif   = document.getElementById('chatbot-notif');

  // Show notification after 5s
  setTimeout(() => notif?.classList.add('visible'), 5000);

  function openChat() {
    win?.classList.add('open');
    win?.setAttribute('aria-hidden', 'false');
    toggle?.setAttribute('aria-expanded', 'true');
    const iconOpen1 = toggle?.querySelector('.chatbot-icon-open');
    const iconClose1 = toggle?.querySelector('.chatbot-icon-close');
    if (iconOpen1) iconOpen1.style.display = 'none';
    if (iconClose1) iconClose1.style.display = 'flex';
    notif?.classList.remove('visible');
    input?.focus();
  }

  function closeChat() {
    win?.classList.remove('open');
    win?.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-expanded', 'false');
    const iconOpen2 = toggle?.querySelector('.chatbot-icon-open');
    const iconClose2 = toggle?.querySelector('.chatbot-icon-close');
    if (iconOpen2) iconOpen2.style.display = 'flex';
    if (iconClose2) iconClose2.style.display = 'none';
  }

  toggle?.addEventListener('click', () => win?.classList.contains('open') ? closeChat() : openChat());
  close?.addEventListener('click', closeChat);

  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => _handleUserMsg(btn.getAttribute('data-msg')));
  });

  send?.addEventListener('click', () => {
    const msg = input?.value.trim();
    if (msg) { _handleUserMsg(msg); input.value = ''; }
  });

  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send?.click(); }
  });
}

function _addChatMessage(text, type = 'bot') {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const el = document.createElement('div');
  el.className = `chat-message ${type}`;
  const safeText = type === 'user' ? _escapeHtml(text) : _formatBotReply(text);
  el.innerHTML = `<div class="chat-bubble">${safeText}</div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function _addTyping() {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const el = document.createElement('div');
  el.className = 'chat-message bot typing-indicator';
  el.id = 'chat-typing';
  el.innerHTML = `<div class="chat-bubble"><span></span><span></span><span></span></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function _removeTyping() {
  document.getElementById('chat-typing')?.remove();
}

async function _handleUserMsg(msg) {
  if (!msg) return;
  console.log('[Chatbot] User message:', msg);
  _addChatMessage(msg, 'user');

  _captureContactHints(msg);

  _addTyping();

  try {
    if (_chatAwaiting) {
      const stepAnswer = _handleAppointmentStep(msg);
      _removeTyping();
      _addChatMessage(stepAnswer || 'Je vous écoute. Pouvez-vous préciser ?', 'bot');
      return;
    }

    const localAnswer = _getBotResponse(msg);
    const shouldUseAI = _shouldUseAiFallback(msg, localAnswer);
    const botResponse = shouldUseAI ? await _getMistralResponse(msg) : localAnswer;

    _removeTyping();
    _addChatMessage(botResponse, 'bot');
  } catch (error) {
    _removeTyping();
    console.error('[Chatbot] Error in _handleUserMsg:', error);
    _addChatMessage('Je rencontre une difficulté technique, mais je peux quand même transmettre votre demande. Envoyez votre email, téléphone et objectif, et un expert vous recontactera sous 24h.', 'bot');
  }
}

function _normalizeChatText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function _containsAny(text, terms) {
  return terms.some(term => text.includes(_normalizeChatText(term)));
}

function _isGreeting(text) {
  return /^(bonjour|bonsoir|salut|hello|hi|coucou|bjr)\b/.test(text);
}

function _matchPole(normalizedText) {
  return HC_ACTIVITY_POLES.find(pole => pole.aliases.some(alias => normalizedText.includes(_normalizeChatText(alias))));
}

function _shouldUseAiFallback(message, localAnswer) {
  const m = _normalizeChatText(message);
  if (_containsAny(m, ['rdv', 'rendez', 'audit', 'devis', 'prix', 'tarif', 'pack', 'service', 'pôle', 'pole', 'contact', 'whatsapp', 'email'])) return false;
  if (_matchPole(m)) return false;
  return localAnswer.length < 160 && message.length > 35;
}

function _extractEmail(value) {
  return String(value || '').match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || '';
}

function _extractPhone(value) {
  const match = String(value || '').match(/(?:\+?\d[\d\s().-]{6,}\d)/);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '';
}

function _captureContactHints(message) {
  const email = _extractEmail(message);
  const phone = _extractPhone(message);
  if (email) _chatLeadDraft.email = email;
  if (phone) _chatLeadDraft.phone = phone;

  if (email && !_chatAwaiting) {
    _saveChatLead({
      name: _chatLeadDraft.name || 'Lead Chatbot',
      email,
      phone: _chatLeadDraft.phone,
      message: `Contact partagé dans le chatbot: ${message}`
    });
  }
}

function _saveChatLead(extra = {}) {
  const payload = {
    name: extra.name || _chatLeadDraft.name || 'Lead Chatbot',
    email: extra.email || _chatLeadDraft.email || '',
    phone: extra.phone || _chatLeadDraft.phone || '',
    company: extra.company || _chatLeadDraft.company || '',
    service: extra.service || _chatLeadDraft.service || 'Audit gratuit chatbot',
    message: extra.message || [
      _chatLeadDraft.message,
      _chatLeadDraft.preferredSlot ? `Créneau souhaité: ${_chatLeadDraft.preferredSlot}` : ''
    ].filter(Boolean).join('\n'),
    source: 'chatbot_rdv',
    status: 'new'
  };

  if (!payload.email && !payload.phone) return;

  fetch('tables/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.warn('[Chatbot] Lead save failed:', err));
}

function _escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function _formatBotReply(value) {
  const text = String(value || '');
  if (/<(strong|ul|li|a|div|br)\b/i.test(text)) return text;
  return text.replace(/\n{3,}/g, '\n\n').replace(/\n/g, '<br>');
}

// ============================================================
// WHATSAPP FLOATING BUTTON
// ============================================================
function renderWhatsApp() {
  const a = document.createElement('a');
  a.href = 'https://wa.me/21651474751?text=Bonjour%20Hozana%20Concept%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20services.';
  a.className = 'whatsapp-btn';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = 'Contacter sur WhatsApp';
  a.setAttribute('aria-label', 'Contacter Hozana Concept sur WhatsApp');
  a.innerHTML = '<i class="fab fa-whatsapp"></i>';
  document.body.appendChild(a);
}

// ============================================================
// CUSTOM CURSOR (desktop only)
// ============================================================
function renderCursor() {
  if (window.innerWidth <= 1024) return;
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="cursor" id="cursor" aria-hidden="true"></div>
    <div class="cursor-follower" id="cursor-follower" aria-hidden="true"></div>
  `);
}

// ============================================================
// PAGE TRANSITION
// ============================================================
function renderPageTransition() {
  const el = document.createElement('div');
  el.className = 'page-transition';
  el.id = 'page-transition';
  document.body.appendChild(el);

  document.querySelectorAll('a[href]:not([target="_blank"])').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('https') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('javascript') || href.startsWith('//')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      el.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
}

// ============================================================
// INIT ALL COMPONENTS — robust init (handles already-loaded DOM)
// ============================================================
function _initAllComponents() {
  console.log('[Hozana] Initializing components...');
  renderCursor();
  renderNavbar();
  renderFooter();
  renderCookiePopup();
  renderChatbot();
  renderWhatsApp();
  setTimeout(renderPageTransition, 150);
  console.log('[Hozana] Components initialized');
}

// Fire immediately if DOM already loaded, otherwise wait for event
if (document.readyState === 'loading') {
  console.log('[Hozana] DOM loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', _initAllComponents);
} else {
  // DOM already loaded — run immediately
  console.log('[Hozana] DOM already loaded, initializing immediately');
  _initAllComponents();
}
