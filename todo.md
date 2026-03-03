# TODO — Slujbe Postul Mare 2026

## I. Vecernia Mare (Sâmbetele) ✅

Complet funcțional. 5 sâmbete, fiecare cu ruta `/vespers/YYYY-MM-DD`.

- [x] Texte Triod (5 săptămâni), Octoih (8 glasuri), tropare, stihiri
- [x] Toate textele fixe mutate în `src/content/fixed/*.json`
- [x] Verificat cu Anuarul Liturgic 2026

---

## II. Liturghia Darurilor Înainte Sfințite ✅

Complet funcțional. 10 zile (Mi/Vi, săpt 2–6), fiecare cu ruta `/presanctified/YYYY-MM-DD`.

### Infrastructură
- [x] `src/lib/composer-presanctified.ts` — compune serviciul complet (23 secțiuni)
- [x] `src/lib/context.ts` — `getPresanctifiedDays()` calculează automat Mi/Vi, săpt 1–6
- [x] `src/pages/presanctified/[date].astro` — ruta dinamică
- [x] `src/content/config.ts` — schema Zod pentru colecția `presanctified`
- [x] `tests/presanctified-mar4.spec.ts` — 5 teste, trec

### Texte fixe (toate complete în `src/content/fixed/`)
- [x] `catisma18.json`, `ectenia-mica.json`, `sa-se-indrepteze.json`, `heruvic-daruri.json`
- [x] `ectenia-catehumenilor.json`, `ectenia-luminare.json` (de la săpt 4)
- [x] `impartasirea.json`, `dupa-impartasire.json`, `psalm33.json`, `otpust-daruri.json`
- [x] `tatal-nostru-daruri.json`, `ectenia-cererilor-daruri.json`

### Generare automată — toate 10 zile
- [x] `generate_presanctified.cjs` — parser Triod + Minei + Octoih → JSON
- [x] Toate 10 fișiere generate în `src/content/presanctified/`
- [x] Build trece, toate paginile se construiesc

| Zi | Dată | Stihira | Mucen | Minei | Încheiere | Paremii |
|----|------|---------|-------|-------|-----------|---------|
| Mi săpt 2 | 4 mar | glas 1 | 4 | 4 | Nasc | Facere+Pilde |
| Vi săpt 2 | 6 mar | glas 4 | 4 | 4 | Slavă morți | Facere+Pilde |
| Mi săpt 3 | 11 mar | glas 4 | 4 | 4 | Nasc | Facere+Pilde |
| Vi săpt 3 | 13 mar | glas 7 | 4 | 4 | Slavă morți | Facere+Pilde |
| Mi săpt 4 | 18 mar | glas 4 | 4 | 4 | Nasc | Facere+Pilde |
| Vi săpt 4 | 20 mar | glas 6 | 4 | 4 | Slavă morți | Facere+Pilde |
| Mi săpt 5 | 25 mar | glas 8 | 4 | 4 | ⚠️ special | Facere+Pilde |
| Vi săpt 5 | 27 mar | glas 6 | 4 | 4 | Nasc | Facere+Pilde |
| Mi săpt 6 | 1 apr | glas 5 | 4 | 4 | Nasc | Facere+Pilde |
| Vi săpt 6 | 3 apr | glas 8 | 4 | — | Lazăr | Facere+Pilde |

### Cazuri speciale de verificat manual
- [ ] Mi săpt 5 (25 mar) — Buna Vestire: lipsește Născătoarea (Minei ziua 26 = Soborul Arh. Gavriil, structură diferită)
- [ ] Vi săpt 6 (3 apr) — Sâmbăta lui Lazăr: stihiri doar din Triod, fără Minei (corect)

### Lecții învățate (CRITICE)
1. Stihirile din Minei = sfântul zilei **URMĂTOARE**, nu al zilei curente
2. Miercuri în Triod = sub **"JOI — LA VECERNIE, MIERCURI SEARA"**
3. Vineri în Triod = sub **"SÂMBĂTĂ — LA VECERNIE, VINERI SEARA"**
4. Săpt 6 în Triod = "săptămâna Floriilor" (nu "a şasea săptămân")
5. Vineri standard: Martirice din **Octoih** (nu Triod!); Slavă = a morților
6. Google Sites text: **NBSP (U+00A0)** pentru indentare, nu spații normale
7. `skipPastBlock` trebuie să sară doar blocul curent, nu toate blocurile indentate consecutive

---

## III. Mineion structurat ✅

89 fișiere JSON cu secțiunea LA VECERNIE din Minei, pentru fiecare zi din Feb/Mar/Apr.

