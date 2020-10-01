import {
  getUrlDomain,
  isChromeUrl,
  getUrlWithPathOnly,
  getUrlOrigin,
  getUrlWithoutOrigin,
} from './url';

describe('getUrlDomain', () => {

  test('has domain', () => {
    expect(getUrlDomain('https://domain.com/xxx')).toBe('domain.com');
  });

  test('invalid domain', () => {
    expect(getUrlDomain('invalid_domain/xxx')).toBe('');
  });

});

describe('isChromeUrl', () => {

  test('chrome url', () => {
    expect(isChromeUrl('chrome://xxx')).toBe(true);
  });

  test('other url', () => {
    expect(isChromeUrl('https://xxx')).toBe(false);
  });

});

describe('getUrlWithPathOnly', () => {

  test('query string', () => {
    expect(getUrlWithPathOnly('https://a.b/xxx?xxx')).toBe('https://a.b/xxx');
  });

  test('hash', () => {
    expect(getUrlWithPathOnly('https://a.b/xxx#xxx')).toBe('https://a.b/xxx');
  });

  test('slash', () => {
    expect(getUrlWithPathOnly('https://a.b/xxx/')).toBe('https://a.b/xxx');
  });

});

describe('getUrlOrigin', () => {

  test('domain', () => {
    expect(getUrlOrigin('https://a.b/xxx?xxx')).toBe('https://a.b');
  });

  test('ip', () => {
    expect(getUrlOrigin('http://1.1.1.1/xxx?xxx')).toBe('http://1.1.1.1');
  });

});

describe('getUrlWithoutOrigin', () => {

  test('has slash', () => {
    expect(getUrlWithoutOrigin('https://a.b/?xxx')).toBe('/?xxx');
  });

  test('no slash', () => {
    expect(getUrlWithoutOrigin('https://a.b?xxx')).toBe('/?xxx');
  });

});
