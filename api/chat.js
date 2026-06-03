/* ============================================================
   Hozana Concept — Chat API Proxy
   Sécurise la clé API Mistral en backend (variable d'environnement)
   Endpoint : POST /api/chat
   ============================================================ */

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, systemPrompt, model } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Le champ "message" est requis.' });
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      console.error('[Chat API] MISTRAL_API_KEY not configured in environment variables');
      return res.status(500).json({
        error: 'Clé API Mistral non configurée côté serveur.',
        fallback: true
      });
    }

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt || `Tu es l'assistant IA de Hozana Concept. Tu réponds en français de manière naturelle, chaleureuse et concise.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 280,
        temperature: 0.35
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Chat API] Mistral error ${response.status}:`, errorText);
      return res.status(response.status).json({
        error: `Erreur Mistral: ${response.status}`,
        fallback: true
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: 'Réponse vide de Mistral',
        fallback: true
      });
    }

    return res.status(200).json({
      reply,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('[Chat API] Internal error:', error.message);
    return res.status(500).json({
      error: 'Erreur interne du serveur proxy.',
      fallback: true
    });
  }
};
