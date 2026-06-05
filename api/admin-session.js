const { prepareApi, readSession, verifySession } = require('../server/admin-auth');

module.exports = async (req, res) => {
  if (!prepareApi(req, res, 'admin-session', 60)) return;
  if (req.method !== 'GET') return res.status(405).json({ error:'Method not allowed' });
  return res.status(200).json({ authenticated: verifySession(readSession(req)) });
};
