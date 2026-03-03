# Proiect: Generator de Vecernie - Postul Mare

## Descriere
Generator modular de Vecernie Mare pentru fiecare sâmbătă seara din Postul Mare 2026, în tradiția Ortodoxă Română. Construit cu Astro, TypeScript, Tailwind CSS, deployat pe Cloudflare Pages.

## Structura proiectului

```
src/
├── content/
│   ├── config.ts              # Scheme Zod pentru toate colecțiile
│   ├── fixed/                 # Texte liturgice fixe (neschimbătoare)
│   │   ├── inceput.json               # Începutul Vecerniei (binecuvântarea)
│   │   ├── psalm103.json              # Psalmul 103 (de început)
│   │   ├── ectenia-mare.json          # Ectenia Mare
│   │   ├── fericit-barbatul.json      # Fericit Bărbatul (Catisma I, Starea 1)
│   │   ├── ectenia-mica.json          # Ectenia mică (după Catismă)
│   │   ├── doamne-strigat-am.json     # Psalmii 140+141 (citirea)
│   │   ├── stihuri-la-doamne-strigat-am.json  # 10 stihuri (versete psalm)
│   │   ├── stihuri-stihoavna.json     # 3 stihuri ale Stihoavnei (Ps 92)
│   │   ├── vohod.json                 # Vohodul (Lumină lină + Vrednic ești)
│   │   ├── prochimen.json             # Prochimenul (sâmbătă seara, glas 6)
│   │   ├── ectenia-intreita.json      # Ectenia cererilor stăruitoare
│   │   ├── invredniceste-ne.json      # Învredniceşte-ne, Doamne
│   │   ├── ectenia-cererilor.json     # Ectenia cererilor
│   │   ├── acum-slobozeste.json       # Acum slobozește
│   │   ├── trisagion.json             # Sfinte Dumnezeule + Tatăl nostru
│   │   └── otpust.json               # Otpustul
│   ├── octoechos/             # Stihirile din Octoih, pe 8 glasuri
│   │   ├── glas1.json ... glas8.json
│   │   # Fiecare conține: stihiriInvierii, stihiriAnatolie,
│   │   # dogmatica, stihiraStihoavna, tropar, troparNascatoarei
│   └── triodion/              # Stihirile din Triod, pe săptămâni
│       ├── saptamana1.json ... saptamana5.json
│       # Fiecare conține: randuiala, stihiriVecernie,
│       # stihiraStihoavna, slavaSiAcumStihoavna, troparSfant
├── lib/
│   ├── pascha.ts              # Algoritmul Computus Ortodox
│   ├── context.ts             # Data → LiturgicalContext
│   └── composer.ts            # Context + Conținut → Serviciu complet
├── layouts/
│   └── ServiceLayout.astro    # Layout cu tipografie serif, print CSS
├── pages/
│   ├── index.astro            # Pagina principală (lista sâmbetelor)
│   └── vespers/[date].astro   # Ruta dinamică: /vespers/2026-02-28
└── components/
    └── ServiceSection.astro   # Redare secțiune cu roluri (Preot/Strană/Citeț)
```

## Referințe PDF - Catavasier Octoihmic (București, 2002)

Fișier: `catavasier_octoihmic_buc_2002_c5.pdf` (345 pagini, scanat)

### Paginile pentru fiecare Glas (stihiri Vecernie - "Stihii la D-S")

| Glas | Pagina start stihiri | Index PDF (0-based) | Pagini stihiri | Pagină tropar (aprox) |
|------|---------------------|--------------------|--------------|-----------------------|
| 1    | 11                  | 10                 | 11-14        | 25 (idx 19)           |
| 2    | 93                  | 92                 | 93-96        | 102 (idx 96)          |
| 3    | 107                 | 106                | 107-110      | 116 (idx 110)         |
| 4    | 121                 | 120                | 121-124      | 130 (idx 124)         |
| 5    | 136                 | 135                | 136-139      | 145 (idx 139)         |
| 6    | 151                 | 150                | 151-154      | 155 (idx 154)         |
| 7    | 165                 | 164                | 165-168      | 170 (idx 169)         |
| 8    | 179                 | 178                | 179-182      | 184 (idx 183)         |

### Structura din Document Outline (bookmarks PDF)
- G1, G2, G3, G4, G5, G6, G7, G8
- Sub fiecare: primul bookmark = "Stihii la D-S" (Doamne Strigat-am)

### Alte referințe PDF
- `PP-text-vecernie.pdf` — Text PP cu structura completă a Vecerniei (5 pagini)
- Extras în `vecernie-structura.md` (referință markdown)

## Arhitectura stihuri + stihiri

### Terminologie
- **Stihuri** = versete de psalm fixe, neschimbătoare (ex: "Scoate din temniță...")
- **Stihiri** = imne variabile, compuse de autori (din Octoih, Triod, Minei)
- **Rânduiala** = prescripția Tipicului pentru câte stihiri și de unde

