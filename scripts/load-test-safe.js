import http from 'http';
import https from 'https';
import { URL } from 'url';

// Parse command-line args
const args = process.argv.slice(2);
const targetUrl = args[0] || 'http://localhost:3000';
const concurrentUsers = parseInt(args[1], 10) || 50;
const durationSeconds = parseInt(args[2], 10) || 30;

console.log(`========================================`);
console.log(`Starting Safe GET Load Test`);
console.log(`Target URL: ${targetUrl}`);
console.log(`Concurrent Users: ${concurrentUsers}`);
console.log(`Duration: ${durationSeconds} seconds`);
console.log(`========================================\n`);

const stats = {
  totalRequests: 0,
  success: 0,
  errors: 0,
  latencies: [],
  pathStats: {}
};

// Paths to request
const paths = [
  '/',
  '/login',
  '/dashboard',
  '/privacy.html',
  '/terms.html',
  '/favicon.svg'
];

// Helper to calculate percentiles
function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

// Custom request function with gzip headers
function makeRequest(urlStr) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'LoadTesterSafe/1.0'
      },
      agent: false // Avoid connection pooling limits in benchmark
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const latency = Date.now() - start;
        resolve({
          status: res.statusCode,
          latency,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - start;
      resolve({
        status: 0,
        latency,
        success: false,
        error: err.message
      });
    });

    req.end();
  });
}

// Discover hashed JS/CSS assets dynamically from the landing page
async function discoverAssets() {
  console.log(`Discovering production bundle assets from target landing page...`);
  try {
    const res = await makeRequest(targetUrl);
    // Request landing page to search for JS/CSS assets
    const client = targetUrl.startsWith('https') ? https : http;
    
    const pageHtml = await new Promise((resolve, reject) => {
      const req = client.get(targetUrl, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
    });

    // Match static assets in script/link tags
    const jsMatches = pageHtml.matchAll(/src="\/assets\/index-[a-zA-Z0-9_\-]+\.js"/g);
    const cssMatches = pageHtml.matchAll(/href="\/assets\/index-[a-zA-Z0-9_\-]+\.css"/g);

    for (const match of jsMatches) {
      const assetPath = match[0].substring(5, match[0].length - 1);
      if (!paths.includes(assetPath)) {
        paths.push(assetPath);
        console.log(`  Found JS asset: ${assetPath}`);
      }
    }
    for (const match of cssMatches) {
      const assetPath = match[0].substring(6, match[0].length - 1);
      if (!paths.includes(assetPath)) {
        paths.push(assetPath);
        console.log(`  Found CSS asset: ${assetPath}`);
      }
    }
  } catch (err) {
    console.warn(`Could not auto-discover dynamic assets (is target server running?): ${err.message}`);
  }
}

// Single worker loop
async function runWorker(workerId, endTime) {
  while (Date.now() < endTime) {
    // Select path randomly
    const path = paths[Math.floor(Math.random() * paths.length)];
    const url = `${targetUrl.replace(/\/$/, '')}${path}`;
    
    const result = await makeRequest(url);
    
    stats.totalRequests++;
    if (result.success) {
      stats.success++;
      stats.latencies.push(result.latency);
      
      if (!stats.pathStats[path]) {
        stats.pathStats[path] = { success: 0, total: 0, latencies: [] };
      }
      stats.pathStats[path].success++;
      stats.pathStats[path].total++;
      stats.pathStats[path].latencies.push(result.latency);
    } else {
      stats.errors++;
      if (!stats.pathStats[path]) {
        stats.pathStats[path] = { success: 0, total: 0, latencies: [] };
      }
      stats.pathStats[path].total++;
    }
  }
}

// Main coordinator
async function run() {
  await discoverAssets();
  console.log(`Paths to be benchmarked:`, paths);
  console.log(`\nStarting load test workers...`);

  const startTime = Date.now();
  const endTime = startTime + durationSeconds * 1000;
  
  const workers = [];
  for (let i = 0; i < concurrentUsers; i++) {
    workers.push(runWorker(i, endTime));
  }

  await Promise.all(workers);
  const actualDurationMs = Date.now() - startTime;
  const actualDurationSec = actualDurationMs / 1000;
  
  const rps = (stats.totalRequests / actualDurationSec).toFixed(2);
  const errorRate = ((stats.errors / stats.totalRequests) * 100).toFixed(2);

  console.log(`\n========================================`);
  console.log(`LOAD TEST RESULTS`);
  console.log(`========================================`);
  console.log(`Duration:          ${actualDurationSec.toFixed(2)} seconds`);
  console.log(`Total Requests:    ${stats.totalRequests}`);
  console.log(`Successful:        ${stats.success}`);
  console.log(`Failed/Error:      ${stats.errors}`);
  console.log(`Error Rate:        ${errorRate}%`);
  console.log(`Requests/Sec:      ${rps}`);
  console.log(`----------------------------------------`);
  console.log(`Latency statistics (overall):`);
  
  if (stats.latencies.length > 0) {
    const sum = stats.latencies.reduce((a, b) => a + b, 0);
    const avg = (sum / stats.latencies.length).toFixed(2);
    const p50 = getPercentile(stats.latencies, 50);
    const p95 = getPercentile(stats.latencies, 95);
    const p99 = getPercentile(stats.latencies, 99);
    const max = Math.max(...stats.latencies);
    
    console.log(`  Average Latency: ${avg} ms`);
    console.log(`  P50 Latency:     ${p50} ms`);
    console.log(`  P95 Latency:     ${p95} ms`);
    console.log(`  P99 Latency:     ${p99} ms`);
    console.log(`  Max Latency:     ${max} ms`);
  } else {
    console.log(`  No successful requests recorded.`);
  }

  console.log(`----------------------------------------`);
  console.log(`Path Breakdown:`);
  
  for (const path of Object.keys(stats.pathStats)) {
    const pathData = stats.pathStats[path];
    const pathErrorRate = (((pathData.total - pathData.success) / pathData.total) * 100).toFixed(2);
    const pathSum = pathData.latencies.reduce((a, b) => a + b, 0);
    const pathAvg = pathData.latencies.length > 0 ? (pathSum / pathData.latencies.length).toFixed(2) : 'N/A';
    const pathP95 = pathData.latencies.length > 0 ? getPercentile(pathData.latencies, 95) : 'N/A';
    
    console.log(`  ${path}:`);
    console.log(`    Total:   ${pathData.total}`);
    console.log(`    Errors:  ${pathData.total - pathData.success} (${pathErrorRate}%)`);
    console.log(`    Avg:     ${pathAvg} ms`);
    console.log(`    P95:     ${pathP95} ms`);
  }
  console.log(`========================================\n`);
}

run().catch(console.error);
