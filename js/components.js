/* ============================================================
   Hozana Concept - Shared Components v2.0
   Navbar Glass, Footer Premium, Cookie, Chatbot, WhatsApp
   ============================================================ */

'use strict';

// ── Root path helper for blog-posts subfolder support ──
const R_ = window.__ROOT_PATH__ || '';
const P_ = window.__PAGE_ROOT__ ?? R_;
const root = () => R_;
const pageRoot = () => P_;

const HC_SITE_DEFAULTS = {
  email: 'info@hozanaconcept.com',
  phone: '+216 51 47 47 51',
  address: 'Hozana Concept Global Headquarters',
  linkedin_url: '#',
  facebook_url: '#',
  instagram_url: '#',
  twitter_url: '#',
  youtube_url: '#',
  tiktok_url: '#'
};
let HC_SITE_SETTINGS = { ...HC_SITE_DEFAULTS };

function siteSetting(key) {
  return HC_SITE_SETTINGS[key] || HC_SITE_DEFAULTS[key] || '';
}

function whatsappUrl(phone = siteSetting('phone')) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

function applySiteSettings() {
  const socialMap = {
    linkedin: 'linkedin_url',
    facebook: 'facebook_url',
    instagram: 'instagram_url',
    twitter: 'twitter_url',
    youtube: 'youtube_url',
    tiktok: 'tiktok_url'
  };

  document.querySelectorAll('[data-site-field]').forEach(el => {
    const key = el.getAttribute('data-site-field');
    const value = siteSetting(key);
    el.textContent = value;
  });

  document.querySelectorAll('[data-site-link]').forEach(el => {
    const key = el.getAttribute('data-site-link');
    if (key === 'email') el.href = `mailto:${siteSetting('email')}`;
    if (key === 'phone') el.href = whatsappUrl(siteSetting('phone'));
  });

  document.querySelectorAll('[data-site-social]').forEach(el => {
    const key = socialMap[el.getAttribute('data-site-social')];
    const value = key ? siteSetting(key) : '#';
    el.href = value || '#';
    el.toggleAttribute('hidden', !value || value === '#');
  });
}

async function loadSiteSettings() {
  try {
    const res = await fetch(`${root()}tables/site_settings?order=key.asc&limit=100`);
    if (!res.ok) return;
    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    HC_SITE_SETTINGS = { ...HC_SITE_DEFAULTS, ...Object.fromEntries(rows.map(row => [row.key, row.value || ''])) };
    if (typeof HC_COMPANY_KB !== 'undefined') {
      HC_COMPANY_KB.email = siteSetting('email');
      HC_COMPANY_KB.whatsapp = siteSetting('phone');
      HC_COMPANY_KB.whatsappUrl = whatsappUrl();
    }
    applySiteSettings();
  } catch {}
}

// ============================================================
// INTERNATIONALISATION — FR / EN
// ============================================================
const SUPPORTED_LANGS = ['fr', 'en'];

const I18N = {
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Service',
      pricing: 'Formules',
      blog: 'Actualités',
      company: 'À Propos',
      contact: 'Contact',
      start: 'Démo →',
      startProject: 'Voir la démo',
      mainMenu: 'Menu principal',
      mainNav: 'Navigation principale',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      theme: 'Changer le thème',
      expertise: 'Nos 6 pôles d\'expertise',
      all: 'Tout voir',
      core: 'CORE'
    },
    services: {
      ia: { name: 'Intelligence Artificielle', tags: 'Automatisation IA · Chatbots · Agents IA · Analyse prédictive · Génération contenu' },
      branding: { name: 'Branding & Création', tags: 'Brand Identity · UI/UX Design · Motion Design · Content Studio' },
      marketing: { name: 'Marketing Digital', tags: 'Growth Marketing · Social Media · Ads Facebook/Google/TikTok · SEO' },
      dev: { name: 'Développement Tech', tags: 'Sites web · Apps web & mobile · SaaS · API & intégrations' },
      business: { name: 'Business & Monétisation', tags: 'Funnels · CRO · Email & SMS automation · Stratégies de revenus' },
      consulting: { name: 'Consulting Premium', tags: 'Audit digital · Stratégie IA · Transformation digitale · Coaching' }
    },
    footer: {
      desc: 'Plateforme IA de nouvelle génération opérant dans le monde entier. Nous automatisons, accélérons et transformons les entreprises ambitieuses grâce à l\'intelligence artificielle.',
      gdpr: 'RGPD Conforme',
      aiCertified: 'Certifié IA',
      platform: 'Plateforme',
      resources: 'Ressources',
      legal: 'Légal',
      blog: 'Blog et Perspectives',
      plans: 'Plans Tarifaires',
      vision: 'Vision de l\'Entreprise',
      enterpriseDemo: 'Démo Entreprise',
      privacy: 'Politique de Confidentialité',
      legalNotice: 'Mentions Légales',
      terms: 'Termes & Conditions',
      refund: 'Politique de Remboursement',
      newsletterTitle: 'Recevez nos perspectives IA chaque semaine',
      newsletterText: 'Rejoignez +1 200 entrepreneurs abonnés à notre newsletter.',
      subscribe: 'S\'abonner →',
      email: 'votre@email.com',
      rights: 'Tous droits réservés.',
      privacyShort: 'Confidentialité',
      operational: 'Tous les services opérationnels'
    },
    chatbot: {
      toggle: 'Assistant IA Hozana',
      name: 'Assistant Hozana IA',
      greeting: 'Bonjour. Je suis l\'assistant IA de Hozana Concept.',
      intro: 'Je peux vous orienter sur nos 6 pôles, nos packs, ou préparer un rendez-vous d\'audit gratuit.'
    }
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      pricing: 'Plans',
      blog: 'Insights',
      company: 'Company',
      contact: 'Contact',
      start: 'Demo →',
      startProject: 'View demo',
      mainMenu: 'Main menu',
      mainNav: 'Main navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      theme: 'Change theme',
      expertise: 'Our 6 areas of expertise',
      all: 'View all',
      core: 'CORE'
    },
    services: {
      ia: { name: 'Artificial Intelligence', tags: 'AI automation · Chatbots · AI agents · Predictive analytics · Content generation' },
      branding: { name: 'Branding & Creation', tags: 'Brand identity · UI/UX design · Motion design · Content studio' },
      marketing: { name: 'Digital Marketing', tags: 'Growth marketing · Social media · Facebook/Google/TikTok ads · SEO' },
      dev: { name: 'Tech Development', tags: 'Websites · Web & mobile apps · SaaS · APIs & integrations' },
      business: { name: 'Business & Monetization', tags: 'Funnels · CRO · Email & SMS automation · Revenue strategies' },
      consulting: { name: 'Premium Consulting', tags: 'Digital audit · AI strategy · Digital transformation · Coaching' }
    },
    footer: {
      desc: 'A next-generation AI platform operating worldwide. We automate, accelerate and transform ambitious companies through artificial intelligence.',
      gdpr: 'GDPR Compliant',
      aiCertified: 'AI Certified',
      platform: 'Platform',
      resources: 'Resources',
      legal: 'Legal',
      blog: 'Blog and Insights',
      plans: 'Pricing Plans',
      vision: 'Company Vision',
      enterpriseDemo: 'Enterprise Demo',
      privacy: 'Privacy Policy',
      legalNotice: 'Legal Notice',
      terms: 'Terms & Conditions',
      refund: 'Refund Policy',
      newsletterTitle: 'Get our AI insights every week',
      newsletterText: 'Join 1,200+ entrepreneurs subscribed to our newsletter.',
      subscribe: 'Subscribe →',
      email: 'your@email.com',
      rights: 'All rights reserved.',
      privacyShort: 'Privacy',
      operational: 'All services operational'
    },
    chatbot: {
      toggle: 'Hozana AI Assistant',
      name: 'Hozana AI Assistant',
      greeting: 'Hello. I am Hozana Concept\'s AI assistant.',
      intro: 'I can guide you through our 6 areas, our plans, or prepare a free audit appointment.'
    }
  }
};

