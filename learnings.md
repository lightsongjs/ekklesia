# Learnings — Generator de Slujbe pentru Postul Mare

## Ce am construit

Un generator modular de slujbe liturgice ortodoxe pentru Postul Mare 2026, construit cu Astro, TypeScript și Tailwind CSS.

### Arhitectura

Separăm conținutul în 3 categorii:
1. **Texte fixe** (`src/content/fixed/`) — neschimbătoare: Psalmul 103, Ectenia Mare, Fericit Bărbatul, Doamne strigat-am, Stihuri, Lumină lină, Acum slobozește, Trisaghionul
2. **Octoih** (`src/content/octoechos/`) — variază pe ciclul de 8 glasuri: Stihiri ale Învierii, ale lui Anatolie, Dogmatica, Stihoavna, Troparul Învierii, Troparul Născătoarei
3. **Triod** (`src/content/triodion/`) — variază pe săptămâni: Stihirile proprii fiecărei duminici, Slavă, Stihoavna Slavă/Și acum, Troparul Sfântului

### Composerul (`src/lib/composer.ts`)

Assemblează toate secțiunile Vecerniei Mari într-o ordine fixă:
Psalm 103 → Ectenia Mare → Fericit Bărbatul → Ectenia mică → Doamne strigat-am (stihuri + stihiri intercalate) → Vohod (Lumină lină) → Prochimen → Ectenia cererilor stăruitoare → Învredniceşte-ne → Ectenia cererilor → Stihoavna → Acum slobozește → Trisaghionul → Troparul → Otpustul

Structura e fixă — doar textele variabile se schimbă de la o săptămână la alta.

### Calculul glasului (tonului)

- Se bazează pe ciclul de 8 glasuri care pornește de la Duminica Tomii (Paște + 7 zile)
- Se folosește Paștele anului **precedent** pentru datele din Postul Mare
- Formula: `glas = (săptămâniDeLaTomii % 8) + 1`
- Paștele 2025 = 20 aprilie → Glasurile pentru 2026: 5, 6, 7, 8, 1
- Algoritmul Computus Ortodox (Meeus) din `pascha.ts` funcționează pentru orice an

## Procesul de extragere a textelor

### Surse

1. **Catavasier Octoihmic** (PDF scanat, București 2002) — extras stihirile pe 8 glasuri
2. **Triod digital** de pe `sites.google.com/site/ortodox007/triodul` — extras cu Playwright
3. **Triodul.pdf** scanat — folosit pentru verificare

### Cum am extras din Triod

1. Am folosit **Playwright** (headless Chromium) pentru a descărca paginile Google Sites (conținut dinamic, nu funcționa cu fetch simplu)
2. Am salvat 5 fișiere text+HTML în `triod_pages/`:
   - `sapt1-2.txt` (406K) — Săptămânile 1-2
   - `sapt3-4.txt` (322K) — Săptămânile 3-4
   - `sapt5-6.txt` (459K) — Săptămânile 5-6
   - `sapt-patimilor.txt` (433K) — Săptămâna Patimilor
   - `cantari-treimice.txt` (214K) — Cântări Treimice
3. Am scris scripturi Node.js (`.cjs` fiindcă proiectul e ESM) pentru a extrage secțiunile de Vecernie
4. Am identificat manual start/end markers pentru fiecare duminică
5. Am extras textele și le-am populat în `saptamana1-5.json`

### Lecții învățate

- **HTML e mai util decât text** pentru extragere — păstrează culorile (roșu = rubrice) și formatarea
- **Node.js v25 cu TypeScript experimental** are probleme cu `!==` în scripturi inline (`-e`) — soluție: folosește fișiere `.cjs`
- **OneDrive blochează fișiere** uneori, cauzând erori în `mutable-data-store.js` — soluție: șterge `.astro/data-store.json`
- **Rânduiala variază** între duminici:
  - D1, D2, D3: 3 Înviere + 3 Anatolie + 4 Triod = 10
  - D4, D5: 3 Înviere + 4 Anatolie + 3 Triod = 10
