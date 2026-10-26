const { session, noStore } = require("./_auth");

// Legge lo storico dalla edge function di Brain "vestila-recensioni".
// Il token (VESTILA_TOKEN) apre solo quei numeri: nessun'altra credenziale di Brain sta su Vercel.
const ENDPOINT = "https://ijrrnuurjbgugystlfry.supabase.co/functions/v1/vestila-recensioni";

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== "GET") return res.status(405).json({ error: "metodo non consentito" });
  if (!session(req)) return res.status(401).json({ error: "accesso richiesto" });

  try {
    const r = await fetch(ENDPOINT, { headers: { "x-vestila-token": process.env.VESTILA_TOKEN || "" } });
    if (!r.ok) return res.status(502).json({ error: "dati non disponibili" });
    const j = await r.json();
    return res.status(200).json({ snapshot: Array.isArray(j.snapshot) ? j.snapshot : [] });
  } catch {
    return res.status(502).json({ error: "dati non disponibili" });
  }
};
