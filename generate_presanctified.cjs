/**
 * generate_presanctified.cjs
 *
 * Parses Triod + Mineion + Octoih source texts and generates
 * all presanctified JSON files for Lent 2026.
 *
 * Usage: node generate_presanctified.cjs
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Load source texts
// ---------------------------------------------------------------------------

const triodSapt12 = fs.readFileSync("triod_site_sapt1-2.txt", "utf-8");
const triodSapt34 = fs.readFileSync("triod_pages/sapt3-4.txt", "utf-8");
const triodSapt56 = fs.readFileSync("triod_pages/sapt5-6.txt", "utf-8");
const octoihMare = fs.readFileSync("triod_pages/octoih_mare.txt", "utf-8");
const mineiMartie = fs.readFileSync("minei_martie_complet.txt", "utf-8");
const mineiAprilie = fs.readFileSync("minei_aprilie_complet.txt", "utf-8");

// ---------------------------------------------------------------------------
// Calendar for 2026 Presanctified Liturgies
// ---------------------------------------------------------------------------

const calendar = [
  {
    date: "2026-03-04", dayOfWeek: "miercuri", lentWeek: 2,
    triodSource: "sapt12", triodAnchor: "LA VECERNIE, MIERCURI SEARA",
    triodAnchorContext: "a doua săptămân",
    mineiMonth: "martie", mineiDay: 5,
    slug: "miercuri-sapt2", tone: 6, type: "miercuri",
  },
  {
    date: "2026-03-06", dayOfWeek: "vineri", lentWeek: 2,
    triodSource: "sapt12", triodAnchor: "LA VECERNIE, VINERI SEARA",
    triodAnchorContext: "a doua săptămân",
    mineiMonth: "martie", mineiDay: 7,
    slug: "vineri-sapt2", tone: 6, type: "vineri-standard",
  },
  {
    date: "2026-03-11", dayOfWeek: "miercuri", lentWeek: 3,
    triodSource: "sapt34", triodAnchor: "LA VECERNIE, MIERCURI SEARA",
    triodAnchorContext: "a treia săptămân",
    mineiMonth: "martie", mineiDay: 12,
    slug: "miercuri-sapt3", tone: 7, type: "miercuri",
  },
  {
    date: "2026-03-13", dayOfWeek: "vineri", lentWeek: 3,
    triodSource: "sapt34", triodAnchor: "LA VECERNIE VINERI SEARA",
    triodAnchorContext: "a treia săptămân",
    mineiMonth: "martie", mineiDay: 14,
    slug: "vineri-sapt3", tone: 7, type: "vineri-standard",
  },
  {
    date: "2026-03-18", dayOfWeek: "miercuri", lentWeek: 4,
    triodSource: "sapt34", triodAnchor: "LA VECERNIE, MIERCURI SEARA",
    triodAnchorContext: "a patra săptămân",
    mineiMonth: "martie", mineiDay: 19,
    slug: "miercuri-sapt4", tone: 8, type: "miercuri",
  },
  {
    date: "2026-03-20", dayOfWeek: "vineri", lentWeek: 4,
    triodSource: "sapt34", triodAnchor: "LA VECERNIE, VINERI SEARA",
    triodAnchorContext: "a patra săptămân",
    mineiMonth: "martie", mineiDay: 21,
    slug: "vineri-sapt4", tone: 8, type: "vineri-standard",
  },
  {
    date: "2026-03-25", dayOfWeek: "miercuri", lentWeek: 5,
    triodSource: "sapt56", triodAnchor: "LA VECERNIE, MIERCURI SEARA",
    triodAnchorContext: "a cincea săptămân",
    mineiMonth: "martie", mineiDay: 26,
    slug: "miercuri-sapt5", tone: 1, type: "miercuri",
  },
  {
    date: "2026-03-27", dayOfWeek: "vineri", lentWeek: 5,
    triodSource: "sapt56", triodAnchor: "LA VECERNIE, VINERI SEARA",
    triodAnchorContext: "a cincea săptămân",
    mineiMonth: "martie", mineiDay: 28,
    slug: "vineri-sapt5", tone: 1, type: "vineri-special",
  },
  {
    date: "2026-04-01", dayOfWeek: "miercuri", lentWeek: 6,
    triodSource: "sapt56", triodAnchor: "LA VECERNIE, MIERCURI SEARA",
    triodAnchorContext: "Floriilor",
    mineiMonth: "aprilie", mineiDay: 2,
    slug: "miercuri-sapt6", tone: 2, type: "miercuri",
  },
  {
    date: "2026-04-03", dayOfWeek: "vineri", lentWeek: 6,
    triodSource: "sapt56", triodAnchor: "LA VECERNIE, VINERI SEARA",
    triodAnchorContext: "Floriilor",
    mineiMonth: null, mineiDay: null,
    slug: "vineri-sapt6", tone: 2, type: "vineri-special",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NBSP = "\u00A0";

function isIndented(line) {
  if (!line) return false;
  const c = line.charCodeAt(0);
  // regular space, tab, or non-breaking space
  return c === 32 || c === 9 || c === 0xA0;
}

function getTriodText(source) {
  switch (source) {
    case "sapt12": return triodSapt12;
    case "sapt34": return triodSapt34;
    case "sapt56": return triodSapt56;
  }
}

function getMineiText(month) {
  if (month === "martie") return mineiMartie;
  if (month === "aprilie") return mineiAprilie;
  return null;
}

function findTriodSection(text, anchor, contextHint) {
  const lines = text.split("\n");
  let bestStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().includes(anchor)) {
      const lookback = lines.slice(Math.max(0, i - 15), i).join(" ").toLowerCase();
      if (lookback.includes(contextHint.toLowerCase())) {
        bestStart = i;
        break;
      }
    }
  }

  if (bestStart === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().includes(anchor)) { bestStart = i; break; }
    }
  }
  if (bestStart === -1) return null;

  let endIdx = lines.length;
  for (let i = bestStart + 20; i < lines.length; i++) {
    const t = lines[i].trim();
    if (
      (t.match(/^(JOI|Joi)\b/) && !t.includes("SEARA") && !t.includes("seara")) ||
      (t.match(/^(VINERI|Vineri)\b/) && !t.includes("SEARA") && !t.includes("seara") && t.length < 15) ||
      (t.match(/^(MIERCURI|Miercuri)\b/) && !t.includes("SEARA") && !t.includes("seara") && t.length < 15) ||
      (t.match(/^(SÂMBĂTĂ|Sâmbătă)\b/) && !t.includes("SEARA") && !t.includes("seara")) ||
      t.startsWith("LA UTRENIE") ||
      t.startsWith("La ceasul") ||
      (t.match(/^LA VECERNIE/) && i > bestStart + 20)
    ) {
      endIdx = i;
      break;
    }
  }

  return lines.slice(bestStart, endIdx).join("\n");
}

function romanianOrdinalToNumber(str) {
  const s = str.toLowerCase().trim();
  const map = [
    [/1|întâi/, 1], [/2|doilea/, 2], [/3|treilea/, 3], [/4|patrulea/, 4],
    [/5|cincilea/, 5], [/6|şaselea|saselea/, 6], [/7|şaptelea|saptelea/, 7],
    [/8|optulea/, 8],
  ];
  for (const [re, val] of map) { if (re.test(s)) return val; }
  return 0;
}

function extractToneFromLine(line) {
  // Handle: "glasul 1", "glasul al 4-lea", "glasului al 6-lea", "glas 8"
  const digitMatch = line.match(/glas(?:ul(?:ui)?|ul?)?\s+(?:al\s+)?(\d+)/i);
  if (digitMatch) return parseInt(digitMatch[1]);
  const ordMatch = line.match(/glas(?:ul(?:ui)?|ul?)?\s+(?:al\s+)?([a-zăâîșțşţ0-9\s-]+lea)/i);
  if (ordMatch) return romanianOrdinalToNumber(ordMatch[1]);
  return 0;
}

/** Check if text looks like a real stihira (not a rubric/header) */
function isStihiraText(text) {
  if (!text || text.length < 50) return false;
  const lower = text.toLowerCase();
  // Skip if it looks like a rubric describing what to do
  if (lower.startsWith("la vecernie") || lower.startsWith("după obişnuita") ||
      lower.startsWith("la doamne strigat") || lower.startsWith("citim ")) return false;
  return true;
}

