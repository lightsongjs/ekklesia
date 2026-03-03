const fs = require('fs');

function extractBetween(txt, startLine, endPatterns) {
  const lines = txt.split('\n');
  let result = [];
  for (let i = startLine; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (i > startLine + 3) {
      for (const ep of endPatterns) {
        if (trimmed.startsWith(ep)) {
          return result.join('\n');
        }
      }
    }
    result.push(lines[i]);
  }
  return result.join('\n');
}

function findLine(txt, pattern, after) {
  const lines = txt.split('\n');
  for (let i = (after || 0); i < lines.length; i++) {
    if (lines[i].trim().includes(pattern)) return i;
  }
  return -1;
}

const sapt12 = fs.readFileSync('triod_pages/sapt1-2.txt', 'utf-8');
const sapt34 = fs.readFileSync('triod_pages/sapt3-4.txt', 'utf-8');
const sapt56 = fs.readFileSync('triod_pages/sapt5-6.txt', 'utf-8');

const ends = ['LA UTRENIE', 'DUMINICĂ  LA UTRENIE', 'DUMINICĂ LA UTRENIE', 'DUMINICA LA UTRENIE'];

// D1: Duminica Ortodoxiei - sapt1-2
let line = findLine(sapt12, 'LA VECERNIA MARE');
const d1 = extractBetween(sapt12, line, ends);
fs.writeFileSync('triod_pages/vecernia_d1.txt', d1, 'utf-8');
console.log('D1 (Ortodoxiei):', d1.split('\n').length, 'lines');

// D2: Sf. Grigorie Palama - sapt3-4, first "SÂMBĂTĂ SEARA"
line = findLine(sapt34, 'LA VECERNIE, SÂMBĂTĂ SEARA');
const d2 = extractBetween(sapt34, line, ends);
fs.writeFileSync('triod_pages/vecernia_d2.txt', d2, 'utf-8');
console.log('D2 (Palama):', d2.split('\n').length, 'lines');

// D3: Închinarea Crucii - sapt3-4, second block starting "SÂMBĂTĂ SEARA"
line = findLine(sapt34, 'SÂMBĂTĂ SEARA LA VECERNIA MICĂ', 1900);
const d3 = extractBetween(sapt34, line, ends);
fs.writeFileSync('triod_pages/vecernia_d3.txt', d3, 'utf-8');
console.log('D3 (Crucea):', d3.split('\n').length, 'lines');

// D4: Sf. Ioan Scărarul - sapt5-6, first "SÂMBĂTĂ SEARA"
line = findLine(sapt56, 'LA VECERNIE, SÂMBĂTĂ SEARA');
const d4 = extractBetween(sapt56, line, ['DUMINICĂ  LA UTRENIE', 'DUMINICĂ LA UTRENIE', 'DUMINICA  LA UTRENIE', 'LA UTRENIE']);
fs.writeFileSync('triod_pages/vecernia_d4.txt', d4, 'utf-8');
console.log('D4 (Scărarul):', d4.split('\n').length, 'lines');

// D5: Sf. Maria Egipteanca - sapt5-6, second "SÂMBĂTĂ SEARA"
line = findLine(sapt56, 'LA VECERNIE, SÂMBĂTĂ SEARA', 3400);
const d5 = extractBetween(sapt56, line, ['LA UTRENIE']);
fs.writeFileSync('triod_pages/vecernia_d5.txt', d5, 'utf-8');
console.log('D5 (Maria Egipteanca):', d5.split('\n').length, 'lines');

// Print first and last 3 lines of each
for (let i = 1; i <= 5; i++) {
  const content = fs.readFileSync('triod_pages/vecernia_d' + i + '.txt', 'utf-8');
  const lines = content.split('\n');
  console.log('\n=== D' + i + ' (first 3) ===');
  lines.slice(0, 3).forEach(l => console.log('  ' + l.substring(0, 120)));
  console.log('  ... (' + lines.length + ' lines total)');
  console.log('=== D' + i + ' (last 5) ===');
  lines.slice(-5).forEach(l => console.log('  ' + l.substring(0, 120)));
}
