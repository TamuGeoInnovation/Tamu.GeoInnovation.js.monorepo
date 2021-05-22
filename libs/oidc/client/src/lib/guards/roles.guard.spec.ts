import { UserRoleGuard, AdminRoleGuard, ManagerRoleGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('should be defined', () => {
    expect(new AdminRoleGuard()).toBeDefined();
  });
  it('should be defined', () => {
    expect(new ManagerRoleGuard()).toBeDefined();
  });
  it('should be defined', () => {
    expect(new UserRoleGuard()).toBeDefined();
  });
});