const PAGE_TEXT_EN = {
  'IA & Marketing Digital': 'AI & Digital Marketing',
  'Gagnez du temps et boostez vos revenus avec': 'Save time and increase your revenue with',
  'l\'intelligence artificielle': 'artificial intelligence',
  'Audit gratuit 30 min': 'Free 30-min audit',
  'Nos solutions IA': 'Our AI solutions',
  'Make et n8n': 'Make and n8n',
  'ChatGPT, Claude, Mistral, Make et n8n': 'ChatGPT, Claude, Mistral, Make and n8n',
  'Nous connectons vos ventes, votre marketing et votre support à des agents IA capables de qualifier, répondre, relancer et convertir.': 'We connect your sales, marketing and support workflows to AI agents able to qualify, answer, follow up and convert.',
  'deviennent un système de croissance piloté par vos objectifs.': 'become a growth system driven by your business goals.',
  'Dashboard IA — Hozana': 'AI Dashboard — Hozana',
  'Analyse en temps réel': 'Real-time analysis',
  'Leads générés': 'Leads generated',
  'Réduction coûts': 'Cost reduction',
  'ROI moyen': 'Average ROI',
  'Économisées': 'Saved',
  'Clients': 'Clients',
  'ROI suivi': 'Tracked ROI',
  'Développement d\'Applications': 'Application Development',
  'Vos applications': 'Your applications',
  'Voir nos apps': 'View our apps',
  'Créer mon app': 'Build my app',
  'Progression du projet': 'Project progress',
  'Livré en 30j': 'Delivered in 30 days',
  'Code sécurisé': 'Secure code',
  'Consulting & Coaching Premium': 'Premium Consulting & Coaching',
  'Stratégie,': 'Strategy,',
  'Audit &': 'Audit &',
  'Transformation Digitale': 'Digital Transformation',
  'Audit gratuit': 'Free audit',
  'Notre méthode': 'Our method',
  'Pilotage stratégique': 'Strategic management',
  'Audit 360': '360 Audit',
  'Roadmap priorisée': 'Prioritized roadmap',
  'Ce que nous faisons pour vous': 'What we do for you',
  'Six pôles pour': 'Six areas to',
  'accélérer votre croissance': 'accelerate your growth',
  'Nous réunissons stratégie, création, technologie et automatisation pour construire des solutions lisibles, mesurables et adaptées à votre marché.': 'We combine strategy, creation, technology and automation to build clear, measurable solutions adapted to your market.',
  'Intelligence Artificielle': 'Artificial Intelligence',
  'Branding & Création': 'Branding & Creation',
  'Marketing Digital': 'Digital Marketing',
  'Développement Tech': 'Tech Development',
  'Agents IA, chatbots, analyse prédictive et automatisation métier.': 'AI agents, chatbots, predictive analytics and business automation.',
  'Identité visuelle, UI/UX, contenus de marque et motion design.': 'Visual identity, UI/UX, brand content and motion design.',
  'Acquisition, réseaux sociaux, campagnes ads, SEO et conversion.': 'Acquisition, social media, ad campaigns, SEO and conversion.',
  'Sites, apps web/mobile, SaaS, API et intégrations métiers.': 'Websites, web/mobile apps, SaaS, APIs and business integrations.',
  'Business & Monétisation': 'Business & Monetization',
  'Funnels, CRO, email/SMS automation et revenus récurrents.': 'Funnels, CRO, email/SMS automation and recurring revenue.',
  'Audit, stratégie IA, transformation digitale et coaching dirigeant.': 'Audit, AI strategy, digital transformation and executive coaching.',
  'Tous nos services': 'All our services',
  'Résultats mesurables': 'Measurable results',
  'Nous suivons les indicateurs qui comptent vraiment : temps gagné, acquisition, satisfaction, coût opérationnel et retour sur investissement.': 'We track the indicators that truly matter: time saved, acquisition, satisfaction, operating cost and return on investment.',
  'Suivi en continu': 'Continuously tracked',
  'ROI moyen observé': 'Average observed ROI',
  'Création de contenu': 'Content creation',
  'Portfolio & Realisations': 'Portfolio & Case Studies',
  'Voir tout le portfolio': 'View full portfolio',
  'Tout': 'All',
  'Sites Web': 'Websites',
  'Design & Branding': 'Design & Branding',
  'Reseaux Sociaux': 'Social Media',
  'Applications': 'Applications',
  'Notre méthode': 'Our method',
  'La différence concrète': 'The concrete difference',
  'Nos Offres': 'Our Plans',
  'Des packs': 'Plans',
  'clairs et évolutifs': 'clear and scalable',
  'Choisissez une base adaptée à votre niveau de maturité, puis ajoutez les options nécessaires à votre croissance.': 'Choose a foundation adapted to your maturity level, then add the options required for your growth.',
  'Comparer tous les packs': 'Compare all plans',
  'Ils nous font confiance': 'They trust us',
  'Blog & Insights': 'Blog & Insights',
  'Voir tous les articles →': 'View all articles →',
  'Tous les articles': 'All articles',
  'Passez à l\'action': 'Take action',
  '6 Pôles d\'expertise': '6 Areas of Expertise',
  'Démarrer un projet': 'Start a project',
  'Voir les packs →': 'View plans →',
  'Vue d\'ensemble': 'Overview',
  'Voir les packs': 'View plans',
  'Voir les prix': 'View pricing',
  'Prendre RDV gratuit': 'Book a free meeting',
  'Prêt à commencer ?': 'Ready to start?',
  'Notre Histoire': 'Our Story',
  'Notre Mission': 'Our Mission',
  'Notre parcours': 'Our Journey',
  'Notre Équipe': 'Our Team',
  'Nos Valeurs': 'Our Values',
  'Démarrer maintenant': 'Start now',
  'Contact': 'Contact',
  'Parlons de votre': 'Let\'s discuss your',
  'projet IA': 'AI project',
  'Audit gratuit de 30 minutes. Nos experts analyseront votre business et vous proposeront une roadmap IA personnalisée, sans engagement.': 'Free 30-minute audit. Our experts analyze your business and propose a tailored AI roadmap with no commitment.',
  'Plusieurs façons de': 'Several ways to',
  'nous joindre': 'reach us',
  'Réponse sous 24h': 'Reply within 24h',
  'Disponible 7j/7 · 9h - 21h': 'Available 7 days a week · 9am - 9pm',
  'Suivez notre actualité': 'Follow our updates',
  'Comment ça se passe ?': 'How does it work?',
  'Vous remplissez le formulaire': 'You fill out the form',
  'Décrivez votre business et vos besoins en 2 minutes.': 'Describe your business and needs in 2 minutes.',
  'On vous rappelle sous 24h': 'We call you back within 24h',
  'Un expert prend contact pour planifier votre audit.': 'An expert contacts you to schedule your audit.',
  'Audit gratuit 30 min': 'Free 30-min audit',
  'On analyse votre situation et vous propose une solution.': 'We analyze your situation and propose a solution.',
  'Demande de': 'Contact',
  'contact': 'request',
  'Tous les champs * sont obligatoires.': 'All fields marked * are required.',
  'Prénom & Nom *': 'Full name *',
  'Téléphone': 'Phone',
  'Entreprise': 'Company',
  'Service qui vous intéresse *': 'Service you are interested in *',
  'Sélectionnez un service...': 'Select a service...',
  'Création de site vitrine': 'Business website',
  'Boutique en ligne (E-commerce)': 'Online store (E-commerce)',
  'Application mobile': 'Mobile app',
  'Application web sur mesure': 'Custom web app',
  'Logo & Identité visuelle': 'Logo & visual identity',
  'Gestion réseaux sociaux': 'Social media management',
  'Visuels & posts Instagram/Facebook': 'Instagram/Facebook visuals and posts',
  'Flyers, affiches & supports print': 'Flyers, posters and print assets',
  'Automatisation des processus': 'Process automation',
  'Growth Digital & Publicité': 'Digital growth & advertising',
  'Analytics & Tableaux de bord': 'Analytics & dashboards',
  'Solution Enterprise (sur devis)': 'Enterprise solution (custom quote)',
  'Votre message *': 'Your message *',
  'J\'accepte que mes données soient utilisées pour me recontacter. Elles ne seront jamais partagées avec des tiers.': 'I agree that my data may be used to contact me. It will never be shared with third parties.',
  'Politique de confidentialité': 'Privacy policy',
  'Message envoyé !': 'Message sent!',
  'Merci pour votre demande. Un expert Hozana Concept vous contactera dans les prochaines': 'Thank you for your request. A Hozana Concept expert will contact you within the next',
  '24 heures': '24 hours',
  'pour planifier votre audit gratuit.': 'to schedule your free audit.',
  'Présence internationale': 'Global Presence',
  'Une équipe': 'A team',
  'accessible partout': 'available everywhere',
  'Nous accompagnons des clients à distance dans plusieurs marchés grâce à nos outils cloud, nos agents IA et nos workflows automatisés.': 'We support remote clients across several markets through our cloud tools, AI agents and automated workflows.',
  'Supervision cloud 24/7': '24/7 cloud monitoring',
  'Notre vision': 'Our vision',
  'Global Presence': 'Global Presence',
  'Questions fréquentes': 'Frequently Asked Questions',
  'Retour à l\'accueil': 'Back to home',
  'Envoyer ma demande': 'Send my request',
  'Packs & Tarifs': 'Plans & Pricing',
  'Mensuel': 'Monthly',
  'Annuel': 'Annual',
  'Comparatif': 'Comparison',
  'Options': 'Options',
  'FAQ': 'FAQ',
  'Première étape': 'First step',
  'Choisir ce pack': 'Choose this plan',
  'Contacter nous': 'Contact us',
  'Ajouter au panier': 'Add to cart',
  'Lire l\'article': 'Read article',
  'Newsletter': 'Newsletter',
  'S\'abonner →': 'Subscribe →',
  'Tous': 'All',
  'Court (< 5 min)': 'Short (< 5 min)',
  'Moyen (5-10 min)': 'Medium (5-10 min)',
  'Long (> 10 min)': 'Long (> 10 min)',
  'Cette semaine': 'This week',
  'Ce mois': 'This month',
  'Ce trimestre': 'This quarter',
  'Récents': 'Recent',
  'Populaires': 'Popular',
  'Lu le plus': 'Most read',
  'Table des matières': 'Table of contents',
  'Réduire': 'Collapse',
  'Afficher': 'Show',
  'Application stratégique': 'Strategic application',
  'Réserver un audit': 'Book an audit',
  'L\'auteur': 'Author',
  'Statistiques': 'Statistics',
  'Partager': 'Share',
  'Dans cet article': 'In this article',
  'Commentaires': 'Comments',
  'Laisser un commentaire': 'Leave a comment',
  'Publier le commentaire': 'Publish comment',
  'J\'aime cet article': 'I like this article',
  'Votre avis compte pour nous !': 'Your feedback matters to us!',
  'Prêt à passer à l\'action ?': 'Ready to take action?',
  'Audit gratuit de 30 min avec nos experts IA.': 'Free 30-min audit with our AI experts.',
  'Réserver →': 'Book →'
};

