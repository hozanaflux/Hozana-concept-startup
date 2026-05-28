/* ============================================================
   HOZANA CONCEPT - Final Deployment Test Script
   Verifies the complete static blog generation and deployment
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BLOG_POSTS_DIR = path.join(__dirname, '../blog-posts');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');
const BLOG_HTML_PATH = path.join(__dirname, '../blog.html');
const TEST_ARTICLE_SLUG = 'test-article';
const TEST_ARTICLE_PATH = path.join(BLOG_POSTS_DIR, `${TEST_ARTICLE_SLUG}.html`);
const GENERATE_SCRIPT = path.join(__dirname, '../js/generate-static-blog.js');

// Function to create a test article
function createTestArticle() {
  try {
    console.log('Creating test article...');

    // Create a simple test article
    const testArticle = {
      id: 999,
      title: "Test Article",
      slug: TEST_ARTICLE_SLUG,
      excerpt: "This is a test article for deployment verification",
      content: "<h2>Test Content</h2><p>This is a test article to verify the static generation process.</p>",
      category: "Test",
      author: "Test Author",
      publish_date: new Date().toISOString(),
      cover_image: "test-image.jpg",
      tags: "test, verification",
      featured: false
    };

    // Save the test article to a temporary file
    const tempFile = path.join(__dirname, 'test-article.json');
    fs.writeFileSync(tempFile, JSON.stringify(testArticle));

    console.log('Test article created successfully');
    return testArticle;
  } catch (err) {
    console.error('Error creating test article:', err);
    process.exit(1);
  }
}

// Function to verify deployment
function verifyDeployment() {
  try {
    console.log('\nStarting final deployment verification...');

    // 1. Verify blog-posts directory exists
    if (!fs.existsSync(BLOG_POSTS_DIR)) {
      throw new Error('Blog posts directory does not exist');
    }
    console.log('✓ Blog posts directory exists');

    // 2. Verify sitemap exists
    if (!fs.existsSync(SITEMAP_PATH)) {
      throw new Error('Sitemap file does not exist');
    }
    console.log('✓ Sitemap file exists');

    // 3. Verify test article was generated
    if (!fs.existsSync(TEST_ARTICLE_PATH)) {
      throw new Error('Test article was not generated');
    }
    console.log('✓ Test article was generated');

    // 4. Verify blog.html was updated
    const blogHtml = fs.readFileSync(BLOG_HTML_PATH, 'utf8');
    if (!blogHtml.includes(`blog-posts/${TEST_ARTICLE_SLUG}.html`)) {
      throw new Error('Blog.html was not updated with test article link');
    }
    console.log('✓ Blog.html was updated with test article link');

    // 5. Verify sitemap contains test article
    const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
    if (!sitemap.includes(TEST_ARTICLE_SLUG)) {
      throw new Error('Sitemap does not contain test article');
    }
    console.log('✓ Sitemap contains test article');

    console.log('\n✅ All deployment verification tests passed successfully!');
    console.log('Your static blog system is now fully operational.');

  } catch (err) {
    console.error('\n❌ Deployment verification failed:', err.message);
    process.exit(1);
  }
}

// Main function
function runFinalTest() {
  try {
    // 1. Create a test article
    const testArticle = createTestArticle();

    // 2. Run the post-publish hook to generate static files
    console.log('\nRunning post-publish hook...');
    execSync('node scripts/post-publish-hook.js', { stdio: 'inherit' });

    // 3. Verify the deployment
    verifyDeployment();

    // 4. Clean up - remove test article
    if (fs.existsSync(TEST_ARTICLE_PATH)) {
      fs.unlinkSync(TEST_ARTICLE_PATH);
    }
    const tempFile = path.join(__dirname, 'test-article.json');
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    console.log('\nTest completed. Cleanup done.');

  } catch (err) {
    console.error('Final test failed:', err);
    process.exit(1);
  }
}

// Run the final test
runFinalTest();