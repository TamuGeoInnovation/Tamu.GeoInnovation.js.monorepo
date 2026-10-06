import { logStartupEnvironment } from './startup-logging';

describe('logStartupEnvironment', () => {
  const secret = 'not-for-the-log-4f1c';

  function run(env: NodeJS.ProcessEnv): string {
    const lines: string[] = [];
    logStartupEnvironment(env, (...args: unknown[]) => lines.push(args.map((a) => JSON.stringify(a)).join(' ')));
    return lines.join('\n');
  }

  it('never prints environment values, even with logging on', () => {
    const output = run({ LOGGING: 'true', TYPEORM_PASSWORD: secret, AUTH0_MANAGEMENT_SECRET: secret });

    expect(output).toContain('Logging is enabled');
    expect(output).not.toContain(secret);
  });

  it('treats LOGGING=false as off', () => {
    expect(run({ LOGGING: 'false', TYPEORM_PASSWORD: secret })).toBe('');
  });

  it('is off when LOGGING is unset', () => {
    expect(run({ TYPEORM_PASSWORD: secret })).toBe('');
  });
});
