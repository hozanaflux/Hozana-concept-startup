/* ============================================================
   Fix internal links — adds .html to renamed pages
   Run: node scripts/fix-links.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

// Pages that were renamed (without extension → with .html)
const renamedPages = [
  'company', 'contact', 'legal', 'pack-detail',
  'platform', 'portfolio', 'pricing', 'privacy',
  'refund', 'service-branding', 'service-business',
  'service-consulting', 'service-dev', 'service-ia',
  'service-marketing', 'terms', 'testimonial-carousel',
  'services',  // added for services page too
];

// Files to scan (HTML and JS files in root and js/)
const ROOT = path.join(__dirname, '..');
const patterns = [
  '*.html',                // Root HTML files
  'js/*.js',               // JS files
  'blog-posts/*.html',     // Generated blog posts
];

// Build regex patterns for each page
// Matches: href="pagename" or href='/pagename' (with optional / prefix)
// But NOT href="pagename.html" (already correct)
// And NOT when it's part of a URL like https://...
function fixLinks(content, filePath) {
  let modified = false;

  for (const page of renamedPages) {
    // Match href="pagename" (without .html) — handles both href="pagename" and href="/pagename"
    // Also handles with trailing quotes, spaces, or closing tags
    const regex1 = new RegExp(`href=["'](\\/?)${page}["']`, 'g');
    const newContent = content.replace(regex1, (match, slash) => {
      return `href="${slash}${page}.html"`;
    });
    if (newContent !== content) {
      modified = true;
    }
    content = newContent;
  }

  return { content, modified };
}

// Walk through files
function processDirectory(dir, relativeDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.claude' || entry.name === 'logs' || entry.name === 'admin-hozana-concept-admin' || entry.name === 'api' || entry.name === 'css' || entry.name === 'images' || entry.name === 'supabase') {
        continue;
      }
      processDirectory(fullPath, relativePath);
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.js'))) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const { content: newContent, modified } = fixLinks(content, relativePath);

        if (modified) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`✅ Fixed: ${relativePath}`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${relativePath}: ${err.message}`);
      }
    }
  }
}

console.log('═══ Fixing internal links — adding .html extensions ═══\n');
processDirectory(ROOT);
console.log('\n✅ All links fixed!');
