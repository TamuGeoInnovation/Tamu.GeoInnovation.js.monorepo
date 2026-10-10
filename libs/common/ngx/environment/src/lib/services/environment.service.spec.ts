import { TestBed } from '@angular/core/testing';

import { EnvironmentService, env } from './environment.service';

const build = (environment: unknown) =>
  TestBed.resetTestingModule()
    .configureTestingModule({ providers: [{ provide: env, useValue: environment }] })
    .runInInjectionContext(() => new EnvironmentService());

describe('EnvironmentService', () => {
  it('refuses to be created without an environment', () => {
    expect(() => build(null)).toThrow(Error);
  });

  it('throws for a key the environment does not have', () => {
    const emptyEnv = build({});

    expect(emptyEnv).toBeTruthy();
    expect(() => emptyEnv.value('fake')).toThrow(Error);
  });

  it('returns the value of a key the environment has', () => {
    expect(build({ test_key: 'test_value' }).value('test_key')).toEqual('test_value');
  });
});
