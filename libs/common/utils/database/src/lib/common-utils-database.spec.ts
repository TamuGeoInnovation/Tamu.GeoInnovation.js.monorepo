import { escapeSqlString, makeWhere } from './common-utils-database';

describe('makeWhere', () => {
  it('should throw errors on invalid basic inputs', function () {
    expect(() => makeWhere(null, [], [])).toThrow(new Error('Input Parameter Missing'));
    expect(() => makeWhere([], null, [])).toThrow(new Error('Input Parameter Missing'));
    expect(() => makeWhere([], [], null)).toThrow(new Error('Input Parameter Missing'));
  });

  it('should throw an error on invalid numbers of wildcards', () => {
    expect(() => makeWhere([], [], [], ['off by one'])).toThrow(
      new Error('Number of wildcards does not equal the number of operators.')
    );
  });

  it('should throw an error on invalid number of transformations', function () {
    expect(() => makeWhere([], [], [], [], ['off by one'])).toThrow(
      new Error('Number of transformations does not equal the number of keys.')
    );
  });

  it('should throw an error on mismatching counts of inputs', function () {
    expect(() => makeWhere([''], [], [])).toThrow(new Error('Keys, values, and operators are not of equal length.'));
    expect(() => makeWhere([], [''], [])).toThrow(new Error('Keys, values, and operators are not of equal length.'));
    expect(() => makeWhere([], [], [''])).toThrow(new Error('Keys, values, and operators are not of equal length.'));
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

  it('should handle compound operators', function () {
    expect(
      makeWhere(
        ['key1', 'key2', 'key3'],
        ['value1', 'value2', 'value3'],
        [
          { logical: 'OR', comparison: '=' },
          { logical: 'OR', comparison: '=' },
          { logical: 'OR', comparison: '=' }
        ]
      )
    ).toEqual(`key1 = 'VALUE1' OR key2 = 'VALUE2' OR key3 = 'VALUE3'`);
  });

  // What a visitor types goes into the where clause as it is. An apostrophe ended the string early, so
  // the GIS service rejected the query, and `%` or `_` matched every feature (#1790).
  describe('typed text', () => {
    it('doubles an apostrophe, so the string is not ended early', () => {
      expect(makeWhere(['BldgName'], ["Cain '51"], ['='])).toEqual(`BldgName = 'CAIN ''51'`);
    });

    it('doubles an apostrophe in a LIKE search, and still finds it anywhere in the field', () => {
      expect(makeWhere(['BldgName'], ["Cain '51"], ['LIKE'], ['includes'], ['UPPER'])).toEqual(
        `UPPER(BldgName) LIKE '%CAIN ''51%' ESCAPE '\\'`
      );
    });

    it('matches a percent sign and an underscore literally in a LIKE search', () => {
      expect(makeWhere(['name'], ['50%'], ['LIKE'], ['includes'])).toEqual(`name LIKE '%50\\%%' ESCAPE '\\'`);
      expect(makeWhere(['name'], ['lot_e'], ['LIKE'], ['startsWith'])).toEqual(`name LIKE 'LOT\\_E%' ESCAPE '\\'`);
    });

    it('matches the escape character itself literally in a LIKE search', () => {
      expect(makeWhere(['name'], ['a\\b'], ['LIKE'])).toEqual(`name LIKE 'A\\\\B' ESCAPE '\\'`);
    });

    it('escapes a compound LIKE operator too', () => {
      expect(makeWhere(['name'], ['50%'], [{ logical: 'OR', comparison: 'LIKE' }], ['includes'])).toEqual(
        `name LIKE '%50\\%%' ESCAPE '\\'`
      );
    });

    it('leaves a percent sign alone where it is not a wildcard', () => {
      expect(makeWhere(['name'], ['50%'], ['='])).toEqual(`name = '50%'`);
    });
  });
});

describe('escapeSqlString', () => {
  it('doubles every apostrophe', () => {
    expect(escapeSqlString("O'Donnell's")).toBe("O''Donnell''s");
  });
});
