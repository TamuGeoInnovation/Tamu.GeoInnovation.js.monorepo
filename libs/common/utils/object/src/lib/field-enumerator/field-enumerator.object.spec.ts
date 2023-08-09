import { FieldEnumerator } from './field-enumerator.object';

interface TestObject {
  a: unknown;
  b: unknown;
  c: unknown;
  d: unknown;
  e: unknown;
  f: unknown;
  g: unknown;
  h: unknown;
}

describe('FieldEnumerator', () => {
  let testObject: TestObject;
  let enumerator: FieldEnumerator<TestObject>;

  beforeEach(() => {
    testObject = {
      a: 'hello',
      b: 42,
      c: true,
      d: 'world',
      e: 123,
      f: false,
      g: 'foo',
      h: 456
    };

    enumerator = new FieldEnumerator(testObject);
  });

  describe('constructor', () => {
    it('should pull the state value if the input is of the same class type', () => {
      const result = new FieldEnumerator(enumerator);

      expect(result.get()).toEqual(testObject);
    });
  });

  describe('get', () => {
    it('should return the object', () => {
      const result = enumerator.get();
      expect(result).toEqual(testObject);
    });
  });

  describe('filter', () => {
    it('should include only specified fields', () => {
      const result = enumerator.filter('include', ['a', 'c', 'e', 'f', 'h']).get();
      expect(result).toEqual({
        a: 'hello',
        c: true,
        e: 123,
        f: false,
        h: 456
      });
    });

    it('should exclude specified fields', () => {
      const result = enumerator.filter('exclude', ['b', 'd', 'f']).get();
      expect(result).toEqual({
        a: 'hello',
        c: true,
        e: 123,
        g: 'foo',
        h: 456
      });
    });
  });

  describe('order', () => {
    it('should order fields as specified and not implicitly omit props', () => {
      const result = enumerator.order(['c', 'a', 'b']);
      expect(result).toEqual([
        { key: 'c', value: true },
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'd', value: 'world' },
        { key: 'e', value: 123 },
        { key: 'f', value: false },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });
  });

  describe('order', () => {
    it('should order according to the input fields', () => {
      const result = enumerator.order(['d', 'e', 'c', 'f', 'a', 'b']);
      expect(result).toEqual([
        { key: 'd', value: 'world' },
        { key: 'e', value: 123 },
        { key: 'c', value: true },
        { key: 'f', value: false },
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });

    it('should not order missing fields from inputs above those explicity defined', () => {
      // e.g if the input is ['d', 'e', 'f', 'a', 'b'] and the object field 'c' exists, it should not be ordered first.
      const result = enumerator.order(['d', 'e', 'f', 'a', 'b']);
      expect(result).toEqual([
        { key: 'd', value: 'world' },
        { key: 'e', value: 123 },
        { key: 'f', value: false },
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'c', value: true },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });

    it('should not re-include fields from a previously excluded on object', () => {
      const result = enumerator.filter('exclude', ['d', 'e', 'f']).order(['d', 'e', 'f', 'c', 'a', 'b']);
      expect(result).toEqual([
        { key: 'c', value: true },
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });

    it('should return the original object if the input is empty', () => {
      const result = enumerator.order([]);
      expect(result).toEqual([
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'c', value: true },
        { key: 'd', value: 'world' },
        { key: 'e', value: 123 },
        { key: 'f', value: false },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });
  });

  describe('toArray', () => {
    it('should return an array of key-value pairs', () => {
      const result = enumerator.toArray();
      expect(result).toEqual([
        { key: 'a', value: 'hello' },
        { key: 'b', value: 42 },
        { key: 'c', value: true },
        { key: 'd', value: 'world' },
        { key: 'e', value: 123 },
        { key: 'f', value: false },
        { key: 'g', value: 'foo' },
        { key: 'h', value: 456 }
      ]);
    });
  });
});