### Surse descărcate
- [x] `minei_februarie_complet.txt` — 683K chars, 28 zile
- [x] `minei_martie_complet.txt` — 643K chars, 31 zile
- [x] `minei_aprilie_complet.txt` — 613K chars, 30 zile
- [x] Sursa: ortodox007 Google Sites, scraper: `scrape_minei_all.cjs`

### Parsare în JSON structurat
- [x] `parse_minei_vecernie.cjs` — extrage LA VECERNIE din fiecare zi
- [x] 89 fișiere în `src/content/minei/02-01.json` ... `04-30.json`
- [x] Schema Zod înregistrată în `src/content/config.ts` (colecția `minei`)
- [x] Statistici: 88/89 cu Vecernie, 64 cu 3–4 stihiri, 24 cu 5+ stihiri, 0 cu 0 stihiri

**Structura fiecărui fișier:**
```json
{
  "month": 3, "day": 5,
  "saint": "Pomenirea Sfântului Mucenic Conon.",
  "vecernie": {
    "glas": 1,
    "podobia": "Prealăudaţilor Mucenici...",
    "stihiri": [{ "text": "..." }],
    "nascatoarea": { "text": "..." },
    "cruciiNascatoarea": { "text": "..." },
    "tropar": { "glas": 4, "text": "..." }
  }
}
```

**Acces programatic:** `getEntry("minei", "03-05")` → date structurate instant.

---

## IV. Triod — surse descărcate ✅

- [x] `triod_site_sapt1-2.txt` — săptămânile 1–2 (405KB)
- [x] `triod_pages/sapt3-4.txt` — săptămânile 3–4
- [x] `triod_pages/sapt5-6.txt` — săptămânile 5–6
- [x] `triod_pages/octoih_mare.txt` — Octoih Mare, 8 glasuri (23K linii)

---

## V. De făcut

### Verificare teologică
- [ ] Verificare cu Anuarul Liturgic 2026 pentru fiecare din cele 10 zile Presanctified
- [ ] Atenție specială la 25 martie (Buna Vestire) — rânduială diferită
- [ ] Verificare texte Minei: sfinții corecți pentru fiecare zi

### Teste automate
- [ ] Teste Playwright pentru restul de 9 zile Presanctified (nu doar 4 martie)
- [ ] Teste `pascha.ts` — Computus ortodox
- [ ] Teste `context.ts` — dată → glas, săptămână
- [ ] Teste `composer.ts` — Vecernie completă vs Anuar

### Îmbunătățiri vizuale și funcționale
- [ ] Print CSS — verificare pe A4/A5
- [ ] Navigare între slujbe (prev/next)
- [ ] Deploy pe Cloudflare Pages

### Extinderi viitoare
- [ ] Mineion: parsare LA UTRENIE (canoane, sedelne) — dacă va fi nevoie
- [ ] Mineion: lunile Mai–Ianuarie — dacă proiectul se extinde dincolo de Postul Mare
- [ ] Integrare Minei structurat în Vecernia Mare (pentru duminicile cu sfinți cu polieleu)

---

## Fișiere de referință

| Fișier | Conținut |
|--------|----------|
| `triod_site_sapt1-2.txt` | Triod complet săptămânile 1–2 (405KB) |
| `triod_pages/sapt3-4.txt` | Triod săptămânile 3–4 |
| `triod_pages/sapt5-6.txt` | Triod săptămânile 5–6 |
| `triod_pages/octoih_mare.txt` | Octoih Mare, 8 glasuri |
| `minei_februarie_complet.txt` | Mineiul pe Februarie complet (683K) |
| `minei_martie_complet.txt` | Mineiul pe Martie complet (643K) |
| `minei_aprilie_complet.txt` | Mineiul pe Aprilie complet (613K) |
| `generate_presanctified.cjs` | Generator: Triod+Minei+Octoih → presanctified JSON |
| `parse_minei_vecernie.cjs` | Parser: Minei text → LA VECERNIE JSON structurat |
| `scrape_minei_all.cjs` | Scraper Playwright: descarcă Minei complet (Feb/Mar/Apr) |
| `liturghia_darurilor_text.txt` | Text referință Liturghia Darurilor |
| `catavasier_octoihmic_buc_2002_c5.pdf` | PDF scanat Catavasier (345 pagini) |

---

## Scripturi utile

```bash
# Regenerare JSON-uri Presanctified (din surse Triod+Minei+Octoih)
node generate_presanctified.cjs

# Regenerare Minei JSON structurat (din surse text complete)
node parse_minei_vecernie.cjs

# Descărcare Minei (necesită Playwright instalat)
node scrape_minei_all.cjs

# Build
npx astro build

# Teste
npx playwright test
```
