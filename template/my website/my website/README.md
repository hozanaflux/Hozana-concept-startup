# Hozana Concept — Site Web Agence IA & Digital

**Agence de création web, design graphique, intelligence artificielle et croissance digitale.**

---

## 🗂️ Pages et fichiers

| Fichier | Description |
|---------|-------------|
| `index.html` | Page d'accueil principale |
| `services.html` | Vue d'ensemble des 6 pôles + sections détaillées |
| `service-ia.html` | **Page dédiée** — Intelligence Artificielle |
| `service-branding.html` | **Page dédiée** — Branding & Création |
| `service-marketing.html` | **Page dédiée** — Marketing Digital |
| `service-dev.html` | **Page dédiée** — Développement Tech |
| `service-business.html` | **Page dédiée** — Business & Monétisation |
| `service-consulting.html` | **Page dédiée** — Consulting Premium |
| `packs.html` | Tarifs et packs mensuels |
| `pack-detail.html` | Page paiement pack (wizard 4 étapes) |
| `portfolio.html` | Galerie portfolio complète (masonry + lightbox) |
| `blog.html` | Blog avec recherche et filtres avancés |
| `article.html` | Page article individuel |
| `about.html` | Page À propos |
| `contact.html` | Formulaire contact + FAQ + carte Maps |
| `privacy.html` | Politique de confidentialité |
| `legal.html` | Mentions légales |
| `admin.html` | Dashboard d'administration |
| `css/design-system.css` | Variables CSS, tokens, composants de base |
| `css/components.css` | Composants spécifiques (navbar, footer, hero…) |
| `js/core.js` | Utilitaires globaux (animations, cursor, scroll…) |
| `js/components.js` | Navbar, footer, chatbot, WhatsApp, cookie popup |

---

## ✅ Fonctionnalités complètes

### 🏠 Page d'accueil (index.html)
- **Hero slider automatique** — 3 slides avec **staggered animations en boucle** : chaque élément du slide entre avec un décalage progressif puis continue à flotter en boucle avec sa propre animation individuelle (5 keyframes différents, délais décalés). Différences visuelles marquées par slide :
  - **Slide 1 : IA & Marketing** — accent rouge vif, texte gauche, orbe bas-gauche, entrée `s1FadeUp` (bas → haut)
  - **Slide 2 : Développement Apps** — accent orange, layout **inversé** (visuel gauche, texte droite), orbe haut-droite, entrée `s2FadeLeft` (droite → gauche)
  - **Slide 3 : Consulting Premium** — palette blanc lumineux, centré 1 colonne, grille fine "blueprint", croix centrale, coins lumineux bicolores, entrée `s3Scale` (scale depuis centre)
  - Titres `clamp()` pour taille maîtrisée sur tous les écrans (max 2.875rem)
  - Navigation par points, flèches (masquées mobile), swipe tactile, barre de progression
  - Pause au survol — Visuals cachés en dessous de 1024px pour une lecture claire
- **Trust strip** — 5 chiffres clés (50+ clients, 300% ROI, 30j, 24/7, 98%) juste après le hero
- **Grille 4 services** claire et non-technique (2 colonnes, 1 sur mobile) :
  - IA & Automatisation (ChatGPT, Make, n8n)
  - Développement Apps (Mobile iOS/Android, Web, Windows)
  - Design & Réseaux Sociaux (Logo, posts, stories, flyers)
  - Formation & Coaching (formations IA, coaching individuel, ateliers)
- **Graphiques statistiques animés** (section `#stats-animees`) :
  - KPI band avec compteurs animés (50+ clients, 300% ROI, 40% coûts, 247h/mois)
  - Chart.js : Courbe croissance CA (avant/après Hozana)
  - Barres de progression animées (heures économisées par tâche)
  - Radial SVG animés (satisfaction, recommandation, délais, renouvellement)
  - Chart.js : Bar chart engagement réseaux sociaux
  - Sparkline ROI mensuel
- **Galerie Portfolio Preview** — grille 3 colonnes avec filtre par catégorie
- Sections : Processus, Avant/Après, Packs, Témoignages, Blog Preview, CTA Final

### 🖼️ Portfolio (portfolio.html) — NOUVEAU
- **Hero** avec stats : 50+ projets, 30j délai, 98% satisfaction, ×4 ROI
- **Filtre sticky** (navigation collante) : Tout, Sites Web, Design & Branding, Réseaux Sociaux, Applications, IA & Dashboards
- **Grille masonry** (18 projets affichés) — colonnes dynamiques responsive
- **Lightbox** pour chaque projet avec : image HD, catégorie, description complète, KPIs, tags, CTAs
- 18 projets avec photos réelles Unsplash et données crédibles
- Fermeture lightbox : clic extérieur ou touche Escape

### 📞 Contact (contact.html) — AMÉLIORÉ
- Formulaire enrichi avec **groupes de services** : Sites Web, Design, IA, Packs
- **Carte OpenStreetMap** (vue Paris) avec overlay d'infos de contact
- **FAQ accordion** — 9 questions fréquentes avec réponses complètes :
  - Prix et budgets
  - Délais de livraison
  - Accessibilité pour non-techniques
  - Réseaux sociaux et visuels
  - Explication de l'IA en langage simple
  - Paiement et modalités
  - Résultats et suivi
  - Travail à distance / international
  - Par où commencer
- CTA WhatsApp et Email après la FAQ

### 🤖 Chatbot IA
- Chatbot flottant (bottom-right)
- Réponses sur : services, packs, contact, IA, audit gratuit
- Capture email automatique pour leads

