'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTaskora } from '@/context/TaskoraContext';
import { LeadTimeOption } from '@/types/notification';
import { Button } from '@/components/ui/Button';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';
import {
  isWebPushSupported,
  getCurrentPushSubscription,
  fetchUserDevices,
  removeUserDevice,
  unsubscribeFromWebPush,
  getClientDeviceName,
  getOrCreateUserId,
} from '@/features/notifications/web-push-client';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Moon,
  Volume2,
  Sparkles,
  ShieldCheck,
  Send,
  Smartphone,
  Monitor,
  Trash2,
  RefreshCw,
  Info,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export default function NotificationSettingsPage() {
  const {
    notificationSettings,
    updateNotificationSettings,
    requestNotificationPermission,
    sendTestNotification,
    addToast,
  } = useTaskora();

  const [isPushActive, setIsPushActive] = useState<boolean>(false);
  const [pushSupported, setPushSupported] = useState<boolean>(true);
  const [currentEndpointMask, setCurrentEndpointMask] = useState<string>('');
  const [devices, setDevices] = useState<
    Array<{
      id: string;
      deviceName: string;
      deviceType: 'desktop' | 'mobile' | 'tablet';
      createdAt: string;
      lastUsedAt: string;
      isActive: boolean;
      endpointMask: string;
    }>
  >([]);
  const [serverStatus, setServerStatus] = useState<{
    pendingRemindersCount: number;
    lastDelivery: { attemptedAt: string; success: boolean; error?: string } | null;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);

  const isGranted = notificationSettings.permission === 'granted';
  const isDenied = notificationSettings.permission === 'denied';

  // Check Web Push support and current subscription state
  const loadDeviceData = useCallback(async () => {
    setIsRefreshingDevices(true);
    const supported = isWebPushSupported();
    setPushSupported(supported);

    if (supported) {
      const sub = await getCurrentPushSubscription();
      setIsPushActive(!!sub);
      if (sub) {
        setCurrentEndpointMask(`...${sub.endpoint.slice(-16)}`);
      } else {
        setCurrentEndpointMask('');
      }

      // Fetch all registered devices for user
      const devRes = await fetchUserDevices();
      setDevices(devRes.devices);

      // Fetch server status
      try {
        const userId = getOrCreateUserId();
        const res = await fetch(`/api/push/status?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setServerStatus({
            pendingRemindersCount: data.pendingRemindersCount || 0,
            lastDelivery: data.lastDelivery,
          });
        }
      } catch {}
    }
    setIsRefreshingDevices(false);
  }, []);

  useEffect(() => {
    loadDeviceData();
  }, [loadDeviceData, notificationSettings.permission]);

  const handleTogglePush = async () => {
    if (isPushActive) {
      const res = await unsubscribeFromWebPush();
      if (res.success) {
        setIsPushActive(false);
        addToast({
          title: 'Device Unsubscribed',
          message: 'Web Push alerts disabled for this device.',
          type: 'info',
        });
        loadDeviceData();
      }
    } else {
      await requestNotificationPermission();
      loadDeviceData();
    }
  };

  const handleTestNotification = async () => {
    if (isTesting) return;
    setIsTesting(true);
    try {
      await sendTestNotification();
    } finally {
      setIsTesting(false);
      loadDeviceData();
    }
  };

  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    const success = await removeUserDevice(deviceId);
    if (success) {
      addToast({
        title: 'Device Removed',
        message: `${deviceName} was removed from notifications.`,
        type: 'info',
      });
      loadDeviceData();
    } else {
      addToast({
        title: 'Action Failed',
        message: 'Could not remove device.',
        type: 'error',
      });
    }
  };

  const leadTimeOptions: { key: LeadTimeOption; label: string; desc: string }[] = [
    { key: 'at_time', label: 'At event time', desc: 'Notify exactly when due' },
    { key: '5m', label: '5 minutes before', desc: 'Quick heads-up warning' },
    { key: '15m', label: '15 minutes before', desc: 'Recommended default' },
    { key: '30m', label: '30 minutes before', desc: 'Preparation buffer' },
    { key: '1h', label: '1 hour before', desc: 'Deep work lead time' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Push Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            Notification Settings
          </h1>
          <p className="text-sm text-[#756E64] mt-1">
            Native cross-device Web Push reminders, lead times, quiet hours, and multi-device management.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleTestNotification}
          disabled={isTesting}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          {isTesting ? (
            <RefreshCw className="w-4 h-4 text-[#718368] animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-[#718368]" />
          )}
          <span>{isTesting ? 'Sending Push...' : 'Send Test Notification'}</span>
        </Button>
      </div>

      {/* Multi-tier Diagnostics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tier 1: Browser Permission */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E0D5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider mb-1">
            Browser Permission
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isGranted ? 'bg-[#557B5C]' : isDenied ? 'bg-[#B95750]' : 'bg-[#A97535]'
              }`}
            />
            <span className="text-sm font-bold text-[#403B34] capitalize">
              {notificationSettings.permission}
            </span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-1">
            {isGranted ? 'System allowed' : isDenied ? 'Permission blocked' : 'Not yet requested'}
          </p>
        </div>

        {/* Tier 2: Service Worker & Push API */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E0D5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider mb-1">
            Web Push Subscription
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPushActive ? 'bg-[#557B5C]' : 'bg-[#968D81]'
              }`}
            />
            <span className="text-sm font-bold text-[#403B34]">
              {isPushActive ? 'Active on Device' : 'Inactive'}
            </span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-1 truncate">
            {isPushActive ? `Endpoint ${currentEndpointMask}` : 'Click below to subscribe'}
          </p>
        </div>

        {/* Tier 3: Backend Scheduler */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E0D5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider mb-1">
            Server Scheduler
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#557B5C]" />
            <span className="text-sm font-bold text-[#403B34]">
              {serverStatus ? `${serverStatus.pendingRemindersCount} Scheduled` : 'Active'}
            </span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-1">Durable queue ready</p>
        </div>

        {/* Tier 4: Server Delivery Status */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E0D5] shadow-xs">
          <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider mb-1">
            Last Delivery Attempt
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverStatus?.lastDelivery?.success ? 'bg-[#557B5C]' : 'bg-[#968D81]'
              }`}
            />
            <span className="text-sm font-bold text-[#403B34]">
              {serverStatus?.lastDelivery
                ? serverStatus.lastDelivery.success
                  ? 'Delivered'
                  : 'Retry / Error'
                : 'No recent attempts'}
            </span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-1">
            {serverStatus?.lastDelivery
              ? new Date(serverStatus.lastDelivery.attemptedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Standby'}
          </p>
        </div>
      </div>

      {/* Primary Permission & Subscription Toggle Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isPushActive
            ? 'bg-[#E8F0E9] border-[#557B5C]/25'
            : isDenied
            ? 'bg-[#F5E6E5] border-[#B95750]/25'
            : 'bg-white border-[#E7E0D5] shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isPushActive
                  ? 'bg-[#D2E4D4] text-[#557B5C]'
                  : isDenied
                  ? 'bg-[#F0D0CE] text-[#B95750]'
                  : 'bg-[#EAF0E5] text-[#718368]'
              }`}
            >
              {isPushActive ? <ShieldCheck className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#403B34]">
                  Native Web Push (Closed-Browser Delivery)
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    isPushActive
                      ? 'bg-[#D2E4D4] text-[#557B5C] border border-[#557B5C]/30'
                      : isDenied
                      ? 'bg-[#F0D0CE] text-[#B95750] border border-[#B95750]/30'
                      : 'bg-[#F0EBE2] text-[#968D81] border border-[#D9D0C3]'
                  }`}
                >
                  {isPushActive ? 'Subscribed' : notificationSettings.permission}
                </span>
              </div>
              <p className="text-xs text-[#756E64] mt-1 max-w-lg leading-relaxed">
                {isPushActive
                  ? `This device (${getClientDeviceName()}) is enrolled in Taskora's durable Web Push scheduler. Notifications fire even when the tab and browser are closed.`
                  : isDenied
                  ? 'Notifications are blocked in your browser preferences. To receive reminders, click the lock/settings icon in your address bar and toggle Notifications to "Allow".'
                  : 'Subscribe this device to receive scheduled task reminders and advance alerts, even when Taskora is completely closed.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {!isPushActive && !isDenied && (
              <Button variant="primary" size="sm" onClick={handleTogglePush}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Enable Push Notifications
              </Button>
            )}
            {isPushActive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTogglePush}
                className="text-xs text-[#756E64]"
              >
                Unsubscribe This Device
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Device Management Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#718368]" />
              Registered Devices & Subscriptions
            </h3>
            <p className="text-xs text-[#756E64] mt-0.5">
              Devices registered to your user account that will receive reminder pushes
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadDeviceData}
            disabled={isRefreshingDevices}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#718368] ${isRefreshingDevices ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {devices.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#FBF9F5] border border-dashed border-[#E7E0D5]">
            <Smartphone className="w-8 h-8 text-[#968D81] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#403B34]">No Devices Subscribed Yet</p>
            <p className="text-[11px] text-[#756E64] mt-1 max-w-md mx-auto">
              Enable notifications on your desktop laptop and your mobile phone to receive alerts
              seamlessly across both environments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((device) => {
              const isCurrent =
                currentEndpointMask && device.endpointMask.includes(currentEndpointMask.slice(-8));

              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-xl border transition-all ${
                    device.isActive
                      ? 'bg-[#FBF9F5] border-[#E7E0D5]'
                      : 'bg-neutral-50 border-neutral-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center shrink-0">
                        {device.deviceType === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#403B34]">{device.deviceName}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#D2E4D4] text-[#557B5C]">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#968D81] mt-0.5">
                          Registered {new Date(device.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-[#968D81] font-mono mt-0.5">
                          ID: {device.id.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDevice(device.id, device.deviceName)}
                      title="Remove device"
                      className="p-1.5 text-[#968D81] hover:text-[#B95750] rounded-lg hover:bg-[#F5E6E5] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PWA Installation Card */}
      <PwaInstallPrompt inline />

      {/* Advance Reminder Lead Time */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#718368]" />
            Default Advance Lead Time
          </h3>
          <p className="text-xs text-[#756E64] mt-0.5">
            How early to dispatch the advance reminder before a task reaches its scheduled due time
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {leadTimeOptions.map((opt) => {
            const isSelected = notificationSettings.defaultLeadTime === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => updateNotificationSettings({ defaultLeadTime: opt.key })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF0E5] border-[#718368]/40 shadow-xs'
                    : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#D9D0C3]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#403B34]' : 'text-[#756E64]'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#718368]" />}
                </div>
                <p className="text-[11px] text-[#968D81]">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#718368]" />
              Quiet Hours (Do Not Disturb)
            </h3>
            <p className="text-xs text-[#756E64] mt-0.5">
              Mute alerts during sleep or focused downtime in your local timezone
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.quietHoursEnabled}
              onChange={(e) =>
                updateNotificationSettings({ quietHoursEnabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E7E0D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#718368] border border-[#D9D0C3]" />
          </label>
        </div>

        {notificationSettings.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#756E64] mb-1">Start Time</label>
              <input
                type="time"
                value={notificationSettings.quietHoursStart}
                onChange={(e) =>
                  updateNotificationSettings({ quietHoursStart: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#756E64] mb-1">End Time</label>
              <input
                type="time"
                value={notificationSettings.quietHoursEnd}
                onChange={(e) => updateNotificationSettings({ quietHoursEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Morning Digest & Sound Toggles */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        {/* Morning Brief */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
          <div>
            <h4 className="text-sm font-bold text-[#403B34] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A97535]" />
              Daily Morning Agenda Briefing
            </h4>
            <p className="text-xs text-[#756E64] mt-0.5">
              Consolidated briefing of today&apos;s scheduled priorities at{' '}
              {notificationSettings.dailyDigestTime}
            </p>
          </div>
          <input
            type="time"
            value={notificationSettings.dailyDigestTime}
            onChange={(e) => updateNotificationSettings({ dailyDigestTime: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368] focus:outline-none"
          />
        </div>

        {/* Audio Chimes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[#403B34] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#718368]" />
              Audio Chimes on Completion & Alerts
            </h4>
            <p className="text-xs text-[#756E64] mt-0.5">
              Current chime:{' '}
              <strong className="text-[#403B34] capitalize">
                {notificationSettings.soundId ? notificationSettings.soundId.replace('-', ' ') : 'Soft Chime'}
              </strong>
              {' • '}
              <Link
                href="/settings#notification-sounds"
                className="text-[#718368] font-semibold hover:underline"
              >
                Customize Sound Library in Settings →
              </Link>
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notificationSettings.soundAlerts}
              onChange={(e) => updateNotificationSettings({ soundAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E7E0D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#718368] border border-[#D9D0C3]" />
          </label>
        </div>
      </div>

      {/* Troubleshooting & Platform Guidance Card */}
      <div className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#E7E0D5] shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-[#403B34] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#718368]" />
          Push Delivery & Platform Guide
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#756E64] leading-relaxed">
          <div>
            <h5 className="font-semibold text-[#403B34] mb-1">Desktop (Windows / macOS / Linux)</h5>
            <p>
              Ensure Windows Focus Assist / Do Not Disturb or macOS Notification Center is not
              silencing notifications from your browser. In Chrome/Edge, keep background apps enabled
              for closed-browser wakeups.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-[#403B34] mb-1">Mobile (iOS & Android)</h5>
            <p>
              On iOS 16.4+, Apple requires Taskora to be installed to the Home Screen (via Safari
              Share → Add to Home Screen) before push permissions can be granted. On Android, verify
              battery optimization is not suspending background push services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
