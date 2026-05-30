import fetch from 'node-fetch'; // or just use global fetch if node version supports it
// In Node 18+, global fetch is built-in.
async function getTunnel() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    const data = await res.json();
    console.log('\n======================================');
    console.log('PUBLIC_URL:', data.tunnels[0].public_url);
    console.log('======================================\n');
  } catch (err) {
    console.error('Error fetching ngrok tunnel:', err.message);
  }
}
getTunnel();
