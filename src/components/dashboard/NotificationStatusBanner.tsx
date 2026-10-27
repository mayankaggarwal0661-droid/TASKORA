'use client';

import React from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export function NotificationStatusBanner() {
  const {
    notificationSettings,
    requestNotificationPermission,
    sendTestNotification
  } = useTaskora();

  const isGranted = notificationSettings.permission === 'granted';
  const isDenied = notificationSettings.permission === 'denied';

  return (
    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
      isGranted
        ? 'bg-[#E8F0E9] border-[#557B5C]/30 text-[#403B34]'
        : isDenied
        ? 'bg-[#F5E6E5] border-[#B95750]/30 text-[#403B34]'
        : 'bg-white border-[#E7E0D5] text-[#403B34] shadow-sm'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isGranted
            ? 'bg-[#D2E4D4] text-[#557B5C]'
            : isDenied
            ? 'bg-[#F0D0CE] text-[#B95750]'
            : 'bg-[#EAF0E5] text-[#718368]'
        }`}>
          {isGranted ? (
            <ShieldCheck className="w-5 h-5" />
          ) : isDenied ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5 animate-bounce" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#403B34]">
              {isGranted
                ? 'Desktop Reminders Active'
                : isDenied
                ? 'Notification Permission Blocked'
                : 'Enable Browser Reminders'}
            </h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded-full ${
              isGranted
                ? 'bg-[#D2E4D4] text-[#557B5C] border border-[#557B5C]/30'
                : isDenied
                ? 'bg-[#F0D0CE] text-[#B95750] border border-[#B95750]/30'
                : 'bg-[#F4EBD9] text-[#A97535] border border-[#A97535]/30'
            }`}>
              {notificationSettings.permission}
            </span>
          </div>
          <p className="text-xs text-[#756E64] mt-0.5">
            {isGranted
              ? `You will receive push reminders ${notificationSettings.defaultLeadTime} before tasks are due.`
              : isDenied
              ? 'Permissions are blocked in browser preferences. Please allow notifications in your address bar.'
              : 'Allow Taskora to notify you when tasks are due so you never miss a priority.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        {isGranted ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={sendTestNotification}
            className="text-xs"
          >
            <Bell className="w-3.5 h-3.5 mr-1" />
            Send Test Alert
          </Button>
        ) : isDenied ? (
          <span className="text-xs text-[#B95750] font-medium">
            Blocked in browser
          </span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={requestNotificationPermission}
            className="text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Enable Reminders
          </Button>
        )}
      </div>
    </div>
  );
}