const PLACEHOLDER_EN = {
  'Votre nom': 'Your name',
  'votre@email.com': 'your@email.com',
  'Votre email': 'Your email',
  'Marcus Dupont': 'Marcus Johnson',
  'vous@entreprise.com': 'you@company.com',
  'Nom de votre entreprise': 'Your company name',
  'Décrivez votre business, vos défis actuels et ce que vous souhaitez automatiser ou améliorer...': 'Describe your business, current challenges and what you want to automate or improve...',
  'Partagez votre avis, posez une question...': 'Share your opinion, ask a question...',
  'Rechercher un article, une technologie, un sujet...': 'Search an article, technology, or topic...'
};

const PHRASE_TEXT_EN = {
  'Audit gratuit · Sans engagement · Résultats garantis': 'Free audit · No commitment · Guaranteed results',
  'Audit gratuit': 'Free audit',
  'Sans engagement': 'No commitment',
  'Résultats garantis': 'Guaranteed results',
  'Nos 6 pôles d\'expertise': 'Our 6 areas of expertise',
  '6 pôles d\'expertise': '6 areas of expertise',
  'Nos 6 areas of expertise': 'Our 6 areas of expertise',
  'Services IA & Digital': 'AI & Digital Services',
  'Tableau comparatif complet': 'Complete comparison table',
  'Tableau comparatif': 'Comparison table',
  'comparatif': 'comparison',
  'Fonctionnalité': 'Feature',
  'Chatbot IA': 'AI chatbot',
  'chatbot IA': 'AI chatbot',
  'chatbots IA': 'AI chatbots',
  'chatbot': 'chatbot',
  '1 chatbot IA configurable': '1 configurable AI chatbot',
  'workflows automatisés': 'automated workflows',
  'Workflows automatisés': 'Automated workflows',
  'workflow automatisé': 'automated workflow',
  'Automatisation': 'Automation',
  'automatisation': 'automation',
  'Intégration': 'Integration',
  'intégration': 'integration',
  'Integration 2 tools': '2 tool integrations',
  'outils': 'tools',
  'Rapport mensuel PDF': 'Monthly PDF report',
  'Support email sous 48h': 'Email support within 48h',
  'Support prioritaire': 'Priority support',
  'Onboarding': 'Onboarding',
  'Analytics temps réel': 'Real-time analytics',
  'temps réel': 'real-time',
  'Contenu IA': 'AI content',
  'Analyse prédictive': 'Predictive analytics',
  'Account manager dédié': 'Dedicated account manager',
  'Propriété IP': 'IP ownership',
  'Voir le détail du pack': 'View plan details',
  'Choisir ce pack': 'Choose this plan',
  'Contactez-nous': 'Contact us',
  'Contacter nous': 'Contact us',
  'par mois': 'per month',
  'par an': 'per year',
  'meilleur pour le debut de votre entreprise': 'best for starting your business',
  'une offre spéciale pour les moyennes entreprises': 'a special offer for medium-sized businesses',
  'une offre qui s\'adapte a vos besoins': 'an offer tailored to your needs',
  'Pour les PME et startups en croissance qui veulent accélérer sérieusement.': 'For growing SMEs and startups that want to accelerate seriously.',
  'Transformation IA complète pour entreprises ambitieuses': 'Complete AI transformation for ambitious companies',
  'Solution IA personnalisée': 'Custom AI solution',
  'Ajout d un chatbot IA avancé supplémentaire à votre solution existante.': 'Add an advanced AI chatbot to your existing solution.',
  'Développement': 'Development',
  'développement': 'development',
  'Croissance': 'Growth',
  'croissance': 'growth',
  'Stratégie': 'Strategy',
  'stratégie': 'strategy',
  'Entreprise': 'Company',
  'entreprise': 'company',
  'Votre entreprise': 'Your company',
  'Votre message': 'Your message',
  'Votre email': 'Your email',
  'Votre nom': 'Your name',
  'Nom': 'Name',
  'Email': 'Email',
  'Téléphone': 'Phone',
  'Service souhaité': 'Desired service',
  'Budget estimé': 'Estimated budget',
  'Envoyer': 'Send',
  'Envoi en cours...': 'Sending...',
  'Demander un audit': 'Request an audit',
  'Prendre rendez-vous': 'Book an appointment',
  'Prendre RDV': 'Book a call',
  'Questions fréquentes': 'Frequently Asked Questions',
  'Parlons de votre projet IA': 'Let\'s discuss your AI project',
  'Plusieurs façons de nous joindre': 'Several ways to reach us',
  'Demande de contact': 'Contact request',
  'Sites Web & Applications': 'Websites & Applications',
  'Design & Réseaux Sociaux': 'Design & Social Media',
  'IA & Automatisation': 'AI & Automation',
  'Audit gratuit seulement': 'Free audit only',
  'Pas encore convaincu ? Voici les réponses aux questions que nos clients posent le plus souvent avant de démarrer.': 'Still unsure? Here are the answers to the questions our clients ask most often before getting started.',
  'Notre Histoire': 'Our Story',
  'Notre Mission': 'Our Mission',
  'Notre Équipe': 'Our Team',
  'Nos Valeurs': 'Our Values',
  'Notre parcours': 'Our Journey',
  'Voir les réalisations': 'View work',
  'Créer mon identité': 'Create my identity',
  'Booster ma croissance': 'Boost my growth',
  'Créer mon app': 'Build my app',
  'Optimiser mes revenus': 'Optimize my revenue',
  'Créer': 'Create',
  'Voir': 'View',
  'Lire': 'Read',
  'Plus populaire': 'Most popular',
  'Recommandé': 'Recommended',
  'Inclus': 'Included',
  'Non inclus': 'Not included',
  'à partir de': 'from',
  'Sur mesure': 'Custom',
  'Gratuit': 'Free',
  'jour': 'day',
  'jours': 'days',
  'semaine': 'week',
  'mois': 'month',
  'année': 'year'
};