function extractStihiraZilei(section) {
  const lines = section.split("\n");
  const candidates = [];

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].trim().toLowerCase();
    let tone = 0;

    // Match: "Stihira, glasul...", "Idiomela, glasul...", "Samoglasnica..."
    if (lower.match(/^(stihira[,.\s]|samoglasnica|idiomela)/) && lower.includes("glas")) {
      tone = extractToneFromLine(lines[i]);
    }
    // Match: standalone "Glasul al X-lea"
    else if (lower.match(/^glasul?\s/) && lower.match(/lea|[0-9]/)) {
      tone = extractToneFromLine(lines[i]);
    }
    // Match: rubric text containing "stihir" + "glas" (tone embedded)
    else if (i < 10 && lower.includes("stihir") && lower.includes("glas")) {
      tone = extractToneFromLine(lines[i]);
    }
    else continue;

    if (!tone) continue;

    let text = extractNextTextBlock(lines, i + 1);
    text = text.replace(/\s*\(de două ori\)\s*/g, "").trim();
    if (isStihiraText(text)) return { text, tone };
    // Keep looking if the text wasn't a real stihira
  }

  return null;
}

/** Extract next indented text block starting from startIdx */
function extractNextTextBlock(lines, startIdx) {
  let text = "";
  for (let j = startIdx; j < lines.length; j++) {
    if (lines[j].trim() === "") { if (text) break; continue; }
    if (isIndented(lines[j])) {
      text += (text ? " " : "") + lines[j].trim();
    } else if (text) {
      break;
    }
  }
  return text.trim();
}

