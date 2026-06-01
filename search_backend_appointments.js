import fs from 'fs/promises';

async function search() {
  try {
    const code = await fs.readFile('server.js', 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('v1/appointments') || line.includes('appointments WHERE')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
search();
