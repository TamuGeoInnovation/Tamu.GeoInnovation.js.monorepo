/**
 * Finding the commit a release names, from a checkout or a worktree (#2144).
 *
 *   node --test tools/visual-baselines/*.test.mjs
 *
 * Each test builds its own throwaway repository, so nothing here reads this one.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { commitFields, releaseCommit, releaseLine } from './release-commit.mjs';

const git = (cwd, ...args) =>
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], { cwd, encoding: 'utf8' }).trim();

/** A repository with one commit tagged `prod-test`, and its commit. */
function repository() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-commit-'));
  const main = path.join(root, 'main');

  fs.mkdirSync(main);
  git(main, 'init', '-q');
  fs.writeFileSync(path.join(main, 'file.txt'), 'x');
  git(main, 'add', 'file.txt');
  git(main, 'commit', '-q', '-m', 'one');
  git(main, 'tag', 'prod-test');

  return { root, main, commit: git(main, 'rev-parse', 'HEAD') };
}

test('a worktree, whose .git is a file naming its gitdir, finds the commit', () => {
  const { root, main, commit } = repository();
  const worktree = path.join(root, 'worktree');

  git(main, 'worktree', 'add', '-q', '--detach', worktree);
  assert.ok(fs.statSync(path.join(worktree, '.git')).isFile(), 'a worktree has a .git file, not a directory');

  assert.equal(releaseCommit(worktree, 'prod-test').commit, commit);
});

test('the main checkout, whose .git is a directory, still finds the commit', () => {
  const { main, commit } = repository();

  assert.deepEqual(releaseCommit(main, 'prod-test'), { commit, why: null });
  assert.equal(releaseLine('prod-test', releaseCommit(main, 'prod-test')), 'release      prod-test (' + commit.slice(0, 8) + ')');
});

test('a worktree whose gitdir cannot be reached says so, and the manifest records why', () => {
  // What a capture in a container sees: the worktree is mounted, the main checkout's .git is not.
  const { root } = repository();
  const worktree = path.join(root, 'mounted-alone');
  const gitdir = 'C:/TAMU/Tamu.GeoInnovation.js.monorepo/.git/worktrees/wt-2119';

  fs.mkdirSync(worktree);
  fs.writeFileSync(path.join(worktree, '.git'), 'gitdir: ' + gitdir + '\n');

  const found = releaseCommit(worktree, 'prod-test');

  assert.equal(found.commit, null);
  assert.match(found.why ?? '', /worktree/);
  assert.ok((found.why ?? '').includes(gitdir), 'the reason names the gitdir it could not reach: ' + found.why);

  assert.match(releaseLine('prod-test', found), /NO COMMIT/);
  assert.ok(releaseLine('prod-test', found).includes(found.why ?? '(no reason)'), 'the line gives the reason');

  assert.deepEqual(commitFields(found), { releaseCommit: null, releaseCommitMissing: found.why });
});