function extractTextBlockFrom(lines, startIdx) {
  let text = "";
  for (let j = startIdx; j < lines.length; j++) {
    if (lines[j].trim() === "") { if (text) break; continue; }
    if (isIndented(lines[j])) {
      text += (text ? " " : "") + lines[j].trim();
    } else {
      break;
    }
  }
  return text.trim();
}

function skipPastBlock(lines, idx) {
  while (idx < lines.length && (isIndented(lines[idx]) || lines[idx].trim() === "")) idx++;
  return idx;
}

function extractMiercuriStihiriTriod(section) {
  const lines = section.split("\n");
  const result = [];
  let i = 0;

  // Find Martirica
  while (i < lines.length) {
    const lower = lines[i].trim().toLowerCase();
    if (lower.match(/^(martirica|apoi martirica|a mucenicilor|a mucenicilor\s*:)/)) {
      const text = extractNextTextBlock(lines, i + 1);
      if (text) result.push({ text, label: "martirica" });
      // Skip past just the martirica text block
      let j = i + 1;
      while (j < lines.length && !isIndented(lines[j]) && lines[j].trim() === "") j++;
      while (j < lines.length && isIndented(lines[j])) j++;
      i = j;
      break;
    }
    i++;
  }

  // Find Podobnice (up to 3 more)
  while (i < lines.length && result.length < 4) {
    const lower = lines[i].trim().toLowerCase();

    if (
      lower.startsWith("prochimen") || lower.startsWith("de la facere") ||
      lower.startsWith("de la pilde") || lower.match(/^(şi din minei|și din minei)/) ||
      lower.match(/^slavă/) || lower.match(/^vohod/) || lower.match(/^ieşire/)
    ) break;

    if (
      lower.match(/^(alt[ăa] stih|podobn|podobia|ale lui|facere a lui|glasul|stih\s*:|apoi )/) ||
      lower === ""
    ) { i++; continue; }

    if (isIndented(lines[i])) {
      const text = extractTextBlockFrom(lines, i);
      if (text && text.length > 30) result.push({ text, label: "podobnica" });
      // Skip past just this indented block
      while (i < lines.length && isIndented(lines[i])) i++;
      continue;
    }

    i++;
  }
  return result;
}

