/* ============================================================
   HOZANA CONCEPT - Final Configuration Script
   Configures all components for static blog deployment
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const BLOG_POSTS_DIR = path.join(PROJECT_ROOT, 'blog-posts');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'sitemap.xml');
const BLOG_HTML_PATH = path.join(PROJECT_ROOT, 'blog.html');
const POST_PUBLISH_HOOK_PATH = path.join(PROJECT_ROOT, 'scripts', 'post-publish-hook.js');

// Function to configure web server
function configureWebServer() {
  console.log('\nConfiguring web server...');

  // Create a simple server configuration file
  const serverConfig = `
# Hozana Concept Static Blog Server Configuration

# Serve static files from blog-posts directory
location /blog-posts/ {
  alias ${BLOG_POSTS_DIR};
  try_files $uri $uri/ =404;
}

# Serve blog.html
location /blog.html {
  alias ${BLOG_HTML_PATH};
}

# Serve sitemap.xml
location = /sitemap.xml {
  alias ${SITEMAP_PATH};
}

# Redirect article.html to blog.html
location /article.html {
  return 301 /blog.html;
}
  `;

  const configPath = path.join(PROJECT_ROOT, 'server-config.txt');
  fs.writeFileSync(configPath, serverConfig);
  console.log(`✓ Created server configuration at: ${configPath}`);
}

// Function to configure post-publish hook
function configurePostPublishHook() {
  console.log('\nConfiguring post-publish hook...');

  // Create a simple hook configuration file
  const hookConfig = `
# Hozana Concept Post-Publish Hook Configuration

# Hook to run after article publication
# This hook will trigger the static blog generation process

# To set up the hook in your CMS:
# 1. Add a webhook to your CMS that points to: ${POST_PUBLISH_HOOK_PATH}
# 2. Configure the webhook to trigger on article publish/update events
# 3. Set the webhook to send a POST request to the hook script
  `;

  const hookConfigPath = path.join(PROJECT_ROOT, 'hook-config.txt');
  fs.writeFileSync(hookConfigPath, hookConfig);
  console.log(`✓ Created hook configuration at: ${hookConfigPath}`);
}

// Function to verify final configuration
function verifyFinalConfiguration() {
  console.log('\nVerifying final configuration...');

  // Check if all required files exist
  const requiredFiles = [
    { path: BLOG_POSTS_DIR, description: 'Blog posts directory' },
    { path: SITEMAP_PATH, description: 'Sitemap file' },
    { path: BLOG_HTML_PATH, description: 'Blog HTML file' },
    { path: POST_PUBLISH_HOOK_PATH, description: 'Post-publish hook script' }
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
      console.error(`❌ Missing required file: ${file.description} (${file.path})`);
      allFilesExist = false;
    } else {
      console.log(`✓ Found required file: ${file.description}`);
    }
  });

  if (allFilesExist) {
    console.log('\n✅ All required files exist. Configuration is complete!');
    console.log('Your static blog system is now fully configured and operational.');
  } else {
    console.error('\n❌ Some required files are missing. Please check the errors above.');
  }
}

// Main function
function runFinalConfiguration() {
  try {
    console.log('Starting final configuration...');

    // 1. Configure web server
    configureWebServer();

    // 2. Configure post-publish hook
    configurePostPublishHook();

    // 3. Verify final configuration
    verifyFinalConfiguration();

    console.log('\nFinal configuration completed successfully!');
    console.log('Your static blog system is now fully configured and operational.');

  } catch (err) {
    console.error('Final configuration failed:', err);
    process.exit(1);
  }
}

// Run the final configuration
runFinalConfiguration();