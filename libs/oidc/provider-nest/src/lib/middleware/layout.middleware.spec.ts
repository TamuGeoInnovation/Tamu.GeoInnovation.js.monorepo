import { LayoutMiddleware } from './layout.middleware';

describe('LayoutMiddleware', () => {
  it('should be defined', () => {
    expect(new LayoutMiddleware()).toBeDefined();
  });
});
