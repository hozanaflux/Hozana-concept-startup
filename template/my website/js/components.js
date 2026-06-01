/* ============================================================
   HOZANA CONCEPT - Shared Components v2.0
   Navbar Glass, Footer Premium, Cookie, Chatbot, WhatsApp
   ============================================================ */

'use strict';

// ============================================================
// NAVBAR — effet glass uniquement sur le groupe de liens
// ============================================================
// Catégories du dropdown Services — chaque entrée a sa page dédiée
const SERVICE_CATS = [
  {
    id: 'ia',
    icon: '⚡',
    name: 'Intelligence Artificielle',
    tags: 'Chatbots IA · Agents IA · Automatisation · Prédictions',
    priority: true,
    href: 'service-ia.html',
  },
  {
    id: 'branding',
    icon: '✦',
    name: 'Branding & Création',
    tags: 'Brand Identity · UI/UX Design · Motion · Content Studio',
    priority: false,
    href: 'service-branding.html',
  },
  {
    id: 'marketing',
    icon: '◈',
    name: 'Marketing Digital',
    tags: 'Growth · Social Media · Ads · SEO',
    priority: false,
    href: 'service-marketing.html',
  },
  {
    id: 'dev',
    icon: '▣',
    name: 'Développement Tech',
    tags: 'Sites web · Apps · SaaS · API & intégrations',
    priority: false,
    href: 'service-dev.html',
  },
  {
    id: 'business',
    icon: '◉',
    name: 'Business & Monétisation',
    tags: 'Funnels · CRO · Email/SMS · Stratégies revenus',
    priority: false,
    href: 'service-business.html',
  },
  {
    id: 'consulting',
    icon: '◆',
    name: 'Consulting Premium',
    tags: 'Audit digital · Stratégie IA · Coaching · Transformation',
    priority: false,
    href: 'service-consulting.html',
  },
];

function renderNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isServicesActive = currentPage === 'services.html';

  const simpleLinks = [
    { href: 'index.html',    label: 'Accueil' },
    { href: 'packs.html',    label: 'Packs' },
    { href: 'blog.html',     label: 'Blog' },
    { href: 'about.html',    label: 'À Propos' },
    { href: 'contact.html',  label: 'Contact' },
  ];

  // Dropdown Services item — liens vers les pages dédiées
  const ddCats = SERVICE_CATS.map(c => `
    <a class="dd-cat" href="${c.href}" onclick="closeMobileMenu()">
      <div class="dd-cat-icon">${c.icon}</div>
      <div class="dd-cat-body">
        <div class="dd-cat-name">
          ${c.name}
          ${c.priority ? '<span class="dd-priority">STAR</span>' : ''}
        </div>
        <div class="dd-cat-tags">${c.tags}</div>
      </div>
    </a>`).join('');

  const servicesDropdown = `
    <li class="nav-dropdown-wrap" id="nav-services-wrap">
      <span class="nav-dropdown-trigger ${isServicesActive ? 'active' : ''}" id="nav-services-trigger" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
        Services <i class="fas fa-chevron-down dd-chevron"></i>
      </span>
      <div class="nav-dropdown-panel" id="nav-services-panel" role="menu">
        <div class="dd-header">
          <span class="dd-header-title">Nos 6 pôles d'expertise</span>
          <a class="dd-header-cta" href="services.html">Tout voir <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="dd-grid">${ddCats}</div>
      </div>
    </li>`;

  const navItems = simpleLinks.map(l => {
    const active = (currentPage === l.href || (currentPage === '' && l.href === 'index.html')) ? 'active' : '';
    return `<li><a href="${l.href}" class="${active}">${l.label}</a></li>`;
  });
  // Insérer Services après Accueil
  navItems.splice(1, 0, servicesDropdown);

  // Mobile dropdown Services — liens vers les pages dédiées
  const mobileDdItems = SERVICE_CATS.map(c =>
    `<a href="${c.href}" onclick="closeMobileMenu()">${c.icon} ${c.name}</a>`
  ).join('');

  const mobileItems = [
    `<li><a href="index.html" ${currentPage==='index.html'?'class="active"':''} onclick="closeMobileMenu()">Accueil</a></li>`,
    `<li>
      <div class="mobile-dd-toggle" onclick="toggleMobileServicesDd(this)">
        <span class="${isServicesActive ? 'active' : ''}">Services</span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem;opacity:0.5;transition:transform 0.25s;"></i>
      </div>
      <div class="mobile-dd-list" id="mobile-services-list">${mobileDdItems}</div>
    </li>`,
    ...simpleLinks.slice(1).map(l => {
      const active = currentPage === l.href ? 'class="active"' : '';
      return `<li><a href="${l.href}" ${active} onclick="closeMobileMenu()">${l.label}</a></li>`;
    })
  ].join('');

  const html = `
  <nav class="navbar" id="navbar" role="navigation" aria-label="Navigation principale">
    <div class="navbar-container">

      <!-- Logo -->
      <a href="index.html" class="navbar-logo" aria-label="Hozana Concept - Accueil">
        <img src="images/logo-main.png" alt="Hozana Concept" class="navbar-logo-img" style="height:44px;width:auto;display:block;object-fit:contain;">
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
        <a href="contact.html" class="btn btn-primary btn-sm navbar-cta" aria-label="Démarrer un projet">Démarrer →</a>
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
      <img src="images/logo-main.png" alt="Hozana Concept" style="height:36px;width:auto;object-fit:contain;">
      <button class="mobile-close" onclick="closeMobileMenu()" aria-label="Fermer le menu">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <ul class="mobile-nav-list">
      ${mobileItems}
    </ul>
    <div class="mobile-menu-footer">
      <a href="contact.html" class="btn btn-primary w-full" style="justify-content:center;" onclick="closeMobileMenu()">
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
    <!-- Top decorative line -->
    <div class="footer-top-glow"></div>

    <!-- Main grid -->
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid-premium">

          <!-- Brand Column -->
          <div class="footer-brand-col reveal">
            <a href="index.html" class="footer-logo-link" aria-label="Hozana Concept">
              <img src="images/logo-footer.png" alt="Hozana Concept" style="height:52px;width:auto;object-fit:contain;filter:brightness(0) invert(1);">
            </a>
            <p class="footer-brand-desc">
              Agence IA de nouvelle génération basée en Tunisie. Nous automatisons, accélérons et transformons les entreprises ambitieuses grâce à l'intelligence artificielle.
            </p>
            <div class="footer-social">
              <a href="#" class="social-link" title="LinkedIn" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a href="#" class="social-link" title="Twitter/X" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link" title="Instagram" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link" title="YouTube" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              <a href="#" class="social-link" title="TikTok" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
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
              Services
            </h4>
            <ul class="footer-link-list">
              <li><a href="services.html#ia">Intelligence Artificielle</a></li>
              <li><a href="services.html#automation">Automatisation Avancée</a></li>
              <li><a href="services.html#growth">Growth Digital</a></li>
              <li><a href="services.html#content">Contenu IA</a></li>
              <li><a href="services.html#analytics">Analytics & BI</a></li>
            </ul>
          </div>

          <!-- Ressources Column -->
          <div class="footer-links-col reveal delay-2">
            <h4 class="footer-col-title">
              <i class="fas fa-compass" style="color:var(--red);font-size:0.8rem;"></i>
              Ressources
            </h4>
            <ul class="footer-link-list">
              <li><a href="blog.html">Blog & Insights</a></li>
              <li><a href="packs.html">Nos Packs</a></li>
              <li><a href="about.html">À Propos</a></li>
              <li><a href="contact.html">Nous Contacter</a></li>
              <li><a href="contact.html#audit">Audit Gratuit</a></li>
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
                <span>5, rue Kheireddine Pacha, Tunis 1003, Tunisie 🇹🇳</span>
              </li>
            </ul>

            <h4 class="footer-col-title" style="margin-top:1.75rem;">
              <i class="fas fa-balance-scale" style="color:var(--red);font-size:0.8rem;"></i>
              Légal
            </h4>
            <ul class="footer-link-list">
              <li><a href="privacy.html">Politique de Confidentialité</a></li>
              <li><a href="legal.html">Mentions Légales</a></li>
              <li><a href="terms.html">Termes & Conditions</a></li>
              <li><a href="refund.html">Politique de Remboursement</a></li>
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
            <h3>📬 Recevez nos insights IA chaque semaine</h3>
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
            <a href="privacy.html">Confidentialité</a>
            <span class="sep">·</span>
            <a href="legal.html">Mentions Légales</a>
            <span class="sep">·</span>
            <a href="terms.html">Termes & Conditions</a>
            <span class="sep">·</span>
            <a href="refund.html">Remboursement</a>
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
// CHATBOT IA
// ============================================================
const _chatResponses = {
  services: {
    patterns: ['service', 'offre', 'que faites', 'proposez', 'domaine', 'expertise'],
    response: `Nous proposons 5 services phares :<br><br>
