import { HasRolesPipe } from './has-roles.pipe';

describe('HasRolesPipe', () => {
  it('create an instance', () => {
    const pipe = new HasRolesPipe();
    expect(pipe).toBeTruthy();
  });
});
