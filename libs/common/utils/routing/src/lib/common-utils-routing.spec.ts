import { getPathFromRouteSnapshot, makeUrlParams, routeSubstitute } from '@tamu-gisc/common/utils/routing';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('getPathFromRouteSnapshot', () => {
  it('should work', () => {
    expect(
      getPathFromRouteSnapshot(({
        pathFromRoot: [{ routeConfig: { path: 'test' } }]
      } as unknown) as ActivatedRouteSnapshot)
    ).toEqual(['test']);
  });
});

describe('makeUrlParams', () => {
  it('should throw an error for invalid input', () => {
    expect(() => makeUrlParams(null, false)).toThrowError(
      new Error('Could not make URL params because no params were provided.')
    );
  });

  it('should work with no prefix', () => {
    expect(makeUrlParams({ test: 1, howdy: 'ags' }, false)).toEqual('?test=1&howdy=ags');
    expect(makeUrlParams({ test: 1, howdy: 'ags ' }, true)).toEqual('?test=1&howdy=ags%20');
  });

  it('should work with a prefix', () => {
    expect(makeUrlParams({ test: 1, howdy: 'ags' }, false, 'prefix')).toEqual('prefix?test=1&howdy=ags');
    expect(makeUrlParams({ test: 1, howdy: 'ags ' }, true, 'prefix')).toEqual('prefix?test=1&howdy=ags%20');
  });
});

describe('routeSubstitute', () => {
  it('should replace the documentation example', () => {
    expect(routeSubstitute(['map', 'd', 'trip'], 'd', 'm')).toEqual(['map', 'm', 'trip']);
    expect(routeSubstitute(['map', 'm', 'trip'], 'd', 'm')).toEqual(['map', 'm', 'trip']);
  });
});