function getSiteLanguage() {
  if (SUPPORTED_LANGS.includes(window.__FORCE_LANG__)) return window.__FORCE_LANG__;
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED_LANGS.includes(urlLang)) {
    localStorage.setItem('hozana-lang', urlLang);
    return urlLang;
  }
  const saved = localStorage.getItem('hozana-lang');
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  const browser = (navigator.language || '').toLowerCase();
  return browser.startsWith('en') ? 'en' : 'fr';
}

function t(key, fallback = '') {
  const lang = getSiteLanguage();
  return key.split('.').reduce((obj, part) => obj && obj[part], I18N[lang]) || fallback || key;
}

function renderLanguageSwitch(scope = 'desktop') {
  const lang = getSiteLanguage();
  return `
    <div class="language-switch language-switch-${scope}" role="group" aria-label="Language selector">
      <button type="button" class="lang-btn ${lang === 'fr' ? 'active' : ''}" onclick="setSiteLanguage('fr')" aria-pressed="${lang === 'fr'}">FR</button>
      <button type="button" class="lang-btn ${lang === 'en' ? 'active' : ''}" onclick="setSiteLanguage('en')" aria-pressed="${lang === 'en'}">EN</button>
    </div>`;
}

function applyLanguageAttributes() {
  const lang = getSiteLanguage();
  document.documentElement.setAttribute('lang', lang);
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : 'fr_FR');
}

