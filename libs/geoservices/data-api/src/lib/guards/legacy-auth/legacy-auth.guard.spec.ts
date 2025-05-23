import { LegacyAuthGuard } from './legacy-auth.guard';

describe('LegacyAuthGuard', () => {
  it('should be defined', () => {
    expect(new LegacyAuthGuard()).toBeDefined();
  });
});
