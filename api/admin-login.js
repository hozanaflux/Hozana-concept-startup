const { createSession, setSessionCookie, validCredentials, prepareApi } = require('../server/admin-auth');

module.exports = async (req, res) => {
  if (!prepareApi(req, res, 'admin-login', 10)) return;
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  const { email, password } = req.body || {};
  if (!validCredentials(email, password)) {
    return res.status(401).json({ error:'Invalid credentials' });
  }

  setSessionCookie(res, createSession());
  return res.status(200).json({ ok:true });
};
