import { ALWAYS_RUN_SPECS, grepFor, scopeForChangedFiles } from './scope';

/**
 * Prints the scope for a list of changed files, for `scripts/smoke-scoped.sh` (#1427).
 *
 * Reads repository-relative paths on stdin, one per line, as `git diff --name-only` prints them,
 * and writes shell-ready assignments on stdout. It exists so the shell script and the tests share
 * one implementation: the decision about what not to test is the part that must not drift.
 */

const changed = require('fs')
  .readFileSync(0, 'utf8')
  .split('\n')
  .map((line: string) => line.trim())
  .filter((line: string) => line.length > 0);

const scope = scopeForChangedFiles(changed);

const quote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

process.stdout.write(`SCOPABLE=${scope.scopable ? 'yes' : 'no'}\n`);
process.stdout.write(`REASON=${quote(scope.reason)}\n`);
process.stdout.write(`GREP=${quote(grepFor(scope))}\n`);
process.stdout.write(`ROUTES=${quote(scope.routes.join(' '))}\n`);
process.stdout.write(`ALWAYS=${quote(ALWAYS_RUN_SPECS.join(' '))}\n`);
