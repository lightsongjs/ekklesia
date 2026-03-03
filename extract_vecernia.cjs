const fs = require('fs');

// Extract Vecernia Mare sections for each Sunday
// We work with text files, finding start/end markers

function extractSection(txt, startLine, endMarkers) {
  const lines = txt.split('\n');
  let result = [];
  let collecting = false;
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    if (lineNum === startLine) {
      collecting = true;
    }
    if (collecting) {
      // Check if we hit an end marker
      const trimmed = line.trim();
      for (const marker of endMarkers) {
        if (lineNum > startLine + 5 && trimmed.startsWith(marker)) {
          return result.join('\n');
        }
      }
      result.push(line);
    }
  }
  return result.join('\n');
}

const endMarkers = ['LA UTRENIE', 'LA PAVECERNIŢĂ', 'PAVECERNIŢA', 'LA VECERNIE, DUMINICĂ', 'LA VECERNIE, LUNI'];

// Duminica 1 (Ortodoxiei) - sapt1-2.txt, line 3481
const sapt12 = fs.readFileSync('triod_pages/sapt1-2.txt', 'utf-8');
const d1 = extractSection(sapt12, 3481, ['LA UTRENIE', 'LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_mare_d1.txt', d1, 'utf-8');
console.log('D1 (Ortodoxiei):', d1.length, 'chars,', d1.split('\n').length, 'lines');
console.log('  First 200:', d1.substring(0, 200));

// Duminica 2 (Palama) - sapt3-4.txt starts with Sâmbătă seara
const sapt34 = fs.readFileSync('triod_pages/sapt3-4.txt', 'utf-8');
const d2_lines = sapt34.split('\n');
// Line 34 is "LA VECERNIE, SÂMBĂTĂ SEARA" - but we need to find "Doamne strigat-am" after it
const d2 = extractSection(sapt34, 34, ['LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_mare_d2.txt', d2, 'utf-8');
console.log('\nD2 (Palama):', d2.length, 'chars,', d2.split('\n').length, 'lines');
console.log('  First 200:', d2.substring(0, 200));

// Duminica 3 (Crucea) - sapt3-4.txt, line 1984 starts Vecernia Mică, Vecernia Mare follows
// Actually line 2034 has "La Doamne strigat-am..., punem 10..."
const d3 = extractSection(sapt34, 1984, ['LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_mare_d3.txt', d3, 'utf-8');
console.log('\nD3 (Crucea):', d3.length, 'chars,', d3.split('\n').length, 'lines');
console.log('  First 200:', d3.substring(0, 200));

// Duminica 4 (Scărarul) - sapt5-6.txt, line 35
const sapt56 = fs.readFileSync('triod_pages/sapt5-6.txt', 'utf-8');
const d4 = extractSection(sapt56, 35, ['LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_mare_d4.txt', d4, 'utf-8');
console.log('\nD4 (Scărarul):', d4.length, 'chars,', d4.split('\n').length, 'lines');
console.log('  First 200:', d4.substring(0, 200));

// Duminica 5 (Maria Egipteanca) - sapt5-6.txt, line 3471
const d5 = extractSection(sapt56, 3471, ['LA VECERNIE, DUMINICA', 'LA VECERNIE, DUMINICĂ', 'LA VECERNIE, LUNI']);
fs.writeFileSync('triod_pages/vecernia_mare_d5.txt', d5, 'utf-8');
console.log('\nD5 (Maria Egipteanca):', d5.length, 'chars,', d5.split('\n').length, 'lines');
console.log('  First 200:', d5.substring(0, 200));