function extractProchimenParemii(section) {
  const lines = section.split("\n");
  const result = { prochimen1: null, paremia1: null, prochimen2: null, paremia2: null };
  let prochimenCount = 0, paremiaCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^Prochimen/i) && prochimenCount < 2) {
      prochimenCount++;
      const key = prochimenCount === 1 ? "prochimen1" : "prochimen2";
      const glasMatch = line.match(/glasul\s+(?:al\s+)?(\d+)/i);
      let glas = glasMatch ? parseInt(glasMatch[1]) : 0;
      if (!glas) {
        const m = line.match(/glasul\s+(?:al\s+)?([a-zăâîșțşţ\s-]+lea)/i);
        if (m) glas = romanianOrdinalToNumber(m[1]);
      }
      let text = "", stih = "";
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const l = lines[j].trim();
        if (l === "") continue;
        if (!text) { text = l.replace(/\s*\(ps\..*?\)\s*/g, "").trim(); }
        else if (l.toLowerCase().startsWith("stih")) {
          stih = l.replace(/^stih\s*:\s*/i, "").replace(/\s*\(ps\..*?\)\s*/g, "").trim();
          break;
        } else break;
      }
      result[key] = { glas, text, stih };
    }

    if (line.match(/^De la (Facere|Pilde|Ieşire|Isaia|Levitic|pilde)/i) && paremiaCount < 2) {
      paremiaCount++;
      const key = paremiaCount === 1 ? "paremia1" : "paremia2";
      const sursaMatch = line.match(/De la (\w+)/i);
      const sursa = sursaMatch ? sursaMatch[1] : "?";
      let referinta = "", textStart = i + 1;
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const l = lines[j].trim();
        if (l === "") continue;
        if (l.match(/^Cap/i)) {
          // Clean up the reference: "Cap 5, Vers 32. Cap 6, Vers 8." -> "5:32-6:8"
          referinta = l;
          textStart = j + 1;
          break;
        }
      }
      const text = extractNextTextBlock(lines, textStart);
      result[key] = { sursa, referinta, text };
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Mineion parser
// ---------------------------------------------------------------------------

const dayNames = {
  1: "ÎNTÂI", 2: "A DOUA", 3: "A TREIA", 4: "A PATRA", 5: "A CINCEA",
  6: "A ŞASEA", 7: "A ŞAPTEA", 8: "A OPTA", 9: "A NOUA", 10: "A ZECEA",
  11: "A UNSPREZECEA", 12: "A DOUĂSPREZECEA", 13: "A TREISPREZECEA",
  14: "A PAISPREZECEA", 15: "A CINCISPREZECEA", 16: "A ŞAISPREZECEA",
  17: "A ŞAPTESPREZECEA", 18: "A OPTSPREZECEA", 19: "A NOUĂSPREZECEA",
  20: "A DOUĂZECEA", 21: "A DOUĂZECI ŞI UNA", 22: "A DOUĂZECI ŞI DOUA",
  23: "A DOUĂZECI ŞI TREIA", 24: "A DOUĂZECI ŞI PATRA",
  25: "A DOUĂZECI ŞI CINCEA", 26: "A DOUĂZECI ŞI ŞASEA",
  27: "A DOUĂZECI ŞI ŞAPTEA", 28: "A DOUĂZECI ŞI OPTA",
  29: "A DOUĂZECI ŞI NOUA", 30: "A TREIZECEA", 31: "A TREIZECI ŞI UNA",
};
const dayNamesAlt = { 12: "A DOISPREZECEA" };

