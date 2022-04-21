import { makeWhere } from './common-utils-database';

describe('makeWhere', () => {
  it('should throw errors on invalid basic inputs', function () {
    expect(() => makeWhere(null, [], [])).toThrowError(new Error('Input Parameter Missing'));
    expect(() => makeWhere([], null, [])).toThrowError(new Error('Input Parameter Missing'));
    expect(() => makeWhere([], [], null)).toThrowError(new Error('Input Parameter Missing'));
  });

  it('should throw an error on invalid numbers of wildcards', () => {
    expect(() => makeWhere([], [], [], ['off by one'])).toThrowError(
      new Error('Number of wildcards does not equal the number of operators.')
    );
  });

  it('should throw an error on invalid number of transformations', function () {
    expect(() => makeWhere([], [], [], [], ['off by one'])).toThrowError(
      new Error('Number of transformations does not equal the number of keys.')
    );
  });

  it('should throw an error on mismatching counts of inputs', function () {
    expect(() => makeWhere([''], [], [])).toThrowError(new Error('Keys, values, and operators are not of equal length.'));
    expect(() => makeWhere([], [''], [])).toThrowError(new Error('Keys, values, and operators are not of equal length.'));
    expect(() => makeWhere([], [], [''])).toThrowError(new Error('Keys, values, and operators are not of equal length.'));
  });

  it('should handle trivial input', function () {
    expect(makeWhere(['key1', 'key2'], ['value1', 'value2'], ['=', '='])).toEqual(`key1 = 'VALUE1' OR key2 = 'VALUE2'`);
  });

  it('should handle wildcards', function () {
    expect(
      makeWhere(
        ['key1', 'key2', 'key3'],
        ['value1', 'value2', 'value3'],
        ['=', '=', '='],
        ['startsWith', 'endsWith', 'includes']
      )
    ).toEqual(`key1 = 'VALUE1%' OR key2 = '%VALUE2' OR key3 = '%VALUE3%'`);
  });

  it('should handle transformations', function () {
    expect(makeWhere(['key1'], ['value1'], ['='], null, ['test'])).toEqual(`TEST(key1) = 'VALUE1'`);
  });
});
