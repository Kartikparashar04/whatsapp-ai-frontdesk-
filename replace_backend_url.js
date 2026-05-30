import fs from 'fs/promises';

async function replace() {
  try {
    let code = await fs.readFile('src/App.jsx', 'utf8');
    
    // Add BACKEND_URL definition after imports (line 42)
    const importMark = "import { INITIAL_LEADS, INITIAL_APPOINTMENTS, INITIAL_REFERRALS, INITIAL_REVIEWS, NICHE_CONFIGS } from './mockData';";
    const replacement = `${importMark}\n\n// Backend URL configuration (Vite environment variables)\nconst BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';`;
    
    code = code.replace(importMark, replacement);
    
    // Replace all hardcoded localhost urls
    code = code.replaceAll('http://localhost:3000', '${BACKEND_URL}');
    // Wait, let's make sure template literals are used where needed.
    // If it was 'http://localhost:3000/v1/business-profile', replacing it directly with '${BACKEND_URL}/v1/business-profile' 
    // inside a standard string will look like '${BACKEND_URL}/v1/business-profile'. We need to convert it to template literals!
    // Let's do exact replacements instead.
    
    code = code.replaceAll("'http://localhost:3000/v1/business-profile'", "`\${BACKEND_URL}/v1/business-profile\`");
    code = code.replaceAll("'http://localhost:3000/v1/leads'", "`\${BACKEND_URL}/v1/leads\`");
    code = code.replaceAll("'http://localhost:3000/v1/appointments'", "`\${BACKEND_URL}/v1/appointments\`");
    code = code.replaceAll("`http://localhost:3000/v1/leads/${leadId}`", "`\${BACKEND_URL}/v1/leads/\${leadId}\`");
    code = code.replaceAll("`http://localhost:3000/v1/appointments/${apptId}`", "`\${BACKEND_URL}/v1/appointments/\${apptId}\`");
    
    await fs.writeFile('src/App.jsx', code, 'utf8');
    console.log('App.jsx successfully refactored to use dynamic BACKEND_URL!');
  } catch (err) {
    console.error(err);
  }
}
replace();
