/* ============================================================
   Hozana Concept — API Route: Regenerate Static Blog
   Vercel Serverless Function
   Triggered by admin panel after publishing an article
   ============================================================ */

const path = require('path');
const { execSync } = require('child_process');

const isVercelRuntime = !!process.env.VERCEL;
const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'hozanaflux/Hozana-concept-startup';
const GITHUB_DISPATCH_EVENT = process.env.GITHUB_DISPATCH_EVENT || 'generate-blog';
const { setCors, rejectBadOrigin, requireAdminWriteHeader, rateLimit } = require('../server/security');
const { isAdminRequest } = require('../server/admin-auth');

module.exports = async (req, res) => {
  // ── CORS ──
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (rejectBadOrigin(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimit(req, res, 'regenerate-blog', 6, 60 * 60 * 1000)) return;
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'Admin session required' });
  }
  if (requireAdminWriteHeader(req, res)) return;

  console.log('[Regenerate Blog] Starting static blog generation...');

  try {
    if (isVercelRuntime) {
      // Déclencher GitHub Actions : c'est ce qui génère puis commit les fichiers dans le repo.
      const githubToken = process.env.GH_TOKEN;
      if (githubToken) {
        const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            event_type: GITHUB_DISPATCH_EVENT,
            client_payload: {
              source: 'vercel-api',
              requested_at: new Date().toISOString()
            }
          })
        });
        if (!ghResponse.ok) {
          const ghError = await ghResponse.text().catch(() => '');
          throw new Error(`GitHub dispatch failed: ${ghResponse.status} ${ghError}`);
        }

        console.log('[Regenerate Blog] GitHub Action triggered successfully');

        return res.status(202).json({
          success: true,
          mode: 'github-action',
          message: 'Publication enregistrée. GitHub Action déclenchée pour générer et commiter les pages statiques.'
        });
      }

      if (deployHookUrl) {
        const hookResponse = await fetch(deployHookUrl, { method: 'POST' });
        if (!hookResponse.ok) {
          throw new Error(`Deploy hook failed: ${hookResponse.status} ${hookResponse.statusText}`);
        }

        return res.status(202).json({
          success: true,
          mode: 'deploy-hook-only',
          message: 'Build Vercel déclenché, mais GH_TOKEN manque : les pages seront visibles sur Vercel sans être commitées dans GitHub.'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'GH_TOKEN manquant',
        message: 'Ajoute GH_TOKEN dans les variables Vercel pour déclencher la GitHub Action qui commit les pages statiques.'
      });
    }

    const generatorPath = path.join(process.cwd(), 'js', 'generate-static-blog.js');

    // Run the generator script
    const output = execSync(`node "${generatorPath}"`, {
      encoding: 'utf8',
      timeout: 60000, // 60s timeout
      maxBuffer: 5 * 1024 * 1024 // 5MB buffer
    });

    console.log('[Regenerate Blog] Output:\n', output);

    // Extract generated count from output for response
    const match = output.match(/(\d+)\/\d+ static pages/);
    const generatedCount = match ? parseInt(match[1]) : 0;

    return res.status(200).json({
      success: true,
      generated: generatedCount,
      message: `${generatedCount} page(s) statique(s) générée(s) avec succès`
    });
  } catch (error) {
    console.error('[Regenerate Blog] Error:', error.message);

    // If the error has stdout/stderr, include it for debugging
    const details = error.stdout || error.stderr || error.message;

    return res.status(500).json({
      success: false,
      error: 'Échec de la régénération du blog statique',
      details: details.substring(0, 500) // limit length
    });
  }
};
