import fs from 'fs/promises';

async function search() {
  try {
    const code = await fs.readFile('src/App.jsx', 'utf8');
    const lines = code.split('\n');
    const keywords = ['popup', 'modal', 'step', 'meta', 'facebook', 'fb', 'waba', 'onboard', 'signup', '866864605823070'];
    lines.forEach((line, index) => {
      const lower = line.toLowerCase();
      if (keywords.some(kw => lower.includes(kw))) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
search();
