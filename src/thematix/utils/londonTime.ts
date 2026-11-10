/**
 * Utilities for Europe/London timezone (Midnight rollover at 00:00 London time)
 */

export function getLondonDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // returns 'YYYY-MM-DD'
  } catch {
    // Fallback
    return date.toISOString().split('T')[0];
  }
}

export function getMsUntilNextLondonMidnight(): number {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const partObj: Record<string, number> = {};
    parts.forEach((p) => {
      if (p.type !== 'literal') {
        partObj[p.type] = parseInt(p.value, 10);
      }
    });

    let hour = partObj.hour || 0;
    if (hour === 24) hour = 0;
    const minute = partObj.minute || 0;
    const second = partObj.second || 0;

    const secondsPassedToday = hour * 3600 + minute * 60 + second;
    const totalSecondsInDay = 86400;
    const secondsLeft = totalSecondsInDay - secondsPassedToday;

    return Math.max(0, secondsLeft * 1000);
  } catch {
    // Fallback: UTC midnight
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    return Math.max(0, tomorrow.getTime() - now.getTime());
  }
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

export function formatDayString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
