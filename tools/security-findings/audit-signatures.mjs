/**
 * `npm audit signatures`, tried again when the registry fails to answer, and only then (#3439).
 *
 * The registry sometimes answers an attestations request with a bare `OK` instead of JSON, and npm stops with
 * `FETCH_ERROR ... invalid json response body`. Nothing is wrong with any package, and re-running the job clears
 * it; on 24 November that cost four re-runs in one day. So a run that fails **that way** is tried again, up to
 * three times in all, ten seconds apart. Any other failure - a missing or invalid signature above all - fails at
 * once, as it always did: this never retries a real finding.
 *
 * Run by `lint.yml` as `node tools/security-findings/audit-signatures.mjs`, one line, so
 * `scripts/check-in-volume.sh` runs it too. Tested by `audit-signatures.test.mjs`.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** npm's words when the registry, not a package, is at fault. */
const TRANSIENT = [/\bFETCH_ERROR\b/, /\bECONNRESET\b/, /\bETIMEDOUT\b/, /\bEAI_AGAIN\b/, /invalid json response body/];

/** Whether a failed run's output says the registry failed to answer, rather than a signature being wrong. */
export function isTransient(output) {
  return TRANSIENT.some((pattern) => pattern.test(output));
}

/**
 * Calls `run` until it succeeds, fails for a reason that is not transient, or has been tried `tries` times.
 * `run` returns `{ status, output }`. Returns the last of those, with `attempts`.
 */
export async function withRetries(run, { tries = 3, pauseMs = 10000, sleep, log = () => undefined } = {}) {
  const wait = sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  for (let attempt = 1; ; attempt++) {
    const result = run();

    if (result.status === 0 || attempt >= tries || !isTransient(result.output)) {
      return { ...result, attempts: attempt };
    }

    log(`npm audit signatures: the registry did not answer (try ${attempt} of ${tries}); trying again in ${pauseMs / 1000} s.`);
    await wait(pauseMs);
  }
}

function auditSignatures() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['audit', 'signatures'], { encoding: 'utf8', shell: process.platform === 'win32' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`;

  process.stdout.write(output);

  return { status: result.status ?? 1, output };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await withRetries(auditSignatures, { log: (line) => console.log(line) });

  process.exit(result.status);
}
