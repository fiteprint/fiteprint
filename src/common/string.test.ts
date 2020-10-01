import { getHashCode } from './string';

describe('getHashCode', () => {

  test('empty string', () => {
    expect(getHashCode('')).toBe(0);
  });

  test('different strings', () => {
    expect(getHashCode('a')).not.toEqual(getHashCode('b'));
  });

  test('same strings', () => {
    expect(getHashCode('a')).toEqual(getHashCode('a'));
  });

});
