export function getQueryParam(key: string, url: string): string | null {
  try {
    const params = new URL(url).searchParams;
    return params.get(key);
  } catch (e) {
    return null;
  }
}
