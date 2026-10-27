// Local development cron scheduler runner
// Simulates Vercel Cron or GitHub Actions in local development
// Run: node scripts/dev-scheduler-runner.js

const http = require('http');

const PORT = process.env.PORT || 3000;
const CRON_SECRET = process.env.CRON_SECRET || 'taskora-cron-dev-secret-change-in-production';
const INTERVAL_MS = 30 * 1000; // Tick every 30 seconds

console.log('⏰ [Taskora Dev Scheduler] Starting local runner...');
console.log(`⏰ Target: http://localhost:${PORT}/api/cron/send-reminders`);
console.log(`⏰ Interval: ${INTERVAL_MS / 1000} seconds\n`);

async function tick() {
  const url = `http://localhost:${PORT}/api/cron/send-reminders?secret=${CRON_SECRET}`;

  http.get(url, (res) => {
    let raw = '';
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(raw);
        const time = new Date().toLocaleTimeString();
        if (json.total > 0 || (json.results && json.results.length > 0)) {
          console.log(`[${time}] 🔔 Processed ${json.total} reminder(s):`, json.results);
        } else {
          console.log(`[${time}] 💤 Checked queue — no reminders due.`);
        }
      } catch {
        console.log(`[${new Date().toLocaleTimeString()}] Status ${res.statusCode}: ${raw.slice(0, 100)}`);
      }
    });
  }).on('error', (err) => {
    console.warn(`[${new Date().toLocaleTimeString()}] Dev server not reachable at http://localhost:${PORT} (${err.message})`);
  });
}

// Initial run
tick();
setInterval(tick, INTERVAL_MS);