function _preserveWhitespace(original, replacement) {
  const lead = original.match(/^\s*/)?.[0] || '';
  const trail = original.match(/\s*$/)?.[0] || '';
  return `${lead}${replacement}${trail}`;
}

function translateStaticPageText() {
  const lang = getSiteLanguage();
  applyLanguageAttributes();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'), el.textContent);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'), el.getAttribute('placeholder') || ''));
  });

  const textMap = lang === 'en' ? PAGE_TEXT_EN : null;
  const placeholderMap = lang === 'en' ? PLACEHOLDER_EN : null;

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    const original = el.getAttribute('data-i18n-original-placeholder') || el.getAttribute('placeholder') || '';
    if (!el.hasAttribute('data-i18n-original-placeholder')) el.setAttribute('data-i18n-original-placeholder', original);
    el.setAttribute('placeholder', placeholderMap?.[original] || original);
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.language-switch')) return NodeFilter.FILTER_REJECT;
      const value = node.nodeValue.trim();
      if (!value || value.length > 220) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!node.__hozanaOriginalText) node.__hozanaOriginalText = node.nodeValue;
    const original = node.__hozanaOriginalText.trim();
    let translated = textMap?.[original] || original;
    if (lang === 'en') {
      Object.entries(PHRASE_TEXT_EN)
        .sort((a, b) => b[0].length - a[0].length)
        .forEach(([from, to]) => { translated = translated.replaceAll(from, to); });
    }
    node.nodeValue = _preserveWhitespace(node.__hozanaOriginalText, translated);
  });
}

let _i18nObserverStarted = false;
let _i18nObserverTimer = null;

