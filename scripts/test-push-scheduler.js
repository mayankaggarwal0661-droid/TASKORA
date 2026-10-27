/**
 * Taskora Comprehensive Push & Scheduler Automated Test Suite
 * Tests scheduler logic, timezones, DST, multi-device, idempotency, retry backoff,
 * and live API endpoints.
 *
 * Run: node scripts/test-push-scheduler.js
 */

const assert = require('assert');
const crypto = require('crypto');
const http = require('http');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    testsFailed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    testsFailed++;
  }
}

// ─── 1. Pure Scheduler & Timezone Logic ──────────────────────────────────────

function calculateUtcTimestamp(dateStr, timeStr = '09:00', timeZone = 'UTC') {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const approx = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(approx).map((p) => [p.type, p.value])
  );

  const tzYear = Number(parts.year);
  const tzMonth = Number(parts.month);
  const tzDay = Number(parts.day);
  let tzHour = Number(parts.hour);
  if (tzHour === 24) tzHour = 0;
  const tzMin = Number(parts.minute);

  const tzTime = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
  const diff = approx.getTime() - tzTime;
  return approx.getTime() + diff;
}

function calculateNextRecurringDueDate(currentDueDate, recurrence) {
  const [y, m, d] = currentDueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekdays':
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 0 || date.getDay() === 6);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateReminderId(taskId, dueDate, dueTime, leadOffset) {
  const time = dueTime || '09:00';
  const idSource = `${taskId}:${dueDate}:${time}:${leadOffset}`;
  const hash = crypto.createHash('sha256').update(idSource).digest('hex').slice(0, 16);
  return `rem-${taskId}-${hash}`;
}

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const data = raw ? JSON.parse(raw) : {};
            resolve({ status: res.statusCode, data });
          } catch {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

// ─── Main Execution ──────────────────────────────────────────────────────────

async function main() {
  console.log('\n============================================================');
  console.log('🧪 TASKORA WEB PUSH & SCHEDULER AUTOMATED TEST SUITE');
  console.log('============================================================\n');

  console.log('--- SUITE 1: Timezone & Daylight Saving Time (DST) Handling ---');

  runTest('New York Summer (EDT, UTC-4) converts to exact UTC', () => {
    const utcMs = calculateUtcTimestamp('2026-07-15', '14:00', 'America/New_York');
    const iso = new Date(utcMs).toISOString();
    assert.strictEqual(iso, '2026-07-15T18:00:00.000Z');
  });

  runTest('New York Winter (EST, UTC-5) converts to exact UTC', () => {
    const utcMs = calculateUtcTimestamp('2026-01-15', '14:00', 'America/New_York');
    const iso = new Date(utcMs).toISOString();
    assert.strictEqual(iso, '2026-01-15T19:00:00.000Z');
  });

  runTest('London Summer (BST, UTC+1) vs Winter (GMT, UTC+0)', () => {
    const summer = new Date(calculateUtcTimestamp('2026-06-20', '10:00', 'Europe/London')).toISOString();
    const winter = new Date(calculateUtcTimestamp('2026-12-20', '10:00', 'Europe/London')).toISOString();
    assert.strictEqual(summer, '2026-06-20T09:00:00.000Z');
    assert.strictEqual(winter, '2026-12-20T10:00:00.000Z');
  });

  runTest('Kolkata (IST, UTC+5:30) constant offset conversion', () => {
    const utcMs = calculateUtcTimestamp('2026-10-25', '15:30', 'Asia/Kolkata');
    const iso = new Date(utcMs).toISOString();
    assert.strictEqual(iso, '2026-10-25T10:00:00.000Z');
  });

  console.log('\n--- SUITE 2: Recurrence Calculation ---');

  runTest('Daily recurrence advances by 1 day', () => {
    assert.strictEqual(calculateNextRecurringDueDate('2026-10-25', 'daily'), '2026-10-26');
  });

  runTest('Weekdays recurrence skips weekend (Friday -> Monday)', () => {
    // 2026-10-23 is Friday -> should advance to 2026-10-26 Monday
    assert.strictEqual(calculateNextRecurringDueDate('2026-10-23', 'weekdays'), '2026-10-26');
  });

  runTest('Weekly recurrence advances by 7 days', () => {
    assert.strictEqual(calculateNextRecurringDueDate('2026-10-25', 'weekly'), '2026-11-01');
  });

  runTest('Monthly recurrence advances by 1 month', () => {
    assert.strictEqual(calculateNextRecurringDueDate('2026-10-25', 'monthly'), '2026-11-25');
  });

  console.log('\n--- SUITE 3: Idempotency & Deduplication ---');

  runTest('generateReminderId is deterministic for identical task parameters', () => {
    const id1 = generateReminderId('task-100', '2026-10-28', '14:00', '15m');
    const id2 = generateReminderId('task-100', '2026-10-28', '14:00', '15m');
    assert.strictEqual(id1, id2);
    assert.ok(id1.startsWith('rem-task-100-'));
  });

  runTest('Different lead time produces distinct reminder ID', () => {
    const id1 = generateReminderId('task-100', '2026-10-28', '14:00', '15m');
    const id2 = generateReminderId('task-100', '2026-10-28', '14:00', '30m');
    assert.notStrictEqual(id1, id2);
  });

  console.log('\n--- SUITE 4: Live Server API Integration Tests ---');

  const testUserId = `test-user-${Date.now()}`;
  let subDesktopId = '';
  let subMobileId = '';

  await runAsyncTest('POST /api/reminders/schedule schedules a future task reminder', async () => {
    // 2 days from now
    const futureDate = '2026-10-28';
    const res = await request('POST', '/api/reminders/schedule', {
      taskId: 'task-test-autosuite-1',
      taskTitle: 'Automated Test Task 1',
      dueDate: futureDate,
      dueTime: '18:00',
      timezone: 'America/New_York',
      reminder: '15m',
      userId: testUserId,
      action: 'schedule',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.reminderId);
    assert.ok(res.data.reminderAt);
  });

  await runAsyncTest('POST /api/reminders/schedule supports snooze action (+10m)', async () => {
    const res = await request('POST', '/api/reminders/schedule', {
      taskId: 'task-test-autosuite-1',
      action: 'snooze',
      snoozeMinutes: 10,
      userId: testUserId,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.snoozed, true);
    assert.ok(res.data.reminderId);
    assert.ok(res.data.reminderAt);
  });

  await runAsyncTest('POST /api/reminders/schedule handles past reminders gracefully', async () => {
    const res = await request('POST', '/api/reminders/schedule', {
      taskId: 'task-test-past',
      taskTitle: 'Past Task',
      dueDate: '2020-01-01',
      dueTime: '10:00',
      reminder: '15m',
      userId: testUserId,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.skipped, true);
  });

  await runAsyncTest('Multi-device: Register Desktop device subscription', async () => {
    const endpoint = `https://fcm.googleapis.com/fcm/send/fake-desktop-${Date.now()}`;
    const res = await request('POST', '/api/push/subscribe', {
      subscription: {
        endpoint,
        keys: {
          p256dh: 'BNcRdreALRF89GJAw',
          auth: 'tBHItJI5svbQ',
        },
      },
      userId: testUserId,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      deviceName: 'Chrome on Windows',
      deviceType: 'desktop',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.userId, testUserId);
    assert.strictEqual(res.data.deviceType, 'desktop');
    subDesktopId = res.data.subscriptionId;
  });

  await runAsyncTest('Multi-device: Register Mobile device subscription for same user', async () => {
    const endpoint = `https://web.push.apple.com/fake-mobile-${Date.now()}`;
    const res = await request('POST', '/api/push/subscribe', {
      subscription: {
        endpoint,
        keys: {
          p256dh: 'BPhKq91aLmQ93JLa',
          auth: 'wQZ1xM98vTq',
        },
      },
      userId: testUserId,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      deviceName: 'Safari on iPhone',
      deviceType: 'mobile',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.deviceType, 'mobile');
    subMobileId = res.data.subscriptionId;
  });

  await runAsyncTest('GET /api/push/devices retrieves both devices for the user', async () => {
    const res = await request('GET', `/api/push/devices?userId=${encodeURIComponent(testUserId)}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.count, 2);
    assert.strictEqual(res.data.activeCount, 2);
    const types = res.data.devices.map((d) => d.deviceType);
    assert.ok(types.includes('desktop'));
    assert.ok(types.includes('mobile'));
  });

  await runAsyncTest('GET /api/push/status returns correct subscription metrics', async () => {
    const res = await request('GET', `/api/push/status?userId=${encodeURIComponent(testUserId)}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.activeDeviceCount, 2);
    // 2 pending reminders: initial scheduled reminder + snoozed reminder
    assert.strictEqual(res.data.pendingRemindersCount, 2);
  });

  await runAsyncTest('DELETE /api/reminders/schedule cancels reminders for completed/deleted task', async () => {
    const res = await request('DELETE', '/api/reminders/schedule', {
      taskId: 'task-test-autosuite-1',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.cancelled, true);

    // Verify status reflects cancellation
    const statusRes = await request('GET', `/api/push/status?userId=${encodeURIComponent(testUserId)}`);
    assert.strictEqual(statusRes.data.pendingRemindersCount, 0);
  });

  await runAsyncTest('GET /api/cron/send-reminders security: blocks unauthorized requests when secret set', async () => {
    // Request with bad secret should be 401 Unauthorized if secret configured
    const res = await request('GET', '/api/cron/send-reminders?secret=invalid-secret-key-123');
    assert.strictEqual(res.status, 401);
  });

  await runAsyncTest('GET /api/cron/send-reminders succeeds with valid CRON_SECRET', async () => {
    const secret = process.env.CRON_SECRET || 'taskora-cron-dev-secret-change-in-production';
    const res = await request('GET', `/api/cron/send-reminders?secret=${secret}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.checked, true);
  });

  await runAsyncTest('DELETE /api/push/devices removes a device', async () => {
    const res = await request('DELETE', '/api/push/devices', {
      id: subMobileId,
      userId: testUserId,
      hardDelete: true,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    const checkRes = await request('GET', `/api/push/devices?userId=${encodeURIComponent(testUserId)}`);
    assert.strictEqual(checkRes.data.count, 1);
  });

  console.log('\n============================================================');
  console.log(`🏁 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('============================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
