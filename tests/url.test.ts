import { expect, it } from 'vitest';
import { getQueryParam } from '../src/url';

it('gets code from url', () => {
  const url = 'https://example.com?code=liu_12345&state=xyz';
  const code = getQueryParam('code', url);
  expect(code).toBe('liu_12345');
});
