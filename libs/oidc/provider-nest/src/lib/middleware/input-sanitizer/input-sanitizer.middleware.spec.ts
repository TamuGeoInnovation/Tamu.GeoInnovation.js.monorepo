import { InputSanitizerMiddleware } from './input-sanitizer.middleware';

describe('InputSanitizerMiddleware', () => {
  it('should be defined', () => {
    expect(new InputSanitizerMiddleware()).toBeDefined();
  });
});
