const { clearSessionCookie, prepareApi } = require('./admin-auth');

module.exports = async (req, res) => {
  if (!prepareApi(req, res, 'admin-logout', 30)) return;
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  clearSessionCookie(res);
  return res.status(200).json({ ok:true });
};
