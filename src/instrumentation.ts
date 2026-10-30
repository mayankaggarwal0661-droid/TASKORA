export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startReminderSchedulerWorker } = await import('@/lib/scheduler-worker');
    startReminderSchedulerWorker(30_000);
  }
}