function extractMineiDay(mineiText, day) {
  const lines = mineiText.split("\n");
  const headers = [dayNames[day] ? "ZIUA " + dayNames[day] : null,
                    dayNamesAlt[day] ? "ZIUA " + dayNamesAlt[day] : null].filter(Boolean);

  let firstIdx = -1, secondIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (headers.some(h => t === h)) {
      if (firstIdx === -1) firstIdx = i; else { secondIdx = i; break; }
    }
  }

  const startIdx = secondIdx !== -1 ? secondIdx : firstIdx;
  if (startIdx === -1) return null;

  const nextDay = day + 1;
  const nextHeaders = [dayNames[nextDay] ? "ZIUA " + dayNames[nextDay] : null,
                       dayNamesAlt[nextDay] ? "ZIUA " + dayNamesAlt[nextDay] : null].filter(Boolean);
  let endIdx = lines.length;
  for (let i = startIdx + 5; i < lines.length; i++) {
    if (nextHeaders.some(h => lines[i].trim() === h)) { endIdx = i; break; }
  }

  const daySection = lines.slice(startIdx, endIdx).join("\n");
  const vecIdx = daySection.indexOf("LA VECERNIE");
  if (vecIdx === -1) return daySection;
  const utrIdx = daySection.indexOf("LA UTRENIE", vecIdx + 20);
  return utrIdx !== -1 ? daySection.substring(vecIdx, utrIdx) : daySection.substring(vecIdx);
}

function extractMineiStihiri(vecernieSection) {
  if (!vecernieSection) return { stihiri: [], nascatoarea: null, saintName: "" };

  const lines = vecernieSection.split("\n");
  const stihiri = [];
  let nascatoarea = null, saintName = "", inStihiri = false;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const l = lines[i].trim();
    if (l.match(/^(Pomenirea|Sfânt|Cuvios|Mucenic|Prooroc|Sobor|În aceasta)/i) && l.length > 10) {
      saintName = l; break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].trim().toLowerCase();

    if (lower.includes("doamne") && lower.includes("strigat")) { inStihiri = true; continue; }

    // Check for Slavă... Și acum... a Născătoarei
    if (lower.match(/^slav/) && (lower.includes("acum") || lower.includes("născătoar") || lower.includes("nascatoar"))) {
      // Check if this line or next mentions Născătoarea
      const combined = lower + " " + (lines[i+1]?.trim().toLowerCase() || "");
      if (combined.includes("născătoar") || combined.includes("nascatoar")) {
        // Find the next indented block (which is the actual text)
        for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
          if (isIndented(lines[k])) {
            nascatoarea = extractTextBlockFrom(lines, k);
            break;
          }
        }
        break;
      }
    }

    if (inStihiri && isIndented(lines[i])) {
      const text = extractTextBlockFrom(lines, i);
      if (text && text.length > 30) stihiri.push({ text });
      // Skip past just this contiguous indented block (not the next one)
      let j = i;
      while (j < lines.length && isIndented(lines[j])) j++;
      i = j - 1; // for loop will increment
    }
  }

  return { stihiri, nascatoarea, saintName };
}

// ---------------------------------------------------------------------------
// Octoih Martirice extractor
// ---------------------------------------------------------------------------

function findOctoihVineriSeara(glas) {
  const lines = octoihMare.split("\n");
  const glasNames = {
    1: "GLASUL ÎNTÂI", 2: "GLASUL AL DOILEA", 3: "GLASUL AL TREILEA",
    4: "GLASUL AL PATRULEA", 5: "GLASUL AL CINCILEA", 6: "GLASUL AL ŞASELEA",
    7: "GLASUL AL ŞAPTELEA", 8: "GLASUL AL OPTULEA",
  };

  let glasStart = -1;
  for (let i = 100; i < lines.length; i++) {
    if (lines[i].trim().includes("CÂNTĂRILE ÎNVIERII PE " + glasNames[glas])) {
      glasStart = i; break;
    }
  }
  if (glasStart === -1) return { lines, start: -1, end: -1 };

  let nextGlasStart = lines.length;
  if (glas < 8) {
    for (let i = glasStart + 100; i < lines.length; i++) {
      if (lines[i].trim().includes("CÂNTĂRILE ÎNVIERII PE " + glasNames[glas + 1])) {
        nextGlasStart = i; break;
      }
    }
  }

  let vineriStart = -1;
  for (let i = glasStart; i < nextGlasStart; i++) {
    if (lines[i].trim() === "VINERI SEARA, LA VECERNIE") { vineriStart = i; break; }
  }

  return { lines, start: vineriStart, end: nextGlasStart };
}

