/**
 * Startup logging shared by the Nest applications' `main.ts`.
 *
 * Logs only that verbose logging is on. It never prints the environment: it carries database
 * passwords and client secrets, and the log is readable by more people than the secrets are (#1514).
 *
 * `LOGGING` is on only when it is exactly 'true', as in each app's `environment.ts`; any other value,
 * 'false' included, is off.
 */
export function logStartupEnvironment(env: NodeJS.ProcessEnv, log: (...args: unknown[]) => void = console.log): void {
  if (env.LOGGING === 'true') {
    log('Logging is enabled');
  }
}
