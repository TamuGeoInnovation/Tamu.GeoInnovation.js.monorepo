import { getObjectPropertyValues, getPropertyValue } from './common-utils-object';

describe('getPropertyValue', () => {
  it('should be undefined for invalid input', () => {
    expect(getPropertyValue(null, null)).toBeUndefined();
  });

  it('should be undefined for invalid property', () => {
    expect(getPropertyValue({ test: 'value' }, 'test2')).toBeUndefined();
  });

  it('should be undefined for invalid path', () => {
    expect(getPropertyValue({ test: undefined }, 'test.inner')).toBeUndefined();
    expect(getPropertyValue({ test: null }, 'test.inner')).toBeNull();
  });
});

describe('getObjectPropertyValues', () => {
  it('should lookup objects', () => {
    expect(getObjectPropertyValues({ test: 'value' }, ['test'])).toEqual(['value']);
    expect(getObjectPropertyValues({ test: 'value', test2: 3, notUsed: 'n/a' }, ['test', 'test2'])).toEqual(['value', 3]);
    expect(getObjectPropertyValues({ test: { inner: 'test' } }, ['test'])).toEqual([{ inner: 'test' }]);
  });

  it('should join strings', () => {
    expect(getObjectPropertyValues({ test: 'value' }, ['test'], true)).toEqual('value');
    expect(getObjectPropertyValues({ test: 'value', test2: 3, nothing: 'n/a' }, ['test', 'nothing'], true)).toEqual(
      'value n/a'
    );
    expect(
      getObjectPropertyValues({ test: 'value', test2: '3', nothing: 'n/a' }, ['test', 'test2', 'nothing'], true)
    ).toEqual('value 3 n/a');
  });

  it('should refuse to join not strings', () => {
    expect(getObjectPropertyValues({ test: 1 }, ['test'], true)).toEqual([1]);
    expect(getObjectPropertyValues({ test: 1, test2: 2, test3: 3 }, ['test', 'test2', 'test3'], true)).toEqual([1, 2, 3]);
  });
});
