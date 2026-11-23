/**
 * The GIS Day impact report (#3238): one season's counts as JSON, and two seasons compared as CSV. Run again each
 * season; the definitions are `IMPACT_DEFINITIONS` in the data-api library, so every season is counted the same way.
 *
 * It reads no database and no Auth0. On production the operations repository's GIS Day `data/` folder runs
 * `impact-report.ps1`, which reads the rows as the maintainer's admin account and calls this three ways:
 *
 *   --windows --year=2026 --days=2026-11-17,2026-11-18 --previous-days=2025-11-18,2025-11-19
 *       Prints `WINDOWS ` and the windows in which an account counts as created for the season, as JSON, for the
 *       runner to ask Auth0 how many accounts of each profile type each holds.
 *
 *   --rows=<rows.json> --out=<impact-2026.json>
 *       Counts one season from its rows (`ImpactRows`) and writes the report. Prints `REPORT ` and the file.
 *
 *   --compare=<impact-2025.json>,<impact-2026.json> --out-dir=<folder>
 *       Writes `impact-2025-2026-measures.csv` (measure, each year, change, percent change) and
 *       `impact-2025-2026-lists.csv` (the top organizations and sessions). Prints `CSV ` and the two files.
 *
 * Every mode runs with no settings, so it can be run in a node container with the checkout and its node_modules:
 *
 *   node -r ts-node/register -r tsconfig-paths/register apps/gisday-nest/src/scripts/impact-report.ts <mode>
 *
 * Its output holds counts and the names of organizations and sessions only: no person's name, email or id.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { impactAccountWindows, impactCsv, impactReport, ImpactReport, ImpactRows } from '@tamu-gisc/gisday/platform/data-api';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const list = (value: string | undefined) => (value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []);
const read = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));

function main() {
  if (process.argv.includes('--windows')) {
    const year = Number(arg('year'));

    if (!Number.isInteger(year)) {
      throw new Error('--windows needs --year=<year>.');
    }

    console.log(`WINDOWS ${JSON.stringify(impactAccountWindows(year, list(arg('days')), list(arg('previous-days'))))}`);
    return;
  }

  const rows = arg('rows');

  if (rows) {
    const out = arg('out');

    if (!out) {
      throw new Error('--rows needs --out=<file>.');
    }

    const report = impactReport(read<ImpactRows>(rows));
    writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
    console.log(`REPORT ${out}`);

    if (report.unmatched2025?.length) {
      console.log(`No definition reproduces the 2025 report's number for: ${report.unmatched2025.join(', ')}`);
    }

    return;
  }

  const compare = list(arg('compare'));

  if (compare.length === 2) {
    const dir = arg('out-dir') ?? '.';
    const [a, b] = compare.map((f) => read<ImpactReport>(f)).sort((x, y) => x.year - y.year);
    const { measures, lists } = impactCsv(a, b);
    const base = join(dir, `impact-${a.year}-${b.year}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(`${base}-measures.csv`, measures);
    writeFileSync(`${base}-lists.csv`, lists);
    console.log(`CSV ${base}-measures.csv ${base}-lists.csv`);
    return;
  }

  throw new Error('Give --windows, --rows=<file> --out=<file>, or --compare=<a.json>,<b.json>. See the comment at the top.');
}

try {
  main();
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
