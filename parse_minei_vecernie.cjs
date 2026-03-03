/**
 * parse_minei_vecernie.cjs
 *
 * Parses the complete Mineion text files (Feb, Mar, Apr) and extracts
 * the LA VECERNIE section for each day into structured JSON files.
 *
 * Output: src/content/minei/{MM}-{DD}.json
 *
 * Usage: node parse_minei_vecernie.cjs
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Load source texts
// ---------------------------------------------------------------------------

const sources = [
  { month: 2, name: "februarie", file: "minei_februarie_complet.txt", days: 28 },
  { month: 3, name: "martie", file: "minei_martie_complet.txt", days: 31 },
  { month: 4, name: "aprilie", file: "minei_aprilie_complet.txt", days: 30 },
];

// ---------------------------------------------------------------------------
// Day name mappings (Romanian ordinals as used in Mineion headers)
// ---------------------------------------------------------------------------

const dayNames = {
  1: "ÎNTÂIA", 2: "A DOUA", 3: "A TREIA", 4: "A PATRA", 5: "A CINCEA",
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

// Some days have alternate spellings
const dayNamesAlt = {
  1: "ÎNTÂI",
  12: "A DOISPREZECEA",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isIndented(line) {
  if (!line) return false;
  const c = line.charCodeAt(0);
  return c === 32 || c === 9 || c === 0xA0;
}

/** Extract one contiguous indented text block starting at startIdx */
function extractTextBlock(lines, startIdx) {
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

/** Find next indented block after startIdx, skipping non-indented lines */
function findNextIndentedBlock(lines, startIdx) {
  for (let j = startIdx; j < lines.length; j++) {
    if (isIndented(lines[j])) return extractTextBlock(lines, j);
  }
  return "";
}

function extractTone(line) {
  const digitMatch = line.match(/glas(?:ul(?:ui)?|ul?)?\s+(?:al\s+)?(\d+)/i);
  if (digitMatch) return parseInt(digitMatch[1]);
  const ordMatch = line.match(/glas(?:ul(?:ui)?|ul?)?\s+(?:al\s+)?([a-zăâîșțşţ0-9\s-]+lea)/i);
  if (ordMatch) {
    const s = ordMatch[1].toLowerCase().trim();
    const map = [
      [/1|întâi/, 1], [/2|doilea/, 2], [/3|treilea/, 3], [/4|patrulea/, 4],
      [/5|cincilea/, 5], [/6|şaselea|saselea/, 6], [/7|şaptelea|saptelea/, 7],
      [/8|optulea/, 8],
    ];
    for (const [re, val] of map) { if (re.test(s)) return val; }
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Extract a single day's section from the full Mineion text
// ---------------------------------------------------------------------------

function findDaySection(lines, day) {
  const headers = [
    dayNames[day] ? "ZIUA " + dayNames[day] : null,
    dayNamesAlt[day] ? "ZIUA " + dayNamesAlt[day] : null,
  ].filter(Boolean);

  // Find the SECOND occurrence (first is table of contents)
  let firstIdx = -1, secondIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (headers.some(h => t === h)) {
      if (firstIdx === -1) firstIdx = i;
      else { secondIdx = i; break; }
    }
  }

  const startIdx = secondIdx !== -1 ? secondIdx : firstIdx;
  if (startIdx === -1) return null;

  // Find end (next day's header)
  const nextDay = day + 1;
  const nextHeaders = [
    dayNames[nextDay] ? "ZIUA " + dayNames[nextDay] : null,
    dayNamesAlt[nextDay] ? "ZIUA " + dayNamesAlt[nextDay] : null,
  ].filter(Boolean);

  let endIdx = lines.length;
  if (nextHeaders.length > 0) {
    for (let i = startIdx + 5; i < lines.length; i++) {
      if (nextHeaders.some(h => lines[i].trim() === h)) { endIdx = i; break; }
    }
  }

  return { startIdx, endIdx, lines: lines.slice(startIdx, endIdx) };
}

// ---------------------------------------------------------------------------
// Extract LA VECERNIE section from a day's section
// ---------------------------------------------------------------------------

function extractVecernie(dayLines) {
  // Find "LA VECERNIE" (but not "LA VECERNIA CEA MICĂ" — handle both)
  let vecStart = -1;
  let vecType = "normal"; // or "mica" or "mare"

  for (let i = 0; i < dayLines.length; i++) {
    const t = dayLines[i].trim();
    if (t === "LA VECERNIE" || t === "LA VECERNIE.") {
      vecStart = i;
      break;
    }
    if (t === "LA VECERNIA CEA MARE" || t.match(/^LA VECERNIA CEA MARE/)) {
      vecStart = i;
      vecType = "mare";
      break;
    }
    if (t === "LA VECERNIA CEA MICĂ" || t.match(/^LA VECERNIA CEA MICĂ/)) {
      // For major feasts, look for LA VECERNIA CEA MARE instead
      if (vecStart === -1) { vecStart = i; vecType = "mica"; }
    }
  }

  // If we found "mica" but there's also "mare", prefer "mare"
  if (vecType === "mica") {
    for (let i = vecStart + 1; i < dayLines.length; i++) {
      const t = dayLines[i].trim();
      if (t === "LA VECERNIA CEA MARE" || t.match(/^LA VECERNIA CEA MARE/)) {
        vecStart = i;
        vecType = "mare";
        break;
      }
    }
  }

  if (vecStart === -1) return null;

  // Find end of Vecernie section
  let vecEnd = dayLines.length;
  for (let i = vecStart + 3; i < dayLines.length; i++) {
    const t = dayLines[i].trim();
    if (t === "LA UTRENIE" || t === "LA UTRENIE." ||
        t.match(/^LA UTRENIE\b/) ||
        (t === "LA VECERNIA CEA MARE" && vecType === "mica")) {
      vecEnd = i;
      break;
    }
  }

  return dayLines.slice(vecStart, vecEnd);
}

// ---------------------------------------------------------------------------
// Parse the Vecernie section into structured data
// ---------------------------------------------------------------------------

function parseVecernie(vecLines) {
  const result = {
    glas: 0,
    podobia: "",
    stihiri: [],
    slava: null,         // Slavă text (if separate from Și acum)
    siAcum: null,        // Și acum text
    nascatoarea: null,    // a Născătoarei text
    cruciiNascatoarea: null, // a Crucii, a Născătoarei text
    tropar: null,
    troparNascatoarea: null,
  };

  let inStihiri = false;
  let foundSlava = false;

  for (let i = 0; i < vecLines.length; i++) {
    const line = vecLines[i];
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // Extract glas from rubric line
    if (!result.glas && lower.includes("glas") && (lower.includes("stihir") || lower.includes("doamne"))) {
      result.glas = extractTone(trimmed);
    }

    // Extract Podobia
    if (lower.match(/^podobie\s*:/)) {
      result.podobia = trimmed.replace(/^Podobie\s*:\s*/i, "").trim();
      inStihiri = true;
      continue;
    }

    // Detect start of stihiri section
    if (lower.includes("doamne") && lower.includes("strigat")) {
      inStihiri = true;
      continue;
    }

    // Tropar section
    if (lower.match(/^tropar/)) {
      const tone = extractTone(trimmed);
      const text = findNextIndentedBlock(vecLines, i + 1);
      if (text) result.tropar = { glas: tone, text };
      // Look for Născătoarea tropar after
      for (let k = i + 1; k < Math.min(i + 10, vecLines.length); k++) {
        const kl = vecLines[k].trim().toLowerCase();
        if (kl.match(/^(slavă|slav).*născătoar/) || kl.match(/^şi acum.*născătoar/) || kl === "slavă..., şi acum..., al născătoarei.") {
          const nt = findNextIndentedBlock(vecLines, k + 1);
          if (nt) result.troparNascatoarea = { text: nt };
          break;
        }
      }
      break; // Tropar is the last thing in Vecernie
    }

    // Slavă..., Și acum..., a Născătoarei (combined)
    if (lower.match(/^slav/) && !foundSlava) {
      const combined = lower + " " + (vecLines[i + 1]?.trim().toLowerCase() || "");

      // "Slavă..., Și acum..., a Născătoarei :"
      if (combined.includes("născătoar") && (combined.includes("acum") || combined.includes("şi acum"))) {
        foundSlava = true;
        inStihiri = false;
        for (let k = i + 1; k < Math.min(i + 5, vecLines.length); k++) {
          if (isIndented(vecLines[k])) {
            result.nascatoarea = extractTextBlock(vecLines, k);
            break;
          }
        }
        continue;
      }

      // "Slavă..., glas X" (separate Slavă hymn)
      if (lower.match(/^slav.*glas/)) {
        foundSlava = true;
        inStihiri = false;
        const tone = extractTone(trimmed);
        const text = findNextIndentedBlock(vecLines, i + 1);
        if (text) result.slava = { glas: tone, text };
        continue;
      }

      // "Slavă..., Și acum..., glas X" (combined but not Născătoarea)
      if (lower.includes("acum") && lower.includes("glas")) {
        foundSlava = true;
        inStihiri = false;
        const tone = extractTone(trimmed);
        const text = findNextIndentedBlock(vecLines, i + 1);
        if (text) result.siAcum = { glas: tone, text };
        continue;
      }
    }

    // "Și acum..., a Născătoarei" (separate from Slavă)
    if (lower.match(/^şi acum.*născătoar/) || lower.match(/^și acum.*născătoar/)) {
      for (let k = i + 1; k < Math.min(i + 5, vecLines.length); k++) {
        if (isIndented(vecLines[k])) {
          result.nascatoarea = extractTextBlock(vecLines, k);
          break;
        }
      }
      continue;
    }

    // "A Crucii, a Născătoarei"
    if (lower.match(/^a crucii.*născătoar/)) {
      for (let k = i + 1; k < Math.min(i + 5, vecLines.length); k++) {
        if (isIndented(vecLines[k])) {
          result.cruciiNascatoarea = extractTextBlock(vecLines, k);
          break;
        }
      }
      continue;
    }

    // Collect stihiri (indented blocks within the stihiri section)
    if (inStihiri && !foundSlava && isIndented(line)) {
      const text = extractTextBlock(vecLines, i);
      if (text && text.length > 30) {
        result.stihiri.push(text);
      }
      // Skip past just this contiguous indented block
      while (i < vecLines.length - 1 && isIndented(vecLines[i + 1])) i++;
      continue;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Extract saint name from the day header area
// ---------------------------------------------------------------------------

function extractSaintName(dayLines) {
  for (let i = 0; i < Math.min(15, dayLines.length); i++) {
    const l = dayLines[i].trim();
    if (l.match(/^(Pomenirea|Sfânt|Cuvios|Mucenic|Prooroc|Sobor|Bun[aă]|Adormirea|În aceasta|Sfinții|Sfin[tț]i|Naşterea|Înălțarea|Tăierea|Aflarea|Punerea|Intrarea|Întâmpinarea)/i) && l.length > 10) {
      return l;
    }
  }
  // Sometimes the saint name is on the line right after the ZIUA header
  for (let i = 0; i < Math.min(5, dayLines.length); i++) {
    const l = dayLines[i].trim();
    if (!l.match(/^ZIUA/) && l.length > 15 && !l.match(/^LA /) && !l.match(/^\d/) && !l.match(/^Se cade/)) {
      return l;
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const outDir = "src/content/minei";
let totalFiles = 0;
let totalStihiri = 0;
let warnings = [];

for (const src of sources) {
  if (!fs.existsSync(src.file)) {
    console.log(`SKIP: ${src.file} not found`);
    continue;
  }

  const text = fs.readFileSync(src.file, "utf-8");
  const allLines = text.split("\n");

  console.log(`\n=== ${src.name.toUpperCase()} (${src.days} days) ===`);

  for (let day = 1; day <= src.days; day++) {
    const daySection = findDaySection(allLines, day);
    if (!daySection) {
      warnings.push(`${src.name} day ${day}: day section not found`);
      continue;
    }

    const vecLines = extractVecernie(daySection.lines);
    if (!vecLines) {
      warnings.push(`${src.name} day ${day}: LA VECERNIE not found`);
      // Still create a minimal file
      const slug = `${String(src.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const json = {
        month: src.month,
        day,
        saint: extractSaintName(daySection.lines),
        vecernie: null,
      };
      fs.writeFileSync(path.join(outDir, slug + ".json"), JSON.stringify(json, null, 2) + "\n", "utf-8");
      totalFiles++;
      continue;
    }

    const parsed = parseVecernie(vecLines);
    const saint = extractSaintName(daySection.lines);
    const slug = `${String(src.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const json = {
      month: src.month,
      day,
      saint,
      vecernie: {
        glas: parsed.glas,
        podobia: parsed.podobia || null,
        stihiri: parsed.stihiri.map(t => ({ text: t })),
      },
    };

    // Add optional fields only if present
    if (parsed.slava) json.vecernie.slava = parsed.slava;
    if (parsed.siAcum) json.vecernie.siAcum = parsed.siAcum;
    if (parsed.nascatoarea) json.vecernie.nascatoarea = { text: parsed.nascatoarea };
    if (parsed.cruciiNascatoarea) json.vecernie.cruciiNascatoarea = { text: parsed.cruciiNascatoarea };
    if (parsed.tropar) json.vecernie.tropar = parsed.tropar;
    if (parsed.troparNascatoarea) json.vecernie.troparNascatoarea = parsed.troparNascatoarea;

    fs.writeFileSync(path.join(outDir, slug + ".json"), JSON.stringify(json, null, 2) + "\n", "utf-8");
    totalFiles++;
    totalStihiri += parsed.stihiri.length;

    const stihCount = parsed.stihiri.length;
    const nascLabel = parsed.nascatoarea ? "Nasc" : parsed.siAcum ? "SiAcum" : "-";
    const troparLabel = parsed.tropar ? `Trop(${parsed.tropar.glas})` : "-";
    const status = stihCount >= 3 ? "" : stihCount > 0 ? " (few)" : " WARN:0";

    if (day <= 5 || stihCount === 0) {
      console.log(`  ${slug}: ${saint.substring(0, 50).padEnd(50)} | glas ${parsed.glas} | ${stihCount} stihiri${status} | ${nascLabel} | ${troparLabel}`);
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Files: ${totalFiles}`);
console.log(`Total stihiri extracted: ${totalStihiri}`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
}