### 📝 Blog (blog.html)
- Fetch depuis `tables/blog_posts` (jusqu'à 100 articles)
- Filtrage par catégorie (IA, Automatisation, Croissance, Stratégie, Technologie)
- Tri par plus récent / plus populaire
- Recherche avec debounce 280ms + bouton clear
- Filtres avancés (temps de lecture, période, sort)
- Pagination 6 articles/page
- Sidebar : articles populaires, nuage de tags, newsletter, CTA audit

### 💳 Pack Detail (pack-detail.html)
- Wizard 4 étapes : Détails pack → Infos client → Paiement → Confirmation
- Sélection dynamique via `?pack=starter|growth|elite|enterprise`
- Onglets : Fonctionnalités / Timeline / Résultats
- Formulaire paiement avec formatage carte live, SEPA, PayPal
- Codes promo : `HOZANA20` (-20%), `HOZANA30` (-30%), `LAUNCH50` (-50%)
- Sidebar sticky avec récapitulatif
- Tables DB : `orders`, `leads`

### 🔧 Admin (admin.html)
- Panels : Dashboard, Analytics, Articles, Commentaires, Leads, Commandes, Services, Packs, Paramètres
- Graphiques Chart.js : vues articles, leads par source
- CRUD articles (création/édition/suppression)
- Gestion leads avec statuts (new → contacted → qualified → converted)
- KPIs : leads, articles publiés, vues, commentaires, commandes payées, revenus

---

## 🗃️ Tables de données (RESTful API)

| Table | Usage |
|-------|-------|
| `blog_posts` | Articles du blog |
| `comments` | Commentaires articles |
| `leads` | Leads contacts et newsletter |
| `page_views` | Tracking analytics visiteurs |
| `orders` | Commandes packs |

---

## 🛣️ URLs et paramètres

| URL | Description |
|-----|-------------|
| `index.html` | Page d'accueil |
| `portfolio.html` | Galerie portfolio |
| `services.html` | Services |
| `packs.html` | Tarifs |
| `pack-detail.html?pack=starter` | Détail pack Starter |
| `pack-detail.html?pack=growth` | Détail pack Growth |
| `pack-detail.html?pack=elite` | Détail pack Elite |
| `blog.html` | Blog |
| `article.html?id={id}` | Article individuel |
| `contact.html` | Contact |
| `contact.html?pack=growth` | Contact pré-sélection pack |
| `admin.html` | Dashboard admin |

---

## 🔧 Technologies utilisées

- HTML5 sémantique + CSS3 (variables custom, grid, flexbox)
- JavaScript ES6+ vanilla (aucun framework)
- Chart.js 4.4.0 (graphiques animés)
- Font Awesome 6.4 (icônes)
- Google Fonts (Space Grotesk, Sora, Roboto)
- OpenStreetMap (carte contact)
- RESTful Table API (données dynamiques)

---

## 🗂️ Services — 6 pôles d'expertise (services.html)

| ID ancre | Pôle | Sous-services |
|----------|------|---------------|
| `#ia` | Intelligence Artificielle ⭐ | Automatisation IA, Chatbots WhatsApp+site, Agents IA, Analyse & prédictions, Génération contenu IA |
| `#branding` | Branding & Création | Brand Identity, UI/UX Design, Motion Design, Content Studio |
| `#marketing` | Marketing Digital | Growth Marketing, Social Media, Ads (FB/Google/TikTok), SEO |
| `#dev` | Développement Tech | Sites web, Apps web & mobile, SaaS, API & intégrations |
| `#business` | Business & Monétisation | Funnels, CRO, Email & SMS automation, Stratégies de revenus |
| `#consulting` | Consulting Premium | Audit digital, Stratégie IA, Transformation digitale, Coaching |

---

## 🎯 Dernières modifications (session actuelle)

### ✅ Navbar — Dropdown Services
- Dropdown mega-menu opérationnel avec les 6 pôles d'expertise
- Badge STAR sur Intelligence Artificielle
- Navigation mobile avec dropdown accordéon
- Hover desktop + click mobile + accessibilité clavier

### ✅ services.html — Refonte complète 6 catégories
- Hero avec pills de navigation rapide vers chaque section
- Grille overview 3×2 des 6 pôles avec liens d'ancrage
- 6 sections détaillées avec layout alterné gauche/droite
- Visuels cards (métriques, flow steps, code snippet, funnel)
- CTA final avec motifs décoratifs (grid pattern, glow, anneaux, dots)

### ✅ Icônes — Uniformisation palette de marque
- Suppression des bleus (#3b82f6, #818cf8), violets (#a855f7, #c084fc), verts (#22c55e) et jaunes (#fbbf24) dans les icônes UI
- Remplacement par rouge (#FF2E2E), orange (#FF8C42) et blanc (--white-60/70)
- Pages modifiées : `index.html`, `contact.html`, `services.html`

### ✅ Sections CTA — Motifs décoratifs
- `.cta-section` (composant CSS global) enrichi avec : grille en pointillés, ligne supérieure dégradée, blob radial, anneaux de coin, grille de dots
- Ajout des éléments décoratifs dans : `about.html`, `packs.html`
- `.cta-band` (index.html) : même traitement avec grid pattern + glow blob
- Nouveaux composants CSS : `.cta-glow`, `.cta-dots`, `.cta-ring-tl`, `.cta-ring-br`

---

## 📌 À faire / Améliorations suggérées

- [ ] Ajouter vraies photos de projets dans portfolio.html
- [ ] Intégration Stripe réelle (clé API) pour pack-detail.html
- [ ] Système d'authentification pour admin.html
- [ ] Page individuelle par service (ex: `/services/ia.html`) avec contenu approfondi
- [ ] Notifications email lors d'un nouveau contact
- [ ] Version anglaise du site
- [ ] Optimisation des images (WebP, lazy-loading amélioré)
- [ ] PWA (Progressive Web App) pour installation mobile

---

*Dernière mise à jour : Avril 2026*
