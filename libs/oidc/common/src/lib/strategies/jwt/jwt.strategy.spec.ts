import { JwtStrategy } from './jwt.strategy';

describe('JwtGuard', () => {
  it('should be defined', () => {
    expect(new JwtStrategy()).toBeDefined();
  });
});
