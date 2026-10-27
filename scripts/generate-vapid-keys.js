// Script to generate VAPID keys for Web Push
// Run once: node scripts/generate-vapid-keys.js
// Then add the output to your .env.local file

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== TASKORA VAPID KEYS (generated once, store securely) ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@taskora.app`);
console.log('\n============================================================\n');
console.log('IMPORTANT:');
console.log('- NEXT_PUBLIC_VAPID_PUBLIC_KEY is safe to expose to the browser');
console.log('- VAPID_PRIVATE_KEY must NEVER be in client-side code or committed to git');
console.log('- Add .env.local to .gitignore (Next.js does this by default)');