- **D2 (Palama)** are 4 stihiri prescrise dar doar 3 texte unice — prima se repetă
- **D3 (Crucea)** are Slavă și Și acum combinate la Stihoavnă (un singur text)
- **Troparul Sfântului** — fiecare duminică din Triod are propriul tropar al sfântului zilei
- **Născătoarei la Tropar** urmează glasul troparului sfântului, NU glasul de rând:
  - D1: Tropar Praznic glas 2 → Născătoarei glas 2 („Toate tainele tale...")
  - D2: Tropar Ierarh glas 8 → Născătoarei glas 8 („Cela ce pentru noi...")
  - D3: Tropar Crucea glas 1 → Născătoarei glas 1 („Gavriil zicând ție...")
  - D4: Tropar Cuvios glas 1 → Născătoarei glas 1 („Gavriil zicând ție...")
  - D5: Tropar Cuvioasă glas 8 → Născătoarei glas 8 („Cela ce pentru noi...")
- **Sursa de verificare**: Anuarul Liturgic și Tipiconal 2026 — prescrie exact glasurile și textele

## Ce am completat

### Texte fixe ✅
- [x] Psalmul 103 (cu redInitial pe prima literă)
- [x] Ectenia Mare (cu "de 3 ori" în loc de repetări)
- [x] Fericit Bărbatul
- [x] Doamne strigat-am (Psalmii 140+141) — primele 2 versete cântate, restul citite
- [x] Stihuri la Doamne strigat-am (10 stihuri din Ps. 129 și 116)
- [x] Stihuri la Stihoavnă (3 stihuri din Ps. 92)
- [x] Lumină lină (redInitial)
- [x] Acum slobozește (text continuu, italic, redInitial)
- [x] Trisaghionul + Tatăl nostru (italic, redInitial, "de 3 ori")

### Octoih ✅
- [x] Toate 8 glasurile (stihiri Înviere, Anatolie, Dogmatica, Stihoavna, Tropar)
- [x] Glasul 6 — corectat: avea doar 3 stihiri Anatolie, adăugată a 4-a („Îngroparea Ta, Doamne...")
- [x] Troparul Născătoarei de Dumnezeu (glasurile 1-8) — extras din Octoih Mare (sites.google.com/site/ortodox007/octoihul-mare)

### Triod — Vecernia Mare ✅
- [x] Săptămâna 1 — Duminica Ortodoxiei (4 stihiri + Slavă + Stihoavnă + Tropar Praznic glas 2)
- [x] Săptămâna 2 — Sf. Grigorie Palama (4 stihiri + Slavă + Stihoavnă + Tropar Ierarh glas 8)
- [x] Săptămâna 3 — Închinarea Sfintei Cruci (4 stihiri + Slavă + Stihoavnă + Tropar Crucea glas 1)
- [x] Săptămâna 4 — Sf. Ioan Scărarul (3 stihiri + Slavă + Stihoavnă + Tropar Cuvios glas 1)
- [x] Săptămâna 5 — Sf. Maria Egipteanca (3 stihiri + Slavă + Stihoavnă + Tropar Cuvioasă glas 8)

### Componente UI ✅
- [x] ServiceSection.astro — redare cu roluri (Preot/Strană/Citeț/Rubricã)
- [x] redInitial — prima literă în roșu (ca în Catavasier)
- [x] italic — pentru rugăciuni continue
- [x] text-justify — text justificat
- [x] Otpustul — structura completă și corectă

## Ce urmează

### 1. Liturghia Darurilor Înainte Sfințite

Liturghia Darurilor se face **seara**, deci:
- **Miercuri seara** → slujba aparține **joi** liturgic
- **Vineri seara** → slujba aparține **sâmbetei** liturgic

Trebuie extras din Triod:
- Textele proprii fiecărei miercuri/vineri seara din cele 5 săptămâni
- Structura Liturghiei Darurilor e diferită de Vecernia Mare — trebuie un nou composer

Sursa: fișierele `triod_pages/sapt1-2.txt`, `sapt3-4.txt`, `sapt5-6.txt` conțin deja toate textele de miercuri și vineri.

### 2. Texte lipsă
- [x] Troparul Născătoarei de Dumnezeu (8 glasuri) — completat
- [x] Troparul Sfântului (5 duminici) — completat, verificat cu Anuarul Liturgic 2026
- [x] Glasul 6 Anatolie — corectat (adăugată stihira a 4-a)
- [ ] Verificare teologică a tuturor textelor

### 3. Îmbunătățiri tehnice
- [ ] Deploy pe Cloudflare Pages
- [ ] Print CSS optimizat
- [ ] Navigație între sâmbete (prev/next)

## Structura fișierelor cheie

```
src/content/
├── config.ts              — scheme Zod
├── fixed/                 — 9 fișiere JSON (texte fixe)
├── octoechos/             — 8 fișiere (glas1-8.json)
└── triodion/              — 5 fișiere (saptamana1-5.json)

src/lib/
├── pascha.ts              — Computus Ortodox
├── context.ts             — Data → {lentWeek, tone, sundayName}
└── composer.ts            — Assemblare Vecernie completă

triod_pages/               — Surse brute descărcate
├── sapt1-2.txt/html       — Săptămânile 1-2 din Triod
├── sapt3-4.txt/html       — Săptămânile 3-4
├── sapt5-6.txt/html       — Săptămânile 5-6
├── octoih_mare.txt        — Octoih Mare (8 glasuri, extras cu Playwright)
└── vecernia_mare_d1-5.txt — Secțiuni extrase
```

## Calendarul complet — Postul Mare 2026

| Săpt | Sâmbătă   | Duminica          | Glas | Vecernie | Liturghie Daruri (Mi seara) | Liturghie Daruri (Vi seara) |
|------|-----------|-------------------|------|----------|-----------------------------|-----------------------------|
| 1    | 28 feb    | Ortodoxiei        | 5    | ✅       | 5 mart (pt. joi)            | 7 mart (pt. sâmb)           |
| 2    | 7 mart    | Palama            | 6    | ✅       | 12 mart (pt. joi)           | 14 mart (pt. sâmb)          |
| 3    | 14 mart   | Crucea            | 7    | ✅       | 19 mart (pt. joi)           | 21 mart (pt. sâmb)          |
| 4    | 21 mart   | Scărarul          | 8    | ✅       | 26 mart (pt. joi)           | 28 mart (pt. sâmb)          |
| 5    | 28 mart   | Maria Egipteanca  | 1    | ✅       | 2 apr (pt. joi)             | 4 apr (Sâmb. lui Lazăr)     |

Paștele 2026 = 12 aprilie
