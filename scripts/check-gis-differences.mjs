#!/usr/bin/env node
// Fails when a development-to-production GIS service difference is recorded in code and missing from
// docs/gis-service-differences.md.
//
//   node scripts/check-gis-differences.mjs
//
// Why. Every difference between the two GIS servers is already written down - but only as a workaround, in
// READ_FROM_PRODUCTION_ON_DEVELOPMENT, so that a map draws. Once the workaround is in, nothing remains that
// would make anybody report the difference to the GIS team, and about fifty accumulated that way before
// anyone collected them (#3402). A rule saying "also add it to the register" decays exactly as writing the
// release notes afterwards did (#1132); a check does not.
//
// It is deliberately one-directional: a key in the code and missing from the page is an error, and a row on
// the page whose key has gone from the code is NOT. That row is the history of a difference that was fixed,
// and deleting it would throw away the only record that it ever existed.
//
// Runs as a lint.yml step, so it runs on every pull request and inside scripts/check-in-volume.sh.
// Tested by scripts/check-gis-differences.test.sh.

import { readFileSync } from 'node:fs';

const CONNECTIONS = 'libs/aggiemap/ngx/common/src/lib/connections.ts';
const REGISTER = 'docs/gis-service-differences.md';
const CONST_NAME = 'READ_FROM_PRODUCTION_ON_DEVELOPMENT';

/** The connection keys of the differences recorded in <source>, in order. */
export function recordedDifferences(source) {
  const start = source.indexOf(`export const ${CONST_NAME}`);
  if (start === -1) {
    throw new Error(`${CONNECTIONS} has no ${CONST_NAME}. Has it been renamed?`);
  }
  const open = source.indexOf('{', start);
  const close = source.indexOf('\n};', open);
  if (open === -1 || close === -1) {
    throw new Error(`Could not read the body of ${CONST_NAME}.`);
  }
  const body = source
    .slice(open + 1, close)
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  // A key at the start of a line, before its colon. The value may be on the next line, so the key is what
  // is matched rather than the whole entry.
  return [...body.matchAll(/^\s*([A-Za-z0-9]+Url)\s*:/gm)].map((m) => m[1]);
}

/** The connection keys the register names, as `key` in a table cell. */
export function registeredDifferences(register) {
  return new Set([...register.matchAll(/^\|\s*`([A-Za-z0-9]+Url)`\s*\|/gm)].map((m) => m[1]));
}

/** The keys recorded in code and missing from the register. */
export function missingFromRegister(source, register) {
  const registered = registeredDifferences(register);
  return recordedDifferences(source).filter((key) => !registered.has(key));
}

function main() {
  let source;
  let register;
  try {
    source = readFileSync(CONNECTIONS, 'utf8');
    register = readFileSync(REGISTER, 'utf8');
  } catch (error) {
    console.error(`Could not read ${error.path ?? 'a file'}: ${error.message}`);
    process.exit(1);
  }

  const recorded = recordedDifferences(source);
  const missing = missingFromRegister(source, register);

  if (missing.length > 0) {
    console.error(
      `${missing.length} GIS service difference(s) are in ${CONNECTIONS} and missing from ${REGISTER}:`
    );
    for (const key of missing) {
      const line = source.split('\n').findIndex((text) => new RegExp(`^\\s*${key}\\s*:`).test(text)) + 1;
      console.error(`::error file=${CONNECTIONS},line=${line}::${key} has no row in ${REGISTER}`);
      console.error(`  ${key}`);
    }
    console.error('');
    console.error('Add a row for each, under the kind it is: a schema divergence, broken or empty data, a');
    console.error('permissions problem, not published on development, or retired. The kind decides whether');
    console.error('the GIS team hears about it at all, so it cannot be filled in later by somebody else.');
    process.exit(1);
  }

  console.log(
    `All ${recorded.length} GIS service differences in ${CONNECTIONS} have a row in ${REGISTER}.`
  );
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-gis-differences.mjs')) {
  main();
}
