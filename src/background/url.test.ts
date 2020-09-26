import { getUrlDomain, getUrlWithPathOnly } from './url';

describe('getUrlDomain', () => {

  test('has domain', () => {
    expect(getUrlDomain('https://domain.com/xxx')).toBe('domain.com');
  });

  test('invalid domain', () => {
    expect(getUrlDomain('invalid_domain/xxx')).toBe('');
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
