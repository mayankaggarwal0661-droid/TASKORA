/**
 * /api/push/devices
 * Manage multi-device push registrations for a user account.
 *
 * GET: Lists all registered devices for a userId
 * DELETE: Deactivates or removes a registered device
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSubscriptionsForUser,
  deleteSubscriptionById,
  deactivateSubscriptionById,
} from '@/lib/push-store';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
  }

  const subscriptions = getAllSubscriptionsForUser(userId);

  // Return safe sanitised view — NEVER expose raw encryption keys or full endpoints
  const devices = subscriptions.map((sub) => ({
    id: sub.id,
    deviceName: sub.deviceName || 'Web Browser',
    deviceType: sub.deviceType || 'desktop',
    createdAt: sub.createdAt,
    lastUsedAt: sub.lastUsedAt,
    isActive: sub.isActive,
    endpointMask: `...${sub.endpoint.slice(-16)}`,
  }));

  return NextResponse.json({
    userId,
    count: devices.length,
    activeCount: devices.filter((d) => d.isActive).length,
    devices,
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, userId, hardDelete } = (await req.json()) as {
      id?: string;
      userId?: string;
      hardDelete?: boolean;
    };

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: id, userId.' },
        { status: 400 }
      );
    }

    let success = false;
    if (hardDelete) {
      success = deleteSubscriptionById(id, userId);
    } else {
      success = deactivateSubscriptionById(id, userId);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Device subscription not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Device removed.' : 'Device subscription deactivated.',
    });
  } catch (err) {
    console.error('[/api/push/devices DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
