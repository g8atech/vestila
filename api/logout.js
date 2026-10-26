const { clearSession, noStore } = require("./_auth");

module.exports = (req, res) => {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "metodo non consentito" });
  clearSession(res);
  return res.status(200).json({ ok: true });
};
