/**
 * POST /api/push/send-test
 * Dispatches an immediate test push notification.
 * Targets a specific device endpoint OR all active registered devices for a userId.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readStore,
  getSubscriptionsByUser,
  deactivateSubscription,
  PushSubscriptionRecord,
} from '@/lib/push-store';
import { sendPushToSubscription } from '@/lib/push-sender';

export async function POST(req: NextRequest) {
  try {
    const { endpoint, userId } = (await req.json()) as {
      endpoint?: string;
      userId?: string;
    };

    if (!endpoint && !userId) {
      return NextResponse.json(
        { error: 'Provide either an endpoint or a userId.' },
        { status: 400 }
      );
    }

    const store = readStore();
    let targetSubscriptions: PushSubscriptionRecord[] = [];

    if (endpoint) {
      const sub = store.subscriptions.find((s) => s.endpoint === endpoint && s.isActive);
      if (sub) targetSubscriptions.push(sub);
    } else if (userId) {
      targetSubscriptions = getSubscriptionsByUser(userId);
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        {
          error:
            'No active push subscription found. Please click "Enable Notifications" first to subscribe this device.',
        },
        { status: 404 }
      );
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const subscription of targetSubscriptions) {
      const result = await sendPushToSubscription(subscription, {
        title: '✅ Taskora — Push Notifications Active',
        body: 'Scheduled reminders will be delivered even when your browser is closed.',
        url: '/notifications',
        tag: 'taskora-test',
        requireInteraction: false,
        action: 'test',
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(result.error || 'Failed');
        if (result.subscriptionExpired) {
          deactivateSubscription(subscription.endpoint);
        }
      }
    }

    if (sent > 0) {
      return NextResponse.json({
        success: true,
        sentCount: sent,
        failedCount: failed,
        message: `Test notification sent successfully to ${sent} device(s) via Web Push.`,
      });
    }

    return NextResponse.json(
      {
        error: `Push delivery failed: ${errors.join(', ')}`,
        sentCount: 0,
        failedCount: failed,
      },
      { status: 502 }
    );
  } catch (err) {
    console.error('[/api/push/send-test] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