### Cum funcționează intercalarea
1. Composerul citește `randuiala` din fișierul Triodion (pe 10/8/6, surse)
2. Selectează stihurile corespunzătoare din `stihuri-la-doamne-strigat-am.json`
3. Ia stihirile din sursele indicate (Octoih + Triod)
4. Intercalează: rubricã de grup → Stih (roșu) → Stihira (negru, redInitial)
5. La final: Slavă... Și acum... + Dogmatica

### Stihuri fixe
- **La Doamne strigat-am**: 10 stihuri din Psalmii 129 și 116
- **La Stihoavnă**: 3 stihuri din Psalmul 92

## Decizii arhitecturale

### Roluri pentru linii
Fiecare linie are un rol: `preot`, `diacon`, `strana`, `citeti`, `rubrica`
- `rubrica` = text roșu, italic, instrucțiuni
- `strana` = ce se cântă
- `citeti` = ce se citește
- `preot` / `diacon` = text roșu bold

### Label-uri roluri în UI
- Se afișează doar când rolul se schimbă
- NU se afișează după o rubricã (rubrica dă deja contextul)
- Stihirile din secțiunea Doamne strigat-am NU au "Strana:" repetat

### Red Initial (redInitial flag)
Prima literă a textului se colorează cu roșu (ca în Catavasier), activat prin `redInitial: true` pe linia JSON.

### Psalmii 140+141 la Doamne strigat-am
- Primele 2 versete din Ps 140 = `strana` (se cântă)
- De la "Pune, Doamne, pază gurii mele..." = `citeti` (se citesc)
- Tot Psalmul 141 = `citeti`

## Calculul glasului (Octoih)

Glasul se calculează automat în `context.ts` → `getOctoechosTone()`:

1. Se ia Paștile anului **precedent** cu `getPascha(year - 1)`
2. **Duminica Tomii** = Paști + 7 zile → Glasul 1
3. Ciclul de 8 glasuri se rotește săptămânal: 1→2→3→4→5→6→7→8→1→...
4. Formula: `glas = (săptămâniDeLaTomii % 8) + 1`
5. Sâmbătă seara la Vecernie se folosește glasul **duminicii următoare**

Algoritmul `getPascha()` din `pascha.ts` (Computus Ortodox Meeus) funcționează
corect pentru orice an. Nu e nevoie de tabele hardcodate.

### Calendarul Postului Mare 2026

| Săpt | Sâmbătă   | Duminica pe care o pregătește | Glas |
|------|-----------|-------------------------------|------|
| 1    | 28 feb    | Duminica Ortodoxiei           | 5    |
| 2    | 7 mart    | Sf. Grigorie Palama           | 6    |
| 3    | 14 mart   | Închinarea Sfintei Cruci      | 7    |
| 4    | 21 mart   | Sf. Ioan Scărarul             | 8    |
| 5    | 28 mart   | Sf. Maria Egipteanca          | 1    |

Paștele 2025 = 20 aprilie (referința pentru ciclul curent).
Paștele 2026 = 12 aprilie.

## Convenții cod
- TypeScript strict
- Astro Content Collections (type: "data", JSON)
- Zero JavaScript client-side
- Tailwind CSS cu @apply minimal
- Texte liturgice: diacritice românești corecte (ă, â, î, ș, ț)
- Fără abbrevieri ("Slavă..." → text complet)

### Flags vizuale pe linii
- `redInitial: true` — prima literă colorată roșu (ca în Catavasier)
- `italic: true` — text cursiv (pentru rugăciuni continue: Acum slobozește, Sfinte Dumnezeule, Tatăl nostru)

### Prescurtări repetitive
Unde un text se repetă identic de 3 ori, se pune o singură dată cu „(de 3 ori)":
- „Sfinte Dumnezeule... (de 3 ori)."
- „Doamne, miluiește (de 3 ori)."

## Arhitectura Tropar

La finalul Vecerniei, secțiunea Tropar urmează tiparul:
1. **Troparul Învierii** — pe glasul de rând (din Octoih)
2. **Slavă..., al Sfântului** — pe glasul propriu (din Triod, câmpul `troparSfant`)
3. **Și acum..., a Născătoarei** — pe glasul troparului sfântului (`glasNascatoarei`), NU glasul de rând

Composerul încarcă dinamic Octoih-ul corect pentru Născătoarei pe baza `troparSfant.glasNascatoarei`.

### Tropare pe duminici (2026)
| Săpt | Tropar Sfânt | Glas | Născătoarei glas | Incipit |
|------|-------------|------|-----------------|---------|
| 1 | Al Praznicului | 2 | 2 | „Toate tainele tale..." |
| 2 | Al Ierarhului | 8 | 8 | „Cela ce pentru noi..." |
| 3 | Al Crucii | 1 | 1 | „Gavriil zicând ție..." |
| 4 | Al Cuviosului | 1 | 1 | „Gavriil zicând ție..." |
| 5 | A Cuvioasei | 8 | 8 | „Cela ce pentru noi..." |

## Ce trebuie încă făcut

Detalii în `todo.md`. Pe scurt:
- [ ] Teste automate contra Anuarului Liturgic 2026 (vitest)
- [ ] Liturghia Darurilor Înainte Sfințite
- [ ] Verificare teologică
- [ ] Print CSS, navigare prev/next, deploy Cloudflare
