import fs from 'fs/promises';

async function search() {
  try {
    const code = await fs.readFile('src/App.jsx', 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('handleManualWhatsAppConnect')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
search();
