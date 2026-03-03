const fs = require('fs');
const files = ['sapt1-2', 'sapt3-4', 'sapt5-6'];

for (const f of files) {
  const txt = fs.readFileSync('triod_pages/' + f + '.txt', 'utf-8');
  console.log('=== ' + f + ' ===');

  // Find all lines containing "ecern" (catches Vecernia, vecernia, etc)
  const lines = txt.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('ecern') && line.length > 5) {
      console.log('  L' + i + ': ' + line.substring(0, 100));
    }
  }

  // Also find "Doamne, strigat-am" or "Doamne strigat-am"
  console.log('  -- Doamne strigat-am occurrences:');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('doamne') && line.toLowerCase().includes('strigat')) {
      console.log('  L' + i + ': ' + line.substring(0, 120));
    }
  }
  console.log('');
}
