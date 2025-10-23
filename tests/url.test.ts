import { expect, it } from 'vitest';
import { getQueryParam } from '../src/url';

it('gets code from url', () => {
  const url = 'https://example.com?code=liu_12345&state=xyz';
  const code = getQueryParam('code', url);
  expect(code).toBe('liu_12345');
});

it('returns null for non-existent query param', () => {
  const url = 'https://example.com?a=1&b=2';
  const code = getQueryParam('c', url);
  expect(code).toBeNull();
});

it('throws for invalid url', () => {
  const url = 'not-a-valid-url';
  expect(() => getQueryParam('code', url)).toThrowError('Invalid URL');
});
