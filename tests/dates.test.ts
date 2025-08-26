import { expect, it, vi } from 'vitest';
import { delayDisplay, relativeTimeDisplay, timestampToLocalDatetime } from '../src/dates';

it('shows localized datetime', () => {
  expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'en-US')).toBe(
    'Saturday, 2/10/24, 2:30 PM',
  );
  expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'fr-FR')).toBe('samedi 10/02/24 14:30');
});

it('shows relative time', () => {
  vi.setSystemTime(new Date(2000, 1, 1));

  expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 0, 1).getTime())).toBe('in 1 second');
  expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 0, 2).getTime())).toBe('in 2 seconds');

  expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 45, 0).getTime())).toBe('in 45 minutes');
  expect(relativeTimeDisplay(new Date(2000, 1, 1, 1, 0, 0).getTime())).toBe('in 1 hour');

  expect(relativeTimeDisplay(new Date(2000, 1, 3, 0, 0, 0).getTime())).toBe('in 2 days');
  expect(relativeTimeDisplay(new Date(2000, 1, 22, 0, 0, 0).getTime())).toBe('in 3 weeks');

  expect(relativeTimeDisplay(new Date(2000, 1, 2).getTime())).toBe('tomorrow');
  expect(relativeTimeDisplay(new Date(1999, 12, 31).getTime())).toBe('yesterday');

  expect(relativeTimeDisplay(new Date(1999, 12, 15).getTime())).toBe('3 weeks ago');
});

it('computes delay value', () => {
  expect(delayDisplay(1)).toBe('1 second');
  expect(delayDisplay(15)).toBe('15 seconds');
  expect(delayDisplay(75)).toBe('1 minute 15 seconds');
});
