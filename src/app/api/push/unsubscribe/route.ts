/**
 * POST /api/push/unsubscribe
 * Mark a subscription as inactive. Called when the user disables notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { deactivateSubscription } from '@/lib/push-store';

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json() as { endpoint?: string };

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint.' }, { status: 400 });
    }

    deactivateSubscription(endpoint);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/push/unsubscribe] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
