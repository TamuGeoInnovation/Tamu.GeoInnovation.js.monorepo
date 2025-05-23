import { LegacyAdminGuard } from './legacy-admin.guard';

describe('LegacyAdminGuard', () => {
  it('should be defined', () => {
    expect(new LegacyAdminGuard()).toBeDefined();
  });
});
