/**
 * POST /api/push/subscribe
 * Register or update a device's Web Push subscription.
 *
 * Requirements:
 * - Multi-device support: allows multiple subscriptions per user account
 * - Captures deviceName and deviceType
 * - Sanitizes and hashes endpoint for stable device ID
 * - Validates VAPID keys presence
 */

import { NextRequest, NextResponse } from 'next/server';
import { upsertSubscription } from '@/lib/push-store';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      subscription: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      userId: string;
      userAgent?: string;
      deviceName?: string;
      deviceType?: 'desktop' | 'mobile' | 'tablet';
    };

    const { subscription, userId, userAgent, deviceName, deviceType } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid PushSubscription: missing endpoint, p256dh, or auth key.' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid userId.' },
        { status: 400 }
      );
    }

    // Deterministic ID for this device subscription based on endpoint hash
    const endpointHash = crypto
      .createHash('sha256')
      .update(subscription.endpoint)
      .digest('hex')
      .slice(0, 16);
    const subscriptionId = `sub-${endpointHash}`;

    const record = upsertSubscription({
      id: subscriptionId,
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent || req.headers.get('user-agent') || 'Unknown',
      deviceName,
      deviceType,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: record.id,
      userId: record.userId,
      deviceName: record.deviceName,
      deviceType: record.deviceType,
      isActive: record.isActive,
    });
  } catch (err) {
    console.error('[/api/push/subscribe] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
