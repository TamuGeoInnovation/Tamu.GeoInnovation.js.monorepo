import { ClaimsMiddleware } from './claims.middleware';

describe('ClaimsMiddleware', () => {
  it('should be defined', () => {
    expect(new ClaimsMiddleware()).toBeDefined();
  });
});
