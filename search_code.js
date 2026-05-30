import fs from 'fs/promises';

async function search() {
  try {
    const code = await fs.readFile('src/App.jsx', 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('handleUpdateApptStatus') || line.includes('setAppointments') || line.includes('filter')) {
        console.log(`Line ${index + 1}: ${line}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
search();
