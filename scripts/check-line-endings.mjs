#!/usr/bin/env node
// Fails when a tracked text file has a CRLF line ending, other than the one file that must keep them.
//
//   node scripts/check-line-endings.mjs
//
// Why. .gitattributes sets `* -text`, so git never normalizes endings: a file committed with CRLF from a
// Windows editor stays CRLF for good, and the next tool that rewrites it as LF turns a ten-line change into
// a thousand-line diff (#1025). The rule "files are LF" was in CLAUDE.md and twelve files had drifted anyway.
//
// Reads `git ls-files --eol`, so it checks what is committed (the index), not the working tree.
// Runs as a lint.yml step, so it runs on every pull request and inside scripts/check-in-volume.sh.

import { execFileSync } from 'node:child_process';

// Windows batch files can mishandle `goto` and labels with LF endings, so this one stays CRLF (CLAUDE.md).
const CRLF_ALLOWED = new Set(['libs/assets/batch/startup.bat']);

const lines = execFileSync('git', ['ls-files', '--eol'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\n');

// Each line: "i/<index eol> w/<worktree eol> attr/<attributes>\t<path>".
const offending = lines
  .map((line) => line.match(/^i\/(\S+)\s.*?\t(.*)$/))
  .filter((m) => m && (m[1] === 'crlf' || m[1] === 'mixed') && !CRLF_ALLOWED.has(m[2]))
  .map((m) => `${m[1].padEnd(5)} ${m[2]}`);

if (offending.length) {
  console.error(`${offending.length} tracked file(s) have CRLF line endings; files here are LF (CLAUDE.md, #1025):`);
  console.error(offending.map((o) => `  ${o}`).join('\n'));
  console.error("Convert each to LF (for example `sed -i 's/\\r$//' <file>`) and commit; check with `git diff --stat --ignore-all-space`.");
  process.exit(1);
}

console.log('Every tracked text file is LF, but for the one batch file that must be CRLF.');