function initI18nObserver() {
  if (_i18nObserverStarted || !document.body) return;
  _i18nObserverStarted = true;
  const observer = new MutationObserver((mutations) => {
    if (getSiteLanguage() !== 'en') return;
    if (!mutations.some(m => m.addedNodes && m.addedNodes.length)) return;
    clearTimeout(_i18nObserverTimer);
    _i18nObserverTimer = setTimeout(translateStaticPageText, 120);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function setSiteLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem('hozana-lang', lang);
  if (window.__FORCE_LANG__ && window.__FORCE_LANG__ !== lang) {
    const targetPath = lang === 'en'
      ? `/en${window.location.pathname.replace(/^\/en(?=\/|$)/, '')}`
      : window.location.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
    const params = new URLSearchParams(window.location.search);
    params.delete('lang');
    const query = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `${targetPath}${query}${window.location.hash}`;
    return;
  }
  if (!window.__FORCE_LANG__ && lang === 'en') {
    const cleanPath = window.location.pathname.replace(/^\/en(?=\/|$)/, '');
    const params = new URLSearchParams(window.location.search);
    params.delete('lang');
    const query = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `/en${cleanPath}${query}${window.location.hash}`;
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url.toString());
  applyLanguageAttributes();
  renderNavbar();
  renderFooter();
  document.getElementById('chatbot')?.remove();
  renderChatbot();
  translateStaticPageText();
  window.dispatchEvent(new CustomEvent('hozana:languagechange', { detail: { lang } }));
}

window.setSiteLanguage = setSiteLanguage;

// ============================================================
// NAVBAR — effet glass uniquement sur le groupe de liens
// ============================================================
// Catégories du dropdown Services — chaque entrée a sa page dédiée
const SERVICE_CATS = [
  {
    id: 'ia',
    icon: '⚡',
    name: 'Intelligence Artificielle',
    tags: 'Automatisation IA · Chatbots · Agents IA · Analyse prédictive · Génération contenu',
    priority: true,
    href: '',
  },
  {
    id: 'branding',
    icon: '✦',
    name: 'Branding & Création',
    tags: 'Brand Identity · UI/UX Design · Motion Design · Content Studio',
    priority: false,
    href: '',
  },
  {
    id: 'marketing',
    icon: '◈',
    name: 'Marketing Digital',
    tags: 'Growth Marketing · Social Media · Ads Facebook/Google/TikTok · SEO',
    priority: false,
    href: '',
  },
  {
    id: 'dev',
    icon: '▣',
    name: 'Développement Tech',
    tags: 'Sites web · Apps web & mobile · SaaS · API & intégrations',
    priority: false,
    href: '',
  },
  {
    id: 'business',
    icon: '◉',
    name: 'Business & Monétisation',
    tags: 'Funnels · CRO · Email & SMS automation · Stratégies de revenus',
    priority: false,
    href: '',
  },
  {
    id: 'consulting',
    icon: '◆',
    name: 'Consulting Premium',
    tags: 'Audit digital · Stratégie IA · Transformation digitale · Coaching',
    priority: false,
    href: '',
  },
];

function renderNavbar() {
  applyLanguageAttributes();
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  const servicePages = ['service-ia.html','service-branding.html','service-marketing.html','service-dev.html','service-business.html','service-consulting.html'];
  const isServicesActive = currentPage === 'platform' || servicePages.includes(currentPage);

  const simpleLinks = [
    { href: pageRoot() + 'index.html',    label: t('nav.home') },
    { href: pageRoot() + 'pricing.html',  label: t('nav.pricing') },
    { href: pageRoot() + 'blog.html',     label: t('nav.blog') },
    { href: pageRoot() + 'company.html',  label: t('nav.company') },
    { href: pageRoot() + 'contact.html',  label: t('nav.contact') },
  ];

  // Dropdown Services item — liens vers les pages dédiées
  const ddCats = SERVICE_CATS.map((c, i) => `
    <a class="dd-cat" href="${pageRoot()}${servicePages[i]}" onclick="closeMobileMenu()">
      <div class="dd-cat-icon">${c.icon}</div>
      <div class="dd-cat-body">
        <div class="dd-cat-name">
          ${t(`services.${c.id}.name`, c.name)}
          ${c.priority ? `<span class="dd-priority">${t('nav.core')}</span>` : ''}
        </div>
        <div class="dd-cat-tags">${t(`services.${c.id}.tags`, c.tags)}</div>
      </div>
    </a>`).join('');

  const servicesDropdown = `
    <li class="nav-dropdown-wrap" id="nav-services-wrap">
      <span class="nav-dropdown-trigger ${isServicesActive ? 'active' : ''}" id="nav-services-trigger" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
        ${t('nav.services')} <i class="fas fa-chevron-down dd-chevron"></i>
      </span>
      <div class="nav-dropdown-panel" id="nav-services-panel" role="menu">
        <div class="dd-header">
          <span class="dd-header-title">${t('nav.expertise')}</span>
          <a class="dd-header-cta" href="${pageRoot()}platform.html">${t('nav.all')} <i class="fas fa-arrow-right"></i></a>
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
    `<a href="${pageRoot()}${servicePages[i]}" onclick="closeMobileMenu()">${c.icon} ${t(`services.${c.id}.name`, c.name)}</a>`
  ).join('');

  const mobileItems = [
    `<li><a href="${pageRoot()}index.html" ${currentPage==='index'||currentPage===''?'class="active"':''} onclick="closeMobileMenu()">${t('nav.home')}</a></li>`,
    `<li>
      <div class="mobile-dd-toggle" onclick="toggleMobileServicesDd(this)">
        <span class="${isServicesActive ? 'active' : ''}">${t('nav.services')}</span>
        <i class="fas fa-chevron-down mobile-dd-chevron"></i>
      </div>
      <div class="mobile-dd-list" id="mobile-services-list">${mobileDdItems}</div>
    </li>`,
    ...simpleLinks.slice(1).map(l => {
      const active = currentPage === l.href.split('/').pop() || (currentPage === '' && l.href.endsWith('index.html')) ? 'class="active"' : '';
      return `<li><a href="${l.href}" ${active} onclick="closeMobileMenu()">${l.label}</a></li>`;
    })
  ].join('');

  const html = `
  <nav class="navbar" id="navbar" role="navigation" aria-label="${t('nav.mainNav')}">
    <div class="navbar-container">

      <!-- Logo -->
      <a href="${pageRoot()}index.html" class="navbar-logo" aria-label="Hozana Concept - ${t('nav.home')}">
        <img src="${root()}images/logo-main.png" alt="Hozana Concept" class="navbar-logo-img">
      </a>

      <!-- Nav links pill glass -->
      <div class="navbar-links-glass" aria-label="${t('nav.mainMenu')}">
        <ul class="navbar-nav" id="navbar-nav">
          ${navItems.join('')}
        </ul>
      </div>

      <!-- Actions -->
      <div class="navbar-actions">
        ${renderLanguageSwitch('desktop')}
        <button class="theme-toggle" id="theme-toggle" title="${t('nav.theme')}" aria-label="${t('nav.theme')}">
          <div class="theme-toggle-track">
            <div class="theme-toggle-thumb" id="theme-thumb">🌙</div>
          </div>
        </button>
        <a href="${pageRoot()}demo.html" class="btn btn-primary btn-sm navbar-cta" aria-label="${t('nav.startProject')}">${t('nav.start')}</a>
        <button class="hamburger" id="hamburger" aria-label="${t('nav.openMenu')}" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <div class="mobile-overlay" id="mobile-overlay" onclick="closeMobileMenu()" aria-hidden="true"></div>

  <!-- Mobile Menu Panel -->
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="${t('nav.mainMenu')}" aria-hidden="true">
    <div class="mobile-menu-header">
      <img src="${root()}images/logo-main.png" alt="Hozana Concept" class="mobile-menu-logo">
      <button class="mobile-close" onclick="closeMobileMenu()" aria-label="${t('nav.closeMenu')}">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <ul class="mobile-nav-list">
      ${mobileItems}
    </ul>
    <div class="mobile-menu-footer">
      ${renderLanguageSwitch('mobile')}
      <a href="${pageRoot()}demo.html" class="btn btn-primary w-full mobile-menu-cta" onclick="closeMobileMenu()">
        <i class="fas fa-play"></i> ${t('nav.startProject')}
      </a>
      <div class="mobile-contact-info">
        <a href="mailto:${siteSetting('email')}" data-site-link="email"><i class="fas fa-envelope"></i> <span data-site-field="email">${siteSetting('email')}</span></a>
        <a href="${whatsappUrl()}" data-site-link="phone"><i class="fab fa-whatsapp"></i> <span data-site-field="phone">${siteSetting('phone')}</span></a>
      </div>
    </div>
  </div>`;

  const target = document.getElementById('navbar-placeholder');
  if (target) target.innerHTML = html;
  applySiteSettings();
  loadSiteSettings();

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
  applyLanguageAttributes();
  const year = new Date().getFullYear();
  const html = `
  <footer class="footer-premium" id="site-footer">

    <!-- Main grid -->
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid-premium">

          <!-- Brand Column -->
          <div class="footer-brand-col reveal">
            <a href="${pageRoot()}index.html" class="footer-logo-link" aria-label="Hozana Concept">
              <img src="${root()}images/logo-footer.png" alt="Hozana Concept" class="footer-logo-img">
            </a>
            <p class="footer-brand-desc">
              ${t('footer.desc')}
            </p>
            <div class="footer-social">
              <a href="${siteSetting('linkedin_url')}" class="social-link" title="Réseau professionnel LinkedIn" aria-label="LinkedIn" data-site-social="linkedin"><i class="fab fa-linkedin-in"></i></a>
              <a href="${siteSetting('twitter_url')}" class="social-link" title="Réseau social Twitter/X" aria-label="Twitter" data-site-social="twitter"><i class="fab fa-twitter"></i></a>
              <a href="${siteSetting('facebook_url')}" class="social-link" title="Réseau social Facebook" aria-label="Facebook" data-site-social="facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="${siteSetting('instagram_url')}" class="social-link" title="Réseau social Instagram" aria-label="Instagram" data-site-social="instagram"><i class="fab fa-instagram"></i></a>
              <a href="${siteSetting('youtube_url')}" class="social-link" title="Plateforme vidéo YouTube" aria-label="YouTube" data-site-social="youtube"><i class="fab fa-youtube"></i></a>
              <a href="${siteSetting('tiktok_url')}" class="social-link" title="Réseau social TikTok" aria-label="TikTok" data-site-social="tiktok"><i class="fab fa-tiktok"></i></a>
            </div>
            <!-- Badges trust -->
            <div class="footer-trust-badges">
              <div class="trust-badge"><i class="fas fa-shield-alt"></i> ${t('footer.gdpr')}</div>
              <div class="trust-badge"><i class="fas fa-award"></i> ${t('footer.aiCertified')}</div>
            </div>
          </div>

          <!-- Services Column -->
          <div class="footer-links-col reveal delay-1">
            <h4 class="footer-col-title">
              <i class="fas fa-bolt footer-col-icon"></i>
              ${t('footer.platform')}
            </h4>
            <ul class="footer-link-list">
              <li><a href="${pageRoot()}platform.html#ia">${t('services.ia.name')}</a></li>
              <li><a href="${pageRoot()}platform.html#branding">${t('services.branding.name')}</a></li>
              <li><a href="${pageRoot()}platform.html#marketing">${t('services.marketing.name')}</a></li>
              <li><a href="${pageRoot()}platform.html#dev">${t('services.dev.name')}</a></li>
              <li><a href="${pageRoot()}platform.html#business">${t('services.business.name')}</a></li>
              <li><a href="${pageRoot()}platform.html#consulting">${t('services.consulting.name')}</a></li>
            </ul>
          </div>

          <!-- Ressources Column -->
          <div class="footer-links-col reveal delay-2">
            <h4 class="footer-col-title">
              <i class="fas fa-compass footer-col-icon"></i>
              ${t('footer.resources')}
            </h4>
            <ul class="footer-link-list">
              <li><a href="${pageRoot()}blog.html">${t('footer.blog')}</a></li>
              <li><a href="${pageRoot()}pricing.html">${t('footer.plans')}</a></li>
              <li><a href="${pageRoot()}company.html">${t('footer.vision')}</a></li>
              <li><a href="${pageRoot()}contact.html">${t('nav.contact')}</a></li>
              <li><a href="${pageRoot()}pricing.html#enterprise">${t('footer.enterpriseDemo')}</a></li>
            </ul>
          </div>

          <!-- Contact + Legal Column -->
          <div class="footer-links-col reveal delay-3">
            <h4 class="footer-col-title">
              <i class="fas fa-headset footer-col-icon"></i>
              Contact
            </h4>
            <ul class="footer-contact-list">
              <li>
                <a href="mailto:${siteSetting('email')}" data-site-link="email">
                  <span class="contact-icon"><i class="fas fa-envelope"></i></span>
                  <span data-site-field="email">${siteSetting('email')}</span>
                </a>
              </li>
              <li>
                <a href="${whatsappUrl()}" target="_blank" rel="noopener" data-site-link="phone">
                  <span class="contact-icon"><i class="fab fa-whatsapp"></i></span>
                  <span data-site-field="phone">${siteSetting('phone')}</span>
                </a>
              </li>
              <li>
                <span class="contact-icon"><i class="fas fa-map-marker-alt"></i></span>
                <span data-site-field="address">${siteSetting('address')}</span>
              </li>
            </ul>

            <h4 class="footer-col-title footer-col-title-spaced">
              <i class="fas fa-balance-scale footer-col-icon"></i>
              ${t('footer.legal')}
            </h4>
            <ul class="footer-link-list">
              <li><a href="${pageRoot()}privacy.html">${t('footer.privacy')}</a></li>
              <li><a href="${pageRoot()}legal.html">${t('footer.legalNotice')}</a></li>
              <li><a href="${pageRoot()}terms.html">${t('footer.terms')}</a></li>
              <li><a href="${pageRoot()}refund.html">${t('footer.refund')}</a></li>
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
            <h3>${t('footer.newsletterTitle')}</h3>
            <p>${t('footer.newsletterText')}</p>
          </div>
          <form class="newsletter-strip-form" onsubmit="footerSubscribe(event)">
            <input type="email" placeholder="${t('footer.email')}" required aria-label="${t('footer.email')}">
            <button type="submit" class="btn btn-primary btn-sm">${t('footer.subscribe')}</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom-bar">
      <div class="container">
        <div class="footer-bottom-inner">
          <p class="footer-copyright">
            © ${year} <strong>Hozana Concept</strong>. ${t('footer.rights')}
          </p>
          <div class="footer-bottom-links">
            <a href="${pageRoot()}privacy.html">${t('footer.privacyShort')}</a>
            <span class="sep">·</span>
            <a href="${pageRoot()}legal.html">${t('footer.legalNotice')}</a>
            <span class="sep">·</span>
            <a href="${pageRoot()}terms.html">${t('footer.terms')}</a>
            <span class="sep">·</span>
            <a href="${pageRoot()}refund.html">${t('footer.refund')}</a>
          </div>
          <div class="footer-status">
            <span class="status-indicator online"></span>
            <span>${t('footer.operational')}</span>
          </div>
        </div>
      </div>
    </div>
  </footer>`;

  const target = document.getElementById('footer-placeholder');
  if (target) {
    target.innerHTML = html;
    applySiteSettings();
    loadSiteSettings();
  }
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
  const isEn = getSiteLanguage() === 'en';
  const status = isEn ? 'Advice, qualification & appointments' : 'Conseil, qualification & rendez-vous';
  const intro = isEn
    ? 'I can guide you through our 6 areas, recommend a plan, qualify your need or prepare a free audit appointment.'
    : 'Je peux vous orienter sur nos 6 pôles, recommander un pack, qualifier votre besoin ou préparer un rendez-vous d\'audit gratuit.';
  const suggestions = isEn
    ? [
        ['Tell me about your 6 business areas', '6 areas'],
        ['Which plan do you recommend?', 'Choose a plan'],
        ['I want to book a free audit appointment', 'Book a call']
      ]
    : [
        ['Présentez-moi vos 6 pôles d\'activité', '6 pôles'],
        ['Quel pack me recommandez-vous ?', 'Choisir un pack'],
        ['Je veux prendre rendez-vous pour un audit gratuit', 'Prendre RDV']
      ];
  const html = `
  <div class="chatbot-container" id="chatbot" role="complementary" aria-label="${t('chatbot.toggle')}">
    <button class="chatbot-toggle" id="chatbot-toggle" title="${t('chatbot.toggle')}" aria-expanded="false">
      <span class="chatbot-icon-open"><i class="fas fa-robot"></i></span>
      <span class="chatbot-icon-close" style="display:none;"><i class="fas fa-times"></i></span>
      <div class="chatbot-pulse"></div>
      <div class="chatbot-notification" id="chatbot-notif">1</div>
    </button>
    <div class="chatbot-window glass-heavy" id="chatbot-window" role="dialog" aria-label="${t('chatbot.toggle')}" aria-hidden="true">
      <div class="chatbot-header">
        <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
        <div>
          <div class="chatbot-name">${t('chatbot.name')}</div>
          <div class="chatbot-status"><span class="status-dot"></span> ${status}</div>
        </div>
        <button class="chatbot-close" id="chatbot-close" aria-label="${isEn ? 'Close chat' : 'Fermer le chat'}"><i class="fas fa-times"></i></button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-message bot">
          <div class="chat-bubble">
            ${t('chatbot.greeting')}<br><br>
            ${intro}
          </div>
          <div class="chat-suggestions">
            ${suggestions.map(([msg, label]) => `<button class="chat-suggestion" data-msg="${msg}">${label}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="${isEn ? 'Your message...' : 'Votre message...'}" aria-label="${isEn ? 'Message for the AI assistant' : 'Message pour l assistant IA'}" />
        <button class="chatbot-send" id="chatbot-send" aria-label="${isEn ? 'Send' : 'Envoyer'}"><i class="fas fa-paper-plane"></i></button>
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
  a.href = `${whatsappUrl()}?text=Bonjour%20Hozana%20Concept%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20services.`;
  a.className = 'whatsapp-btn';
  a.setAttribute('data-site-link', 'phone');
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
  applyLanguageAttributes();
  renderCursor();
  renderNavbar();
  renderFooter();
  renderCookiePopup();
  renderChatbot();
  renderWhatsApp();
  translateStaticPageText();
  initI18nObserver();
  setTimeout(translateStaticPageText, 600);
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
