/**
 * The commit a release tag names, for a baseline's manifest (#2144).
 *
 * Recorded, never required: a set without a commit is better than no set. But it must never be lost
 * silently, because the commit is what lets a set be placed against a build months later, when a "before"
 * can no longer be retaken. So when it cannot be found, the reason is returned, printed and recorded.
 */

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Where a checkout's git data is. A main checkout's `.git` is a directory. A worktree's is a one-line file,
 * `gitdir: <path>`, naming its data inside the main checkout's `.git`, which a container with only the
 * worktree mounted cannot reach.
 */
function gitDirOf(repo) {
  const dotGit = path.join(repo, '.git');

  if (!fs.existsSync(dotGit)) {
    return { why: repo + ' has no .git, so there is no git history to read the commit from' };
  }

  if (fs.statSync(dotGit).isDirectory()) {
    return { gitDir: dotGit };
  }

  const line = fs.readFileSync(dotGit, 'utf8').match(/^gitdir:\s*(.+?)\s*$/m);

  if (!line) {
    return { why: dotGit + ' is a file but names no gitdir' };
  }

  const gitDir = path.resolve(repo, line[1]);

  if (!fs.existsSync(gitDir)) {
    return {
      why:
        'this is a git worktree, and its gitdir (' + line[1] + ') cannot be reached from here; ' +
        'run the capture from the main checkout, or mount the main checkout too'
    };
  }

  return { gitDir };
}

/** The commit a release tag names: `{ commit, why }`, where `why` says what went wrong when there is none. */
export function releaseCommit(repo, release) {
  const { gitDir, why } = gitDirOf(repo);

  if (!gitDir) {
    return { commit: null, why };
  }

  try {
    const commit = execFileSync('git', ['rev-parse', '--verify', '--quiet', release + '^{commit}'], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, GIT_DIR: gitDir },
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();

    return { commit, why: null };
  } catch (error) {
    const said = String(error.stderr ?? '').trim().split(/\r?\n/)[0];

    return { commit: null, why: 'git has no commit for "' + release + '"' + (said ? ': ' + said : '') };
  }
}

/** The manifest's fields for it: the commit, and when there is none, why. */
export function commitFields(found) {
  return found.commit ? { releaseCommit: found.commit } : { releaseCommit: null, releaseCommitMissing: found.why };
}

/** The line the run prints for the release, which says plainly when no commit will be recorded. */
export function releaseLine(release, found) {
  return found.commit
    ? 'release      ' + release + ' (' + found.commit.slice(0, 8) + ')'
    : 'release      ' + release + ' - NO COMMIT RECORDED for this set: ' + found.why;
}
