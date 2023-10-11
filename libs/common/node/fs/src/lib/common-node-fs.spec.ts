import { commonNodeFs } from './common-node-fs';

describe('commonNodeFs', () => {
  it('should work', () => {
    expect(commonNodeFs()).toEqual('common-node-fs');
  });
});
