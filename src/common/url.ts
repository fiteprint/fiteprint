export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function isChromeUrl(url: string): boolean {
  return /^chrome/.test(url);
}

export function getUrlWithPathOnly(url: string): string {
  return url.replace(/(\/)?[?#].*$/, '').replace(/\/+$/, '');
}

export function getUrlOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

export function getUrlWithoutOrigin(url: string): string {
  try {
    return url.slice(new URL(url).origin.length).replace(/^([^/])/, '/$1');
  } catch {
    return '';
  }
}
