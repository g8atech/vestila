const { setSession, checkPassword, safeEqualStr, noStore } = require("./_auth");

// Limite tentativi per istanza: 8 errori in 15 minuti per IP, poi blocco.
const fails = new Map();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 8;

function ip(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "sconosciuto";
}

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "metodo non consentito" });

  const key = ip(req);
  const now = Date.now();
  const rec = (fails.get(key) || []).filter((t) => now - t < WINDOW);
  if (rec.length >= LIMIT) return res.status(429).json({ error: "troppi tentativi" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const user = String((body && body.username) || "");
  const pass = String((body && body.password) || "");

  const userOk = safeEqualStr(user, process.env.DASH_USER || "");
  const passOk = checkPassword(pass, process.env.DASH_PASS_HASH);

  // Ritardo fisso: rende inutili i tentativi a raffica
  await new Promise((r) => setTimeout(r, 400));

  if (!userOk || !passOk || !process.env.DASH_USER) {
    rec.push(now);
    fails.set(key, rec);
    return res.status(401).json({ error: "credenziali non valide" });
  }
  fails.delete(key);
  setSession(res, process.env.DASH_USER);
  return res.status(200).json({ ok: true });
};
