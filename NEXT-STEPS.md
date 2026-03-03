# Next Steps — Vecernii non-Post

## Context
Momentan se generează doar paginile din Postul Mare (18 pagini):
- 5 Vecernii (sâmbetele din Post)
- 10 Liturghii ale Darurilor (Mi + Vi, săpt. 2-6)
- 1 pagină index cu calendar

Cele ~47 sâmbete din afara Postului au fost dezactivate temporar
(commit anterior le are pe toate 52).

## Ce trebuie făcut pentru a activa toate sâmbetele

### 1. În `src/pages/vespers/[date].astro`
Schimbă înapoi:
```ts
// DE LA:
import { getContext, getLentSaturdays } from "../../lib/context";
const saturdays = getLentSaturdays(2026);

// LA:
import { getContext, getAllSaturdays } from "../../lib/context";
const saturdays = getAllSaturdays(2026);
```

### 2. În `src/pages/index.astro`
Schimbă înapoi:
```ts
// DE LA:
import { getLentSaturdays, getPresanctifiedDays } from "../lib/context";
const saturdays = getLentSaturdays(year);

// LA:
import { getAllSaturdays, getPresanctifiedDays } from "../lib/context";
const saturdays = getAllSaturdays(year);
```

### 3. Verificare teologică
Fiecare sâmbătă non-Post generează Vecernie cu:
- Octoih (glasul calculat automat) — stihiri Învierii + Anatolie + Dogmatica
- Triod = null → fallback Octoih-only (stihiri pe 8)
- Mineion nu e încă integrat în Vecernie (doar în Presanctified)

De verificat pentru fiecare:
- [ ] Glasul e corect
- [ ] Stihirile Învierii sunt corecte
- [ ] Dogmatica e corectă
- [ ] Troparele sunt corecte

### 4. Re-activare teste
În `tests/calendar.spec.ts` sunt comentate testele non-Post.
Decomentează-le după activare.

### 5. Commit de referință
Commit-ul `9683842` are toate 52 sâmbetele active.
Se poate reveni cu `git cherry-pick` sau pur și simplu refăcând pașii de mai sus.