function extractOctoihMartirice(glas) {
  const { lines, start, end } = findOctoihVineriSeara(glas);
  if (start === -1) return [];

  const stihiri = [];
  let inDoamne = false;

  for (let i = start; i < Math.min(start + 80, end); i++) {
    const lower = lines[i].trim().toLowerCase();
    if (lower.match(/^la stihoavn/)) break;
    // Stop at Slavă...Și acum but not at "Slavă" alone (could be a stih)
    if (lower.match(/^(mărire|slavă).*și acum/)) break;

    if (lower.includes("doamne strigat-am") || lower.includes("doamne, strigat-am")) {
      inDoamne = true; continue;
    }

    // Skip section headers like "Alte Stihiri Muceniceşti." or "Alte Stihiri."
    if (lower.match(/^(alte stihiri|stihiri (stăpâneşti|muceniceşti))/)) continue;

    if (inDoamne && isIndented(lines[i])) {
      const text = extractTextBlockFrom(lines, i);
      if (text && text.length > 20) stihiri.push({ text });
      // Skip past just this contiguous indented block
      let j = i;
      while (j < lines.length && isIndented(lines[j])) j++;
      i = j - 1;
    }
  }

  // Take up to 4 stihiri; if we have 3, repeat the first to make 4
  const result = stihiri.slice(0, 4).map(s => ({ text: s.text }));
  if (result.length === 3) result.push({ text: result[0].text });
  return result;
}

