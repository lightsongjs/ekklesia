const fs = require('fs');

// Helper: extract text between two line patterns
function extractBetween(txt, startPattern, endPatterns, startOffset) {
  const lines = txt.split('\n');
  let start = -1;
  for (let i = (startOffset || 0); i < lines.length; i++) {
    if (lines[i].trim().includes(startPattern)) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 3; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    for (const ep of endPatterns) {
      if (trimmed.startsWith(ep) || trimmed === ep) {
        end = i;
        return lines.slice(start, end).join('\n');
      }
    }
  }
  return lines.slice(start, end).join('\n');
}

const sapt12 = fs.readFileSync('triod_pages/sapt1-2.txt', 'utf-8');
const sapt34 = fs.readFileSync('triod_pages/sapt3-4.txt', 'utf-8');
const sapt56 = fs.readFileSync('triod_pages/sapt5-6.txt', 'utf-8');

// D1: sapt1-2, "LA VECERNIA MARE" -> "LA UTRENIE" or "LA VECERNIE, DUMINICĂ"
const d1 = extractBetween(sapt12, 'LA VECERNIA MARE', ['LA UTRENIE', 'LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_d1.txt', d1, 'utf-8');
console.log('D1:', d1.split('\n').length, 'lines');

// D2: sapt3-4, starts at "LA VECERNIE, SÂMBĂTĂ SEARA" (line ~34)
// ends at "LA VECERNIE, DUMINICĂ SEARA"
const d2 = extractBetween(sapt34, 'LA VECERNIE, SÂMBĂTĂ SEARA', ['LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_d2.txt', d2, 'utf-8');
console.log('D2:', d2.split('\n').length, 'lines');

// D3: sapt3-4, "SÂMBĂTĂ SEARA LA VECERNIA MICĂ" (line ~1984)
// This includes Vecernia Mică then Vecernia Mare
// ends at "LA VECERNIE, DUMINICĂ"
const d3_full = extractBetween(sapt34, 'SÂMBĂTĂ SEARA LA VECERNIA MICĂ', ['LA VECERNIE, DUMINICĂ'], 1900);
fs.writeFileSync('triod_pages/vecernia_d3.txt', d3_full, 'utf-8');
console.log('D3:', d3_full.split('\n').length, 'lines');

// D4: sapt5-6, "LA VECERNIE, SÂMBĂTĂ SEARA" (line ~35)
// ends at "LA VECERNIE, DUMINICĂ"
const d4 = extractBetween(sapt56, 'LA VECERNIE, SÂMBĂTĂ SEARA', ['LA VECERNIE, DUMINICĂ']);
fs.writeFileSync('triod_pages/vecernia_d4.txt', d4, 'utf-8');
console.log('D4:', d4.split('\n').length, 'lines');

// D5: sapt5-6, second "LA VECERNIE, SÂMBĂTĂ SEARA" (line ~3471)
// ends at "LA VECERNIE, DUMINICA SEARA" or "LA VECERNIE, DUMINICĂ"
const d5 = extractBetween(sapt56, 'LA VECERNIE, SÂMBĂTĂ SEARA', ['LA VECERNIE, DUMINICA SEARA', 'LA VECERNIE, DUMINICĂ'], 3400);
fs.writeFileSync('triod_pages/vecernia_d5.txt', d5, 'utf-8');
console.log('D5:', d5.split('\n').length, 'lines');

console.log('\nAll extracted!');
