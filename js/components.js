/* ============================================================
   Hozana Concept - Shared Components v2.0
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
    name: 'Moteur IA Principal',
    tags: 'Réseaux de Neurones · Agents Autonomes · Traitement du Langage · IA Prédictive',
    priority: true,
    href: 'service-ia',
  },
  {
    id: 'branding',
    icon: '✦',
    name: 'Moteur d\'Automatisation',
    tags: 'Orchestration de Workflows · Intégration API · Logique Event-driven',
    priority: false,
    href: 'service-branding',
  },
  {
    id: 'marketing',
    icon: '◈',
    name: 'Intelligence Growth',
    tags: 'Marketing Prédictif · Optimisation LTV · Publicité Autonomes',
    priority: false,
    href: 'service-marketing',
  },
  {
    id: 'dev',
    icon: '▣',
    name: 'SDK Plateforme',
    tags: 'Accès API · Documentation · Connecteurs Personnalisés · Sécurité',
    priority: false,
    href: 'service-dev',
  },
  {
    id: 'business',
    icon: '◉',
    name: 'Insights Entreprise',
    tags: 'Visualisation de Données · Automatisation BI · Analytics Temps Réel',
    priority: false,
    href: 'service-business',
  },
  {
    id: 'consulting',
    icon: '◆',
    name: 'Stratégie Expert',
    tags: 'Architecture de Solution · Audit de Sécurité · Planification d\'Échelle',
    priority: false,
    href: 'service-consulting',
  },
];

function renderNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  const isServicesActive = currentPage === 'platform';

  const simpleLinks = [
    { href: 'index',    label: 'Accueil' },
    { href: 'admin',    label: 'Administration' },
    { href: 'pricing',    label: 'Formules' },
    { href: 'blog',     label: 'Actualités' },
    { href: 'company',    label: 'À Propos' },
    { href: 'contact',  label: 'Nous Contacter' },
  ];

  // Dropdown Services item — liens vers les pages dédiées
  const ddCats = SERVICE_CATS.map(c => `
    <a class="dd-cat" href="${c.href}" onclick="closeMobileMenu()">
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
        Nos Services <i class="fas fa-chevron-down dd-chevron"></i>
      </span>
      <div class="nav-dropdown-panel" id="nav-services-panel" role="menu">
        <div class="dd-header">
          <span class="dd-header-title">Nos 6 pôles d'expertise</span>
          <a class="dd-header-cta" href="platform">Tout voir <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="dd-grid">${ddCats}</div>
      </div>
    </li>`;

  const navItems = simpleLinks.map(l => {
    const active = (currentPage === l.href || (currentPage === '' && l.href === 'index')) ? 'active' : '';
    return `<li><a href="${l.href}" class="${active}">${l.label}</a></li>`;
  });
  // Insérer Services après Accueil
  navItems.splice(1, 0, servicesDropdown);

  // Mobile dropdown Services — liens vers les pages dédiées
  const mobileDdItems = SERVICE_CATS.map(c =>
    `<a href="${c.href}" onclick="closeMobileMenu()">${c.icon} ${c.name}</a>`
  ).join('');

  const mobileItems = [
    `<li><a href="index.html" ${currentPage==='index'?'class="active"':''} onclick="closeMobileMenu()">Accueil</a></li>`,
    `<li><a href="admin" ${currentPage==='admin'?'class="active"':''} onclick="closeMobileMenu()">Administration</a></li>`,
    `<li>
      <div class="mobile-dd-toggle" onclick="toggleMobileServicesDd(this)">
        <span class="${isServicesActive ? 'active' : ''}">Nos Services</span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem;opacity:0.5;transition:transform 0.25s;"></i>
      </div>
      <div class="mobile-dd-list" id="mobile-services-list">${mobileDdItems}</div>
    </li>`,
    ...simpleLinks.slice(2).map(l => {
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
        <a href="contact" class="btn btn-primary btn-sm navbar-cta" aria-label="Démarrer un projet">Démarrer →</a>
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
      <a href="contact" class="btn btn-primary w-full" style="justify-content:center;" onclick="closeMobileMenu()">
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
              <li><a href="platform#ia">Moteur IA Principal</a></li>
              <li><a href="platform#automation">Moteur d'Automatisation</a></li>
              <li><a href="platform#growth">Intelligence de Croissance</a></li>
              <li><a href="platform#content">SDK Plateforme</a></li>
              <li><a href="platform#analytics">Perspectives Entreprise</a></li>
            </ul>
          </div>

          <!-- Ressources Column -->
          <div class="footer-links-col reveal delay-2">
            <h4 class="footer-col-title">
              <i class="fas fa-compass" style="color:var(--red);font-size:0.8rem;"></i>
              Ressources
            </h4>
            <ul class="footer-link-list">
              <li><a href="blog">Blog et Perspectives</a></li>
              <li><a href="pricing">Plans Tarifaires</a></li>
              <li><a href="company">Vision de l'Entreprise</a></li>
              <li><a href="contact">Nous Contacter</a></li>
              <li><a href="pricing#enterprise">Démo Entreprise</a></li>
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
              <li><a href="privacy">Politique de Confidentialité</a></li>
              <li><a href="legal">Mentions Légales</a></li>
              <li><a href="terms">Termes & Conditions</a></li>
              <li><a href="refund">Politique de Remboursement</a></li>
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
            <h3>📬 Recevez nos perspectives IA chaque semaine</h3>
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
            <a href="privacy">Confidentialité</a>
            <span class="sep">·</span>
            <a href="legal">Mentions Légales</a>
            <span class="sep">·</span>
            <a href="terms">Termes & Conditions</a>
            <span class="sep">·</span>
            <a href="refund">Politique de Remboursement</a>
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
        <a href="privacy">En savoir plus →</a>
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
    response: `Nous proposons cinq services principaux : l'IA sur mesure, l'automatisation, la growth digitale, le contenu IA et l'analytics BI. Quel domaine vous intéresse le plus ?`
  },
  packs: {
    patterns: ['pack', 'tarif', 'prix', 'combien', 'forfait', 'abonnement', 'offre'],
    response: `Nos packs commencent à 490€/mois pour le Starter, puis 990€/mois pour le Growth, 1 990€/mois pour l'Elite et sur devis pour l'Enterprise. Voulez-vous plus de détails sur un plan spécifique ?`
  },
  contact: {
    patterns: ['contact', 'appel', 'rdv', 'rendez-vous', 'parler', 'joindre', 'équipe'],
    response: `Vous pouvez nous contacter par email à info@hozanaconcept.com ou sur WhatsApp au +216 51 47 47 51. Souhaitez-vous réserver un audit gratuit ?`
  },
  audit: {
    patterns: ['audit', 'gratuit', 'diagnostic', 'analyse', 'évaluation', 'free'],
    response: `Notre audit gratuit de 30 minutes identifie vos opportunités IA, crée une roadmap personnalisée et estime le ROI. Vous voulez prendre rendez-vous ?`
  },
  ia: {
    patterns: ['ia', 'intelligence artificielle', 'ai', 'machine learning', 'gpt', 'chatgpt', 'llm'],
    response: `L'IA est au cœur de nos solutions : automatisation, analyse de données, génération de contenu et prédictions. Quel aspect vous intéresse ?`
  },
  roi: {
    patterns: ['roi', 'résultat', 'retour', 'investissement', 'rentable', 'bénéfice', 'chiffre'],
    response: `Nos clients voient en moyenne +67% de chiffre d'affaires, un ROI de 3,2 et une réduction de 40% des coûts grâce à nos solutions. Voulez-vous voir des études de cas spécifiques ?`
  },
  location: {
    patterns: ['location', 'office', 'headquarters', 'global', 'remote', 'where', 'address'],
    response: `Nous travaillons avec des clients partout dans le monde (Europe, USA, UAE, Afrique, Asie) et toutes nos missions sont 100% à distance. Où êtes-vous basé ?`
  },
  default: `Bonjour ! Je suis l'assistant IA de Hozana Concept. Comment puis-je vous aider aujourd'hui ?`
};

async function _getMistralResponse(msg) {
  const SYSTEM_PROMPT = `Tu es l'assistant IA de Hozana Concept. Tu réponds en français de manière naturelle, chaleureuse et concise, comme un collègue sympathique qui connaît bien son travail.

RÈGLES D'OR :
1. RÉPONDS UNIQUEMENT À LA QUESTION POSÉE - rien de plus, rien de moins
2. Si la question est simple (salutation, merci, etc.), donne une réponse simple et chaleureuse
3. Si tu ne connais pas l'information exacte, dis-le clairement et ou vers nos ressources officielles (site, contact, audit gratuit)
4. Utilise un ton conversationnel : évite le jargon commercial, parle comme un humain
5. Garde tes réponses courtes : 1-2 phrases maximum pour les questions factuelles
6. Ne fais pas de promotion non sollicitée - ne mentionne nos services/packs que si explicitement demandé

EXEMPLES :
- "Bonjour" → "Bonjour ! Comment puis-je vous aider ?"
- "Quel est votre email ?" → "Notre email est info@hozanaconcept.com"
- "Qui est votre CEO ?" → "Notre fondateur et CEO est Efro Mwanza"
- "Quels services proposez-vous ?" → "Nous proposons de l'IA sur mesure, de l'automatisation, de la growth digitale, du contenu IA et de l'analytics BI. Quel domaine vous intéresse ?"
- "Je veux un devis" → "Pour un devis personnalisé, commençons par notre audit gratuit de 30 minutes. Souhaitez-vous prendre rendez-vous ?"`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: msg,
        systemPrompt: SYSTEM_PROMPT
      })
    });

    const data = await response.json();

    if (!response.ok || data.fallback) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data.reply;
  } catch (error) {
    console.error('[Chatbot] API proxy error:', error);
    // Fallback to rule-based responses if API fails
    return _getBotResponse(msg);
  }
}

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
          <div class="chatbot-name">Hozana Concept</div>
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
            <button class="chat-suggestion" data-msg="Voir vos packs et tarifs">Plans & Tarifs</button>
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

// Map of question patterns to URLs and extraction functions
const _pageExtractors = [
  {
    // CEO / founder questions
    patterns: [/ceo|fondateur|dirigeant|efro|mwanza|who is the boss|patron/i],
    url: 'company',
    extract: (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Look for the CEO name in company
      const ceoNameEl = doc.querySelector('.team-name');
      if (ceoNameEl) {
        const ceoName = ceoNameEl.textContent.trim();
        const ceoRoleEl = doc.querySelector('.team-role');
        const ceoRole = ceoRoleEl ? ceoRoleEl.textContent.trim() : '';
        return `Le fondateur et CEO de Hozana Concept est ${ceoName} (${ceoRole}).`;
      }

      // Alternative extraction
      const ceoText = Array.from(doc.querySelectorAll('*'))
        .map(el => el.textContent.trim())
        .find(text => text.includes('Efro Mwanza') && text.includes('CEO'));
      if (ceoText) {
        return `Selon nos informations, le fondateur et CEO de Hozana Concept est Efro Mwanza.`;
      }

      return null;
    }
  },
  {
    // Email questions
    patterns: [/email|courriel|contacter|contact/i],
    url: 'contact',
    extract: (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Look for email in contact section
      const emailLink = doc.querySelector('a[href^="mailto:info@hozanaconcept.com"]');
      if (emailLink) {
        return `Vous pouvez nous contacter par email à ${emailLink.textContent.trim()}.`;
      }

      // Alternative
      const emailText = Array.from(doc.querySelectorAll('*'))
        .map(el => el.textContent.trim())
        .find(text => text.includes('@hozanaconcept.com'));
      if (emailText) {
        return `Notre adresse email est : ${emailText}.`;
      }

      return null;
    }
  },
  {
    // Phone / WhatsApp questions
    patterns: [/téléphone|phone|whatsapp|whatsapp/i],
    url: 'contact',
    extract: (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const phoneLink = doc.querySelector('a[href^="https://wa.me/21651474751"]');
      if (phoneLink) {
        return `Vous pouvez nous joindre sur WhatsApp au ${phoneLink.textContent.trim()}.`;
      }

      return null;
    }
  },
  {
    // Pricing questions
    patterns: [/tarif|prix|pack|combien coûte|abonnement/i],
    url: 'pricing',
    extract: (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Look for starter pack price
      const starterPrice = doc.querySelector('.stat-number, .price, .tarif');
      if (starterPrice) {
        const priceText = starterPrice.textContent.trim();
        if (priceText.includes('490') || priceText.includes('Starter')) {
          return `Nos packs commencent à partir de 490€/mois pour le pack Starter. Pour plus de détails sur nos tarifs, consultez notre page pricing.`;
        }
      }

      return null;
    }
  }
];

async function _handleUserMsg(msg) {
  if (!msg) return;
  console.log('[Chatbot] User message:', msg);
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

  // First, try to answer from specific pages
  try {
    const pageAnswer = await _answerFromPage(msg);
    if (pageAnswer) {
      _removeTyping();
      _addChatMessage(pageAnswer, 'bot');
      return;
    }
  } catch (pageError) {
    console.error('[Chatbot] Error in page extraction:', pageError);
    // Continue to Mistral fallback
  }

  // Fall back to Mistral API
  try {
    console.log('[Chatbot] Calling Mistral API...');
    const botResponse = await _getMistralResponse(msg);
    console.log('[Chatbot] Received response from Mistral:', botResponse.substring(0, 100) + '...');
    _removeTyping();
    _addChatMessage(botResponse, 'bot');
  } catch (error) {
    _removeTyping();
    console.error('[Chatbot] Error in _handleUserMsg:', error);
    _addChatMessage('Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques moments.', 'bot');
  }
}

async function _answerFromPage(question) {
  const lowerQuestion = question.toLowerCase();

  for (const extractor of _pageExtractors) {
    // Check if any pattern matches
    const matches = extractor.patterns.some(pattern => pattern.test(lowerQuestion));
    if (!matches) continue;

    try {
      console.log(`[Chatbot] Trying to extract answer from ${extractor.url} for question: ${question}`);
      const response = await fetch(extractor.url);

      if (!response.ok) {
        console.error(`[Chatbot] Failed to fetch ${extractor.url}: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const answer = extractor.extract(html);

      if (answer) {
        console.log(`[Chatbot] Extracted answer from ${extractor.url}: ${answer}`);
        return answer;
      }
    } catch (error) {
      console.error(`[Chatbot] Error fetching/processing ${extractor.url}:`, error);
      continue;
    }
  }

  return null; // No page could answer the question
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

