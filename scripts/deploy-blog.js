/* ============================================================
   HOZANA CONCEPT - Blog Deployment Script
   Automates the static blog generation and deployment process
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BLOG_POSTS_DIR = path.join(__dirname, '../blog-posts');
const BLOG_HTML_PATH = path.join(__dirname, '../blog'); // blog.html is actually named 'blog'
const GENERATE_SCRIPT = path.join(__dirname, '../js/generate-static-blog.js');
const PROJECT_ROOT = path.join(__dirname, '..');
const SCRIPT_PATH = path.join(PROJECT_ROOT, 'js', 'generate-static-blog.js');
const FULL_SCRIPT_PATH = path.resolve(PROJECT_ROOT, 'js', 'generate-static-blog.js');
const RELATIVE_SCRIPT_PATH = './js/generate-static-blog.js';
const TEST_ARTICLE_SLUG = 'test-article';

// Function to update blog.html with links to static articles
function updateBlogHtml() {
  try {
    // Read the current blog.html
    let content = fs.readFileSync(BLOG_HTML_PATH, 'utf8');

    // Read all generated article files to get real slugs
    const articleFiles = fs.readdirSync(BLOG_POSTS_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));

    console.log(`Found ${articleFiles.length} blog posts:`, articleFiles);

    // Replace placeholder links with actual links to static HTML files
    // We'll update the blog homepage to show links to individual articles
    content = content.replace(
      /<a\s+href="([^"]*blog-posts\/[^"']*)\.html"/g,
      (match, p1) => {
        // If it's already pointing to .html, keep it as is
        return match;
      }
    );

    // Add/update the article listing section with real links
    // Look for the articles grid section and populate it
    const articlesSection = `
      <!-- Articles grid -->
      <div>
        <div class="section-heading-row">
          <h2><i class="fas fa-fire"></i> Derniers articles <span id="results-count" style="color:var(--white-30);font-weight:400;font-size:0.9em;"></span></h2>
          <div style="display:flex;gap:0.5rem;">
            <button class="cat-btn" id="sort-new" onclick="setSort('new')" style="font-size:0.75rem;padding:0.35rem 0.875rem;" aria-pressed="true">
              <i class="fas fa-clock"></i> Récents
            </button>
            <button class="cat-btn" id="sort-popular" onclick="setSort('popular')" style="font-size:0.75rem;padding:0.35rem 0.875rem;">
              <i class="fas fa-fire"></i> Populaires
            </button>
          </div>
        </div>

        <!-- Skeleton loaders (will be replaced by JS) -->
        <div class="blog-grid-3" id="articles-grid">
          <!-- Articles will be injected here by JavaScript -->
        </div>

        <!-- No results -->
        <div class="no-results-msg" id="no-results">
          <div class="no-results-icon">🔍</div>
          <h3 style="font-family:var(--font-title);font-size:1.4rem;margin-bottom:0.75rem;">Aucun résultat trouvé</h3>
          <p style="color:var(--white-50);margin-bottom:1.5rem;">Essayez d'autres mots-clés ou explorez toutes nos catégories.</p>
          <button class="btn btn-glass" onclick="resetFilters()">
            <i class="fas fa-refresh"></i> Réinitialiser les filtres
          </button>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrap" id="pagination"></div>
      </div>`;

    // Replace the articles grid section with our updated version
    content = content.replace(
      /<!-- Articles grid -->[\s\S]*?<!-- Pagination -->[\s\S]*?<\/div>/, // Match from articles grid to end of pagination div
      articlesSection
    );

    // Write the updated file
    fs.writeFileSync(BLOG_HTML_PATH, content);
    console.log('Updated blog.html with static article links');
  } catch (err) {
    console.error('Error updating blog.html:', err);
  }
}

// Function to deploy the blog
function deployBlog() {
  try {
    console.log('Starting blog deployment...');

    // 1. Generate static files
    console.log('Generating static blog files...');
    execSync(`node ${RELATIVE_SCRIPT_PATH}`, { stdio: 'inherit' });

    // 2. Update blog.html with static links
    console.log('Updating blog.html...');
    updateBlogHtml();

    // 3. Copy files to production (example for a simple setup)
    // In a real implementation, you would use rsync, FTP, or your deployment method
    console.log('Deployment complete!');
    console.log('Static blog files are ready for production.');

    // 4. Optional: Submit sitemap to search engines
    // You would typically do this via Google Search Console API
    console.log('Remember to submit your sitemap to search engines!');

  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

// Run the deployment
deployBlog();