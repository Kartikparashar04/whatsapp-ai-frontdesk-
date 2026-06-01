import fs from 'fs/promises';

async function search() {
  try {
    const code = await fs.readFile('server.js', 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('CREATE TABLE IF NOT EXISTS appointments') || line.includes('date_time TEXT')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
search();
