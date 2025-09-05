export function getQueryParam(key: string, url: string): string | null {
  const params = new URL(url).searchParams;
  return params.get(key);
}
