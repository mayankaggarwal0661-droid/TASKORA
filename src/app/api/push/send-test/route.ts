/**
 * POST /api/push/send-test
 * Dispatches an immediate test push notification.
 * Targets a specific device endpoint, subscription, or all active registered devices for a userId.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readStore,
  getSubscriptionsByUser,
  deactivateSubscription,
  upsertSubscription,
  PushSubscriptionRecord,
} from '@/lib/push-store';
import { sendPushToSubscription } from '@/lib/push-sender';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      endpoint?: string;
      userId?: string;
      subscription?: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      deviceName?: string;
    };

    const { endpoint, userId, subscription, deviceName } = body;

    if (!endpoint && !userId && !subscription) {
      return NextResponse.json(
        { error: 'Provide either an endpoint, subscription, or userId.' },
        { status: 400 }
      );
    }

    const store = readStore();
    let targetSubscriptions: PushSubscriptionRecord[] = [];

    // If client supplied full subscription object, ensure it's registered
    if (subscription?.endpoint && subscription?.keys?.p256dh && subscription?.keys?.auth && userId) {
      const endpointHash = crypto
        .createHash('sha256')
        .update(subscription.endpoint)
        .digest('hex')
        .slice(0, 16);
      const subRecord = upsertSubscription({
        id: `sub-${endpointHash}`,
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.headers.get('user-agent') || 'Browser',
        deviceName,
      });
      targetSubscriptions.push(subRecord);
    } else {
      if (endpoint) {
        const sub = store.subscriptions.find((s) => s.endpoint === endpoint && s.isActive);
        if (sub) targetSubscriptions.push(sub);
      }
      if (targetSubscriptions.length === 0 && userId) {
        targetSubscriptions = getSubscriptionsByUser(userId);
      }
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        {
          error:
            'No active push subscription found on server. Please click "Enable Notifications" first to register this browser.',
        },
        { status: 404 }
      );
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of targetSubscriptions) {
      const result = await sendPushToSubscription(sub, {
        title: '✅ Taskora — Push Notifications Active',
        body: 'Scheduled reminders will be delivered even when your browser is closed.',
        url: '/notifications',
        tag: 'taskora-test-notification',
        requireInteraction: false,
        action: 'test',
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(result.error || 'Failed');
        if (result.subscriptionExpired) {
          deactivateSubscription(sub.endpoint);
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error.' },
      { status: 500 }
    );
  }
}
