# TODO — Vecernia Mare, Postul Mare 2026

## Completat ✅

- [x] Extragere texte din Triod (5 săptămâni) — stihiri, stihoavna, slavă
- [x] Troparul Născătoarei de Dumnezeu (8 glasuri) — extras din Octoih Mare
- [x] Troparul Sfântului (5 duminici) — verificat cu Anuarul Liturgic 2026
- [x] Glasul 6 Anatolie — corectat (adăugată stihira a 4-a)
- [x] `redInitial` pe toate cântările
- [x] Verificare Tropar vs Anuarul Liturgic 2026 (toate 5 duminicile)

## De făcut

### ~~1. Mutare texte hardcodate din composer.ts în JSON (`fixed/`)~~ ✅

Toate secțiunile fixe mutate din composer.ts în fișiere JSON separate:
- [x] Începutul Vecerniei → `fixed/inceput.json`
- [x] Ectenia mică → `fixed/ectenia-mica.json`
- [x] Vohodul → `fixed/vohod.json`
- [x] Prochimenul → `fixed/prochimen.json`
- [x] Ectenia cererilor stăruitoare → `fixed/ectenia-intreita.json`
- [x] Învredniceşte-ne → `fixed/invredniceste-ne.json`
- [x] Ectenia cererilor → `fixed/ectenia-cererilor.json`
- [x] Otpustul → `fixed/otpust.json`

### 2. Teste automate contra Anuarului Liturgic

Instalare vitest, fixture-uri din Anuarul Liturgic 2026, teste automate:
- [ ] Instalare vitest + configurare
- [ ] Fixture-uri Anuar (`tests/fixtures/anuar-2026.ts`) — prescripțiile exacte pentru cele 5 duminici
- [ ] Teste `pascha.ts` — Computus ortodox (date cunoscute)
- [ ] Teste `context.ts` — dată → glas, săptămână, nume
- [ ] Teste `composer.ts` — mock `astro:content`, verificare Vecernie completă vs Anuar
  - Număr stihiri, surse, glasuri
  - Incipite Slavă, Dogmatica, Tropar
  - Zero placeholders

Plan detaliat: `.claude/plans/atomic-twirling-hammock.md`

### 3. Liturghia Darurilor Înainte Sfințite

- [ ] Identificare structura Liturghiei Darurilor
- [ ] Nou composer pentru Liturghia Darurilor
- [ ] Texte proprii fiecărei miercuri/vineri seara (5 săptămâni)

### 3. Verificare teologică

- [ ] Toate textele verificate contra originalului
- [ ] Ordinea liturgică validată de un cunoscător

### 4. Îmbunătățiri vizuale și funcționale

- [ ] Print CSS — verificare pe A4/A5
- [ ] Navigare între sâmbete (prev/next)
- [ ] Deploy pe Cloudflare Pages
