import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  it('should be created', () => {
    expect(() => new EnvironmentService(null)).toThrow(Error);

    const emptyEnv = new EnvironmentService({});
    expect(emptyEnv).toBeTruthy();
    expect(() => emptyEnv.value('fake')).toThrow(Error);

    const testEnv = new EnvironmentService({ test_key: 'test_value' });
    expect(testEnv.value('test_key')).toEqual('test_value');
  });
});
