/* ============================================================
   Hozana Concept — API Route: Regenerate Static Blog
   Vercel Serverless Function
   Triggered by admin panel after publishing an article
   ============================================================ */

const path = require('path');
const { execSync } = require('child_process');

const isVercelRuntime = !!process.env.VERCEL;
const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL || '';

module.exports = async (req, res) => {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Regenerate Blog] Starting static blog generation...');

  try {
    if (isVercelRuntime) {
      if (!deployHookUrl) {
        return res.status(202).json({
          success: false,
          mode: 'vercel-runtime',
          error: 'Génération statique non persistante sur Vercel',
          message: 'Ajoute VERCEL_DEPLOY_HOOK_URL dans les variables Vercel. Après publication, l’admin déclenchera un nouveau build qui générera les pages statiques durablement.'
        });
      }

      const hookResponse = await fetch(deployHookUrl, { method: 'POST' });
      if (!hookResponse.ok) {
        throw new Error(`Deploy hook failed: ${hookResponse.status} ${hookResponse.statusText}`);
      }

      return res.status(202).json({
        success: true,
        mode: 'deploy-hook',
        message: 'Publication enregistrée. Nouveau build Vercel déclenché pour générer les pages statiques SEO.'
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
