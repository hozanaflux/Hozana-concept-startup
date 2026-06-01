/* ============================================================
   HOZANA CONCEPT - Blog Deployment Script
   Automates the static blog generation process
   ============================================================ */

'use strict';

const path = require('path');
const { execSync } = require('child_process');

const GENERATOR_PATH = path.join(__dirname, '..', 'js', 'generate-static-blog.js');
const RELATIVE_PATH = './js/generate-static-blog.js';

function deployBlog() {
  console.log('═══ Hozana Concept — Blog Deployment ═══\n');

  try {
    // 1. Run the static generator (fetches from Supabase, generates HTML + sitemap)
    console.log('Step 1: Generating static blog pages from Supabase...');
    execSync(`node ${RELATIVE_PATH}`, { stdio: 'inherit' });

    console.log('\n✅ Blog deployment complete!');
    console.log('📁 Static pages ready in /blog-posts/');
    console.log('🗺️  Sitemap updated at /sitemap.xml');
    console.log('\n📌 Note: The blog listing page loads articles dynamically from Supabase via JS.');
    console.log('📌 The generated static pages are available at /blog-posts/{slug}');
  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

deployBlog();
