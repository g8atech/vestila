# Recensioni Vestila

Dashboard riservata con voto e numero di recensioni Google dei quattro negozi Vestila (Yamamay Gavirate, Yamamay Arona, Yamamay Luino, Carpisa Luino).

## Come funziona

- `public/index.html`: la pagina (login + dashboard).
- `api/login.js`, `api/logout.js`: un solo utente, password verificata con scrypt, sessione in cookie HttpOnly firmato (14 giorni), massimo 8 tentativi sbagliati ogni 15 minuti.
- `api/data.js`: legge lo storico dalla edge function `vestila-recensioni` di Brain.
- I dati stanno in Brain nello schema `vestila` (tabelle `recensioni_snapshot` e `accesso`), che non è esposto dalle API di Brain. La edge function restituisce solo quei numeri a chi presenta il token giusto.
- Su Vercel non c'è nessuna chiave di Brain: solo il token che apre questi numeri.
- Il rilevamento giornaliero lo fa un'attività programmata di Claude ogni mattina alle 7:37.

## Variabili d'ambiente su Vercel

| Nome | Cosa contiene |
|---|---|
| `DASH_USER` | nome utente per entrare |
| `DASH_PASS_HASH` | hash della password (`node scripts/hash-password.js "password"`) |
| `SESSION_SECRET` | stringa casuale lunga; cambiarla fa uscire chiunque sia collegato |
| `VESTILA_TOKEN` | token per la edge function (il suo SHA-256 sta in `vestila.accesso`) |

## Cambiare la password

1. `node scripts/hash-password.js "nuova-password"`
2. Incolla il risultato in `DASH_PASS_HASH` su Vercel e rifai il deploy.
3. Per far uscire tutti subito, cambia anche `SESSION_SECRET`.

## Revocare l'accesso ai dati

In Brain: `update vestila.accesso set attivo = false where nome = 'dashboard-vercel';`
