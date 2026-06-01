import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/Kartik/.gemini/antigravity/scratch/whatsapp-ai-frontdesk/src/App.jsx';
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');
lines.forEach((line, index) => {
  if (line.includes('BACKEND_URL')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