🤖 <b>Intelligence Artificielle</b> — Solutions IA sur mesure<br>
⚡ <b>Automatisation</b> — Workflows & intégrations<br>
📈 <b>Growth Digital</b> — Croissance accélérée<br>
✍️ <b>Contenu IA</b> — Génération à grande échelle<br>
📊 <b>Analytics BI</b> — Tableaux de bord intelligents<br><br>
<a href="services.html" style="color:var(--red);">Voir tous les services →</a>`
  },
  packs: {
    patterns: ['pack', 'tarif', 'prix', 'combien', 'forfait', 'abonnement', 'offre'],
    response: `Nos packs pour tous les besoins :<br><br>
🚀 <b>Starter</b> — 490€/mois · Pour démarrer<br>
⚡ <b>Growth</b> — 990€/mois · Pour accélérer ⭐<br>
🏆 <b>Elite</b> — 1 990€/mois · Pour dominer<br>
💎 <b>Enterprise</b> — Sur devis · Architecture dédiée<br><br>
<a href="packs.html" style="color:var(--red);">Voir les détails →</a>`
  },
  contact: {
    patterns: ['contact', 'appel', 'rdv', 'rendez-vous', 'parler', 'joindre', 'équipe'],
    response: `Nous sommes disponibles pour vous ! 🙌<br><br>
📧 <b>Email :</b> info@hozanaconcept.com<br>
💬 <b>WhatsApp :</b> <a href="https://wa.me/21651474751" style="color:var(--red);">+216 51 47 47 51</a><br>
📍 <b>Tunis, Tunisie</b> — Nous servons le monde entier<br><br>
📅 <a href="contact.html" style="color:var(--red);font-weight:700;">Réserver mon audit gratuit →</a>`
  },
  audit: {
    patterns: ['audit', 'gratuit', 'diagnostic', 'analyse', 'évaluation', 'free'],
    response: `Excellent choix ! 🎯<br><br>
Notre <b>audit gratuit de 30 minutes</b> inclut :<br>
✅ Identification des opportunités IA<br>
✅ Roadmap personnalisée<br>
✅ Estimation ROI<br><br>
<a href="contact.html" style="color:var(--red);">Réserver mon audit gratuit →</a>`
  },
  ia: {
    patterns: ['ia', 'intelligence artificielle', 'ai', 'machine learning', 'gpt', 'chatgpt', 'llm'],
    response: `L'IA est au cœur de tout ce que nous faisons ! 🤖<br><br>
Nous développons des solutions IA pour :<br>
• Automatiser votre service client 24/7<br>
• Analyser vos données en temps réel<br>
• Générer du contenu à grande échelle<br>
• Prédire les comportements clients<br><br>
<a href="services.html#ia" style="color:var(--red);">En savoir plus →</a>`
  },
  roi: {
    patterns: ['roi', 'résultat', 'retour', 'investissement', 'rentable', 'bénéfice', 'chiffre'],
    response: `Nos clients voient des résultats concrets 📈<br><br>
