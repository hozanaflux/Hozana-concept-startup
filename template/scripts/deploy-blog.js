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
const BLOG_HTML_PATH = path.join(__dirname, '../blog.html');
const GENERATE_SCRIPT = path.join(__dirname, '../js/generate-static-blog.js');
const PROJECT_ROOT = path.join(__dirname, '..');
const SCRIPT_PATH = path.join(PROJECT_ROOT, 'js', 'generate-static-blog.js');
const FULL_SCRIPT_PATH = path.resolve(PROJECT_ROOT, 'js', 'generate-static-blog.js');
const RELATIVE_SCRIPT_PATH = './js/generate-static-blog.js';
const TEST_ARTICLE_SLUG = 'test-article';

// Function to update blog.html with static links
function updateBlogHtml() {
  try {
    // Read the current blog.html
    let content = fs.readFileSync(BLOG_HTML_PATH, 'utf8');

    // Find all article links and replace with static versions
    content = content.replace(
      /<a\s+href="article\.html\?id=(\d+)"/g,
      (match, id) => {
        // In a real implementation, you would map the ID to the slug
        // For this example, we'll use a simple pattern
        const slug = `article-${id}`;
        return `<a href="blog-posts/${slug}.html"`;
      }
    );

    // Add test article link if it exists
    if (fs.existsSync(path.join(BLOG_POSTS_DIR, `${TEST_ARTICLE_SLUG}.html`))) {
      const testLink = `<a href="blog-posts/${TEST_ARTICLE_SLUG}.html">Test Article</a>`;
      if (!content.includes(testLink)) {
        content = content.replace(
          /<\/body>/,
          `${testLink}\n</body>`
        );
      }
    }

    // Write the updated file
    fs.writeFileSync(BLOG_HTML_PATH, content);
    console.log('Updated blog.html with static links');
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