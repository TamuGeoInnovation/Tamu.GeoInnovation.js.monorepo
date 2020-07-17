import { UserValidationMiddleware } from './user-validation.middleware';

describe('UserValidationMiddleware', () => {
  it('should be defined', () => {
    expect(new UserValidationMiddleware()).toBeDefined();
  });
});
