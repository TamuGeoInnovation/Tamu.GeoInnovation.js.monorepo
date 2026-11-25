import * as fs from 'fs';
import * as path from 'path';

import { test } from './fixtures';

/** One entry of `deployed-changes.json`: a change some check waits for, and the commit it merged as. */
interface DeployedChange {
  change: string;
  /** What the change brings, in the words a skipped check's reason uses. */
  what: string;
  commit: string;
}

const CHANGES: DeployedChange[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed-changes.json'), 'utf8'));

/**
 * Skips the running check while the build this environment serves predates `change` (#3539), saying so.
 *
 * A check merged with the change it checks, as CLAUDE.md requires, fails against every deployed environment until a
 * build carrying that change is deployed, and it reads as the application being broken: on 24 November 2026 the
 * Football Tailgating map's new side-panel checks reported a production regression that was only an old build. The
 * deployed page cannot name its commit (#1306), so the answer comes from the repository's own `dev-*` and `prod-*`
 * tags: `scripts/smoke-deployed.sh`, run by `run-local.sh` and `aggiemap-smoke.yml` before the suite, lists the
 * registry's commits the newest tag lacks.
 *
 * It only ever skips on that positive answer. With no tag to compare, or once the tag carries the change, the check
 * runs as it always did, so a feature that is genuinely missing still fails. A change stays in the registry after it
 * ships; it then never skips anything.
 */
export function skipUntilDeployed(change: string): void {
  const entry = CHANGES.find((candidate) => candidate.change === change);

  if (entry === undefined) {
    throw new Error(
      `${change} is not in test/smoke/aggiemap/deployed-changes.json, so nothing can say whether it is deployed`
    );
  }

  const tag = process.env.AGGIEMAP_SMOKE_DEPLOYED_TAG;
  const undeployed = (process.env.AGGIEMAP_SMOKE_UNDEPLOYED_COMMITS ?? '').split(',').filter(Boolean);

  test.skip(
    tag !== undefined && undeployed.includes(entry.commit),
    `This checks that ${entry.what}, which came with ${change}, and ${tag}, the build this environment serves, ` +
      `predates it. Skipped rather than failed, as bus.spec.ts does for a probe too old to report graphics: it is ` +
      `"deploy a newer build", not "the application is broken" (#3539).`
  );
}
