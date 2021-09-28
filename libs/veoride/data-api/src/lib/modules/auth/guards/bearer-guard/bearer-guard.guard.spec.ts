import { BearerGuard } from './bearer-guard.guard';

describe('BearerGuard', () => {
  it('should be defined', () => {
    expect(new BearerGuard()).toBeDefined();
  });
});