✅ <b>+67 % de chiffre d'affaires</b> en moyenne sur 6 mois<br>
✅ <b>×3,2 ROI</b> moyen constaté chez nos clients<br>
✅ <b>-40 % de coûts</b> grâce à l'automatisation<br>
✅ Premiers résultats visibles <b>dès 30 jours</b><br><br>
<a href="about.html" style="color:var(--red);">Voir nos études de cas →</a>`
  },
  location: {
    patterns: ['tunisie', 'tunis', 'tunisien', 'pays', 'localisation', 'où', 'distance', 'remote'],
    response: `Nous sommes basés à Tunis 🇹🇳<br><br>
Nous travaillons avec des clients en :<br>
🇫🇷 <b>France</b> · 🇧🇪 <b>Belgique</b> · 🇨🇭 <b>Suisse</b><br>
🇲🇦 <b>Maroc</b> · 🇩🇿 <b>Algérie</b> · 🌍 Afrique & monde<br><br>
Toutes nos missions se font <b>100 % à distance</b>, en visio et outils collaboratifs.<br><br>
<a href="contact.html" style="color:var(--red);">Discutons de votre projet →</a>`
  },
  default: `Bonjour ! Je suis l'assistant IA de <b>Hozana Concept</b> 🤖<br><br>
Je peux vous renseigner sur :<br>
• 🚀 Nos <b>services IA</b> et automatisation<br>
• 💰 Nos <b>packs & tarifs</b><br>
• 🎯 L'<b>audit gratuit</b> de 30 min<br>
• 📞 Comment nous <b>contacter</b><br>
• 📊 Nos <b>résultats clients</b><br><br>
Qu'est-ce que je peux faire pour vous aujourd'hui ?`
};

function _getBotResponse(msg) {
  const m = msg.toLowerCase();
  for (const [k, v] of Object.entries(_chatResponses)) {
    if (k === 'default') continue;
    if (v.patterns.some(p => m.includes(p))) return v.response;
  }
  return _chatResponses.default;
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
          <div class="chatbot-name">Hozana AI</div>
          <div class="chatbot-status"><span class="status-dot"></span> En ligne — Répond en quelques sec.</div>
        </div>
        <button class="chatbot-close" id="chatbot-close" aria-label="Fermer le chat"><i class="fas fa-times"></i></button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-message bot">
          <div class="chat-bubble">
            👋 Bonjour ! Je suis l'assistant IA de <strong>Hozana Concept</strong>.<br><br>
            Je suis ici pour vous aider à découvrir nos services IA et d'automatisation. Que puis-je faire pour vous ?
          </div>
          <div class="chat-suggestions">
            <button class="chat-suggestion" data-msg="Quels sont vos services ?">Nos services</button>
            <button class="chat-suggestion" data-msg="Voir vos packs et tarifs">Packs & Tarifs</button>
            <button class="chat-suggestion" data-msg="Je veux un audit gratuit">Audit gratuit</button>
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
  el.innerHTML = `<div class="chat-bubble">${text}</div>`;
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

function _handleUserMsg(msg) {
  if (!msg) return;
  _addChatMessage(msg, 'user');

  // Capture email if shared
  const emailMatch = msg.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    fetch('tables/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailMatch[0], source: 'chatbot', status: 'new', name: 'Chatbot Lead' })
    }).catch(() => {});
  }

  _addTyping();
  setTimeout(() => {
    _removeTyping();
    _addChatMessage(_getBotResponse(msg), 'bot');
  }, 900 + Math.random() * 700);
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

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('javascript')) return;

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
  renderCursor();
  renderNavbar();
  renderFooter();
  renderCookiePopup();
  renderChatbot();
  renderWhatsApp();
  setTimeout(renderPageTransition, 150);
}

// Fire immediately if DOM already loaded, otherwise wait for event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initAllComponents);
} else {
  // DOM already loaded — run immediately
  _initAllComponents();
}