function extractSlavaMortilor(glas) {
  const { lines, start, end } = findOctoihVineriSeara(glas);
  if (start === -1) return null;

  for (let i = start; i < Math.min(start + 150, end); i++) {
    const lower = lines[i].trim().toLowerCase();
    if (lower.match(/^(a morţilor|ale morţilor|a morților|ale morților)\s*:/)) {
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        if (lines[j].trim().toLowerCase().startsWith("stih")) continue;
        if (lines[j].trim() === "") continue;
        if (isIndented(lines[j])) return extractTextBlockFrom(lines, j);
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Title generation
// ---------------------------------------------------------------------------

function extractSaintFromMinei(mineiText, day) {
  if (!mineiText || !day) return "";
  const lines = mineiText.split("\n");
  const headers = [dayNames[day] ? "ZIUA " + dayNames[day] : null,
                    dayNamesAlt[day] ? "ZIUA " + dayNamesAlt[day] : null].filter(Boolean);

  let firstIdx = -1, secondIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headers.some(h => lines[i].trim() === h)) {
      if (firstIdx === -1) firstIdx = i; else { secondIdx = i; break; }
    }
  }
  const startIdx = secondIdx !== -1 ? secondIdx : firstIdx;
  if (startIdx === -1) return "";

  for (let i = startIdx + 1; i < Math.min(startIdx + 8, lines.length); i++) {
    const l = lines[i].trim();
    if (l.match(/^(Pomenirea|Sfânt|Cuvios|În aceasta|Sobor|Buna|Adormirea)/i) && l.length > 10) return l;
  }
  return "";
}

function generateTitle(entry) {
  const [, , m, d] = entry.date.match(/(\d{4})-(\d{2})-(\d{2})/);
  const dayNum = parseInt(d);
  const monthName = { "03": "martie", "04": "aprilie" }[m];
  const zi = entry.dayOfWeek === "miercuri" ? "Miercuri" : "Vineri";

  let saintInfo = "";
  if (entry.mineiMonth) {
    const mineiText = getMineiText(entry.mineiMonth);
    // Saint of the liturgy day itself (not next day)
    const dayText = extractSaintFromMinei(mineiText, dayNum);
    if (dayText) saintInfo = " — " + dayText;
  }

  return `${zi}, săptămâna a ${entry.lentWeek}-a din Post${saintInfo}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const outDir = "src/content/presanctified";

for (const entry of calendar) {
  console.log(`\n=== ${entry.slug} (${entry.date}) ===`);

  const triodText = getTriodText(entry.triodSource);
  const triodSection = findTriodSection(triodText, entry.triodAnchor, entry.triodAnchorContext);
  if (!triodSection) { console.log("  ERROR: Triod section not found!"); continue; }
  console.log(`  Triod: ${triodSection.split("\n").length} lines`);

  const stihiraZilei = extractStihiraZilei(triodSection);
  console.log(`  Stihira: ${stihiraZilei ? `tone ${stihiraZilei.tone}, "${stihiraZilei.text.substring(0,50)}..."` : "NOT FOUND"}`);

  const pp = extractProchimenParemii(triodSection);
  console.log(`  P1: glas ${pp.prochimen1?.glas} | Par1: ${pp.paremia1?.sursa} | P2: glas ${pp.prochimen2?.glas} | Par2: ${pp.paremia2?.sursa}`);

  let stihiriMucenicilor = [];
  if (entry.type === "miercuri") {
    stihiriMucenicilor = extractMiercuriStihiriTriod(triodSection);
    console.log(`  Triod mucen: ${stihiriMucenicilor.length}`);
  } else if (entry.type === "vineri-standard") {
    stihiriMucenicilor = extractOctoihMartirice(entry.tone);
    console.log(`  Octoih mucen: ${stihiriMucenicilor.length}`);
  } else {
    stihiriMucenicilor = extractMiercuriStihiriTriod(triodSection);
    console.log(`  Special mucen: ${stihiriMucenicilor.length}`);
  }

  let stihiriMinei = [], nascatoarea = null;
  if (entry.mineiMonth && entry.mineiDay) {
    const vecernie = extractMineiDay(getMineiText(entry.mineiMonth), entry.mineiDay);
    if (vecernie) {
      const md = extractMineiStihiri(vecernie);
      stihiriMinei = md.stihiri.slice(0, 3);
      if (stihiriMinei.length > 0) stihiriMinei.push({ text: stihiriMinei[0].text });
      nascatoarea = md.nascatoarea ? { text: md.nascatoarea } : null;
      console.log(`  Minei: ${stihiriMinei.length} stihiri, nasc: ${nascatoarea ? "yes" : "no"}, saint: ${md.saintName?.substring(0,40)}`);
    } else {
      console.log("  Minei: NOT FOUND");
    }
  }

  let slavaMortilor = null;
  if (entry.type === "vineri-standard") {
    const slavText = extractSlavaMortilor(entry.tone);
    if (slavText) slavaMortilor = { glas: String(entry.tone), text: slavText };
    console.log(`  Slavă morți: ${slavaMortilor ? "yes" : "no"}`);
  }

  const json = {
    date: entry.date,
    dayOfWeek: entry.dayOfWeek,
    lentWeek: entry.lentWeek,
    title: generateTitle(entry),
    tone: stihiraZilei?.tone || entry.tone,
    stihiraZilei: { text: stihiraZilei?.text || "[de completat]" },
    stihiriMucenicilor: stihiriMucenicilor.map(s => ({ text: s.text || s })),
    stihiriMinei: stihiriMinei.map(s => ({ text: s.text || s })),
  };

  if (entry.type === "miercuri" || entry.type === "vineri-special") {
    if (nascatoarea) json.nascatoarea = nascatoarea;
  } else if (entry.type === "vineri-standard") {
    if (slavaMortilor) json.slavaMortilor = slavaMortilor;
  }

  json.prochimen1 = pp.prochimen1 || { glas: 0, text: "[de completat]", stih: "[de completat]" };
  json.paremia1 = pp.paremia1 || { sursa: "?", referinta: "?", text: "[de completat]" };
  json.prochimen2 = pp.prochimen2 || { glas: 0, text: "[de completat]", stih: "[de completat]" };
  json.paremia2 = pp.paremia2 || { sursa: "?", referinta: "?", text: "[de completat]" };

  const outPath = path.join(outDir, entry.slug + ".json");
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  console.log(`  -> ${outPath}`);
}

console.log("\n=== DONE ===");
