import {
  getUrlDomain,
  isChromeUrl,
  getUrlWithPathOnly,
  getOrigin,
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

describe('getOrigin', () => {

  test('domain', () => {
    expect(getOrigin('https://a.b/xxx?xxx')).toBe('https://a.b');
  });

  test('ip', () => {
    expect(getOrigin('http://1.1.1.1/xxx?xxx')).toBe('http://1.1.1.1');
  });

});
