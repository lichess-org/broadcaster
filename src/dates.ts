export function timestampToLocalDatetime(timestamp?: number, locales?: Intl.LocalesArgument): string {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(locales, {
    weekday: 'long',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function relativeTimeDisplay(timestamp?: number): string {
  if (!timestamp) {
    return '';
  }

  const then = new Date(timestamp).getTime();
  const deltaSeconds = Math.round((then - Date.now()) / 1000);

  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export function delayDisplay(delay?: number): string {
  if (!delay) {
    return '';
  }

  return [
    {
      value: Math.floor(delay / 60),
      label: 'minute',
    },
    {
      value: delay % 60,
      label: 'second',
    },
  ]
    .filter(({ value }) => value > 0)
    .map(({ value, label }) => `${value} ${label}${value > 1 ? 's' : ''}`)
    .join(' ');
}
