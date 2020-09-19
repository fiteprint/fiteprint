import { hashCode } from './string';

describe('hashCode', () => {

  test('empty string', () => {
    expect(hashCode('')).toBe(0);
  });

  test('different strings', () => {
    expect(hashCode('a')).not.toEqual(hashCode('b'));
  });

  test('same strings', () => {
    expect(hashCode('a')).toEqual(hashCode('a'));
  });

});
