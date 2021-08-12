import { UserGroupsMiddleware } from './user-groups.middleware';

describe('UserGroupsMiddleware', () => {
  it('should be defined', () => {
    expect(new UserGroupsMiddleware()).toBeDefined();
  });
});
