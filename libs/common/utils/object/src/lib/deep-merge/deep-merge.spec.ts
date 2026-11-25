import { deepMerge } from './deep-merge';

/**
 * `deepMerge` replaces `deepmerge` 4.3.1 in our own code (#2698), which has a prototype-poisoning advisory and no fixed
 * release. The expected values below are what `deepmerge` 4.3.1 returned for the same inputs (run on 6 November 2026),
 * so the replacement is proven to give our three callers the same result.
 */
describe('deepMerge', () => {
  class SomePopup {}
  class OtherPopup {}

  // A layer source as the event maps define one: plain data, an array, nested objects and a class reference.
  const source = () => ({
    id: 'football-lots',
    type: 'feature',
    title: 'Lots',
    url: 'https://example.test/FeatureServer/0',
    popupComponent: SomePopup,
    native: {
      visible: false,
      listMode: 'hide',
      outFields: ['*'],
      renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [1, 2, 3, 0.5] } }
    }
  });

  const unchanged = () => ({
    id: 'football-lots',
    type: 'feature',
    title: 'Lots',
    url: 'https://example.test/FeatureServer/0',
    popupComponent: SomePopup,
    native: {
      visible: false,
      listMode: 'hide',
      outFields: ['*'],
      renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [1, 2, 3, 0.5] } }
    }
  });

  describe("gives what deepmerge 4.3.1 gave for the callers' inputs", () => {
    it("merges football's SHOW into native, keeping native's other fields", () => {
      const target = source();
      const result = deepMerge(target, { native: { visible: true, listMode: 'show' } });

      expect(result).toEqual({
        ...unchanged(),
        native: {
          visible: true,
          listMode: 'show',
          outFields: ['*'],
          renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [1, 2, 3, 0.5] } }
        }
      });
      expect(result.popupComponent).toBe(SomePopup);
      expect(target).toEqual(unchanged());
    });

    it('adds { visible: false } at the top level', () => {
      const target = source();
      const result = deepMerge(target, { visible: false });

      expect(result).toEqual({ ...unchanged(), visible: false });
      expect(target).toEqual(unchanged());
    });

    it('replaces a class reference, as a reference', () => {
      const target = source();
      const result = deepMerge(target, { popupComponent: OtherPopup });

      expect(result.popupComponent).toBe(OtherPopup);
      expect(result.native).toEqual(unchanged().native);
      expect(target.popupComponent).toBe(SomePopup);
    });
  });

  it('returns new objects and arrays, so changing the result cannot change an input', () => {
    const target = source();
    const override = { native: { listMode: 'show' } };
    const result = deepMerge(target, override);

    expect(result).not.toBe(target);
    expect(result.native).not.toBe(target.native);
    expect(result.native.outFields).not.toBe(target.native.outFields);
    expect(result.native.renderer.symbol).not.toBe(target.native.renderer.symbol);

    result.native.outFields.push('extra');
    result.native.renderer.symbol.color[0] = 9;

    expect(target).toEqual(unchanged());
    expect(override).toEqual({ native: { listMode: 'show' } });
  });

  it('lets an array replace, rather than concatenating', () => {
    expect(deepMerge({ outFields: ['a', 'b'] }, { outFields: ['c'] })).toEqual({ outFields: ['c'] });
  });

  it('recurses only into plain objects: anything else replaces', () => {
    const date = new Date(0);
    const result = deepMerge({ when: { year: 2026 }, instance: new SomePopup() }, { when: date, instance: { a: 1 } });

    expect(result.when).toBe(date);
    expect(result.instance).toEqual({ a: 1 });
  });

  describe('prototype poisoning (GHSA-gcqx-w48m-w2h4)', () => {
    it('ignores a __proto__ key, leaving every object and the result untouched', () => {
      const result = deepMerge({}, JSON.parse('{"__proto__":{"x":1}}'));

      expect(({} as { x?: number }).x).toBeUndefined();
      expect((result as { x?: number }).x).toBeUndefined();
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    it('ignores __proto__, constructor and prototype at any depth', () => {
      const result = deepMerge(
        { a: { b: 1 } },
        JSON.parse('{"a":{"__proto__":{"x":1},"constructor":{"y":2},"prototype":{"z":3},"c":2}}')
      ) as { a: Record<string, unknown> };

      expect(result.a).toEqual({ b: 1, c: 2 });
      expect(Object.getPrototypeOf(result.a)).toBe(Object.prototype);
      expect(Object.prototype.hasOwnProperty.call(result.a, 'constructor')).toBe(false);
      expect(({} as { x?: number }).x).toBeUndefined();
    });
  });
});
