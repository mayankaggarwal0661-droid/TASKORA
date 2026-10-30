/**
 * POST /api/reminders/ack
 * Records device-level delivery confirmation from the Service Worker or client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordDeviceAck } from '@/lib/push-store';

export async function POST(req: NextRequest) {
  try {
    const { reminderId, subscriptionId } = (await req.json().catch(() => ({}))) as {
      reminderId?: string;
      subscriptionId?: string;
    };

    if (!reminderId) {
      return NextResponse.json({ error: 'Missing reminderId.' }, { status: 400 });
    }

    const recorded = recordDeviceAck(reminderId, subscriptionId);
    return NextResponse.json({ success: true, acknowledged: recorded, reminderId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error.' },
      { status: 500 }
    );
  }
}

