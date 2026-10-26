// Uso: node scripts/hash-password.js "nuova-password"
// Stampa il valore da mettere nella variabile DASH_PASS_HASH su Vercel.
const crypto = require("crypto");
const pw = process.argv[2];
if (!pw || pw.length < 12) {
  console.error("Indica una password di almeno 12 caratteri.");
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
