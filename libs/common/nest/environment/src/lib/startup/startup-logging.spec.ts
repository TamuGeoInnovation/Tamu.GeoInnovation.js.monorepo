import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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

/**
 * #1518. The helper only helps the apps that call it: geoservices-nest, mailroom-nest and mailroom-helper-nest each
 * had their own copy of the old block, which printed `process.env` - database passwords and client secrets included -
 * whenever `LOGGING` was on. No Nest app's `main.ts` may hand `process.env` to a log line.
 */
describe("the Nest apps' main.ts", () => {
  const apps = resolve(__dirname, '../../../../../../../apps');
  const mains = readdirSync(apps)
    .filter((app) => app.endsWith('-nest'))
    .map((app) => join(apps, app, 'src', 'main.ts'))
    .filter((file) => existsSync(file));

  it('finds the Nest apps', () => {
    expect(mains.length).toBeGreaterThan(3);
  });

  it.each(mains)('%s never logs process.env', (file) => {
    const source = readFileSync(file, 'utf8');

    expect(source).not.toMatch(/console\.\w+\([^)]*\bprocess\.env\s*\)/);
  });
});
