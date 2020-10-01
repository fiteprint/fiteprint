export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function isChromeUrl(url: string): boolean {
  return /^chrome:\/\//.test(url);
}

export function getUrlWithPathOnly(url: string): string {
  return url.replace(/(\/)?[?#].*$/, '').replace(/\/+$/, '');
}

export function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}
