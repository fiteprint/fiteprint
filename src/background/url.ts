export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function getUrlWithPathOnly(url: string): string {
  return url.replace(/(\/)?[?#].*$/, '').replace(/\/+$/, '');
}
