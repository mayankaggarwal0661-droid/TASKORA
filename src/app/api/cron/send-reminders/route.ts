/**
 * GET & POST /api/cron/send-reminders
 *
 * DURABLE SCHEDULER ENDPOINT:
 * Called by external cron services (cron-job.org, GitHub Actions, Vercel Cron)
 * or local runner. Uses atomic claims to prevent duplicate dispatch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processDueReminders } from '@/lib/scheduler-worker';

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const secretParam = req.nextUrl.searchParams.get('secret');

  if (!CRON_SECRET) {
    // Development mode without secret configured
    return true;
  }

  if (authHeader === `Bearer ${CRON_SECRET}`) return true;
  if (secretParam === CRON_SECRET) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const respectQuietHours = req.nextUrl.searchParams.get('respectQuietHours') === 'true';
  const lookaheadMs = Number(req.nextUrl.searchParams.get('lookaheadMs')) || 90_000;

  const result = await processDueReminders(respectQuietHours, lookaheadMs);

  return NextResponse.json({
    checked: true,
    processedAt: result.processedAt,
    total: result.totalClaimed,
    sent: result.sentCount,
    failed: result.failedCount,
    results: result.results,
    cleanedExpiredCount: result.cleanedExpiredCount,
    message:
      result.totalClaimed === 0
        ? 'No pending reminders due.'
        : `Processed ${result.totalClaimed} reminder(s): ${result.sentCount} sent, ${result.failedCount} failed.`,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
