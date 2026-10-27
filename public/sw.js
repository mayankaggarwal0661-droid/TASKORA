// Taskora — Service Worker v2.1.0
// Robust background Web Push, closed-browser delivery, action buttons, and safe update lifecycle

const SW_VERSION = '2.1.0';
const CACHE_NAME = `taskora-shell-${SW_VERSION}`;

// Only cache static application shell assets — NEVER cache private task data
const SHELL_URLS = [
  '/',
  '/dashboard',
  '/tasks',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  // Auto activate new service worker in development/testing
  self.skipWaiting();
});

// ─── Activate & Cache Cleanup ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Message Handling (Skip Waiting & Control) ──────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Fetch Strategy (Network-first for navigation, Cache-first for assets) ──
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests within same origin
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // API endpoints: Always network-only, NEVER cached
  if (request.url.includes('/api/')) {
    return;
  }

  // Navigation requests: Network first with fallback to shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/dashboard').then((cached) => cached || caches.match('/') || fetch(request))
      )
    );
    return;
  }

  // Static assets: Cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// ─── Web Push Receiver ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Taskora Reminder',
    body: 'You have an upcoming priority scheduled.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'taskora-reminder',
    url: '/dashboard',
    taskId: null,
    silent: false,
    requireInteraction: false,
    snoozeMinutes: 10,
    action: 'reminder',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || (payload.taskId ? `taskora-task-${payload.taskId}` : 'taskora-reminder'),
    renotify: true,
    vibrate: [150, 60, 150, 60, 250],
    silent: payload.silent === true,
    requireInteraction: payload.requireInteraction === true,
    data: {
      url: payload.url || (payload.taskId ? `/tasks?taskId=${payload.taskId}` : '/dashboard'),
      taskId: payload.taskId || null,
      snoozeMinutes: payload.snoozeMinutes || 10,
      deliveredAt: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open Task' },
      { action: 'snooze', title: '⏱ Snooze 10m' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// ─── Notification Click Handling ────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { action } = event;
  const { url, taskId, snoozeMinutes } = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  // Handle Snooze action: works even if the browser window was closed
  if (action === 'snooze') {
    const snoozePromise = (async () => {
      if (taskId) {
        try {
          await fetch('/api/reminders/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'snooze',
              taskId,
              snoozeMinutes: snoozeMinutes || 10,
              userId: 'sw-action',
            }),
          });
        } catch (e) {
          console.warn('[Taskora SW] Server snooze failed, notifying clients:', e);
        }
      }

      // Notify any open window tabs
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({
          type: 'TASKORA_SNOOZE',
          taskId,
          snoozeMinutes: snoozeMinutes || 10,
        });
      }
    })();

    event.waitUntil(snoozePromise);
    return;
  }

  // Handle Open action or notification body click: navigate to task
  const targetUrl = url || (taskId ? `/tasks?taskId=${taskId}` : '/dashboard');

  const navigationPromise = (async () => {
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    // Check if a Taskora window is already open
    for (const client of windowClients) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        client.postMessage({
          type: 'TASKORA_NAVIGATE',
          url: targetUrl,
          taskId: taskId || null,
        });
        if ('navigate' in client) {
          await client.navigate(targetUrl);
        }
        return client.focus();
      }
    }

    // No window open: open new window to target URL
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })();

  event.waitUntil(navigationPromise);
});

// ─── Push Subscription Change (Renewal) ──────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  const renewalPromise = (async () => {
    try {
      const applicationServerKey = event.oldSubscription?.options?.applicationServerKey;
      const newSubscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Synchronize new subscription with server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: newSubscription.toJSON(),
          userId: 'renewed-subscription',
          userAgent: self.navigator.userAgent,
        }),
      });

      // Inform active clients
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({
          type: 'TASKORA_SUBSCRIPTION_CHANGED',
          subscription: newSubscription.toJSON(),
        });
      }
    } catch (err) {
      console.warn('[Taskora SW] Push subscription renewal failed:', err);
    }
  })();

  event.waitUntil(renewalPromise);
});
