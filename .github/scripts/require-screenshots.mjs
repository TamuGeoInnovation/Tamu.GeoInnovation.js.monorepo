#!/usr/bin/env node
/**
 * Fails a pull request that changes something a user can see and carries no before/after image.
 *
 * The rule is not new, and it is not unwritten: `.github/pull_request_template.md` has asked for
 * before/after images for a long time. It was skipped anyway, four times in one session, because
 * `gh pr create --body-file` replaces the template - so the checklist is never rendered and nothing
 * notices it is gone. See #1258, and #1056 for the same shape of failure with linked issues.
 *
 * Deciding automatically whether a change is *really* visible is not possible, so this does not try.
 * It flags the file types that usually are, and the escape hatch is a human applying a label, which
 * stays visible on the pull request afterwards.
 */

/** A changed file that usually means something on screen moved. */
export function isUserVisible(file) {
  if (/(^|\/)docs\//.test(file)) return false;
  if (/\.spec\.ts$/.test(file)) return false;
  if (/\.(html|scss)$/.test(file)) return true;

  // Components and directives render; services, guards and modules usually do not, and flagging
  // every one of them would train people to reach for the label.
  return /\.(component|directive)\.ts$/.test(file);
}

/** Whether a pull request body shows an image. */
export function hasImage(body) {
  if (!body) return false;

  const patterns = [
    /!\[[^\]]*\]\([^)]+\)/, // markdown image
    /<img\s[^>]*src=/i, // html image
    /raw\.githubusercontent\.com\/\S+\.(png|jpe?g|gif|webp|svg)/i, // committed and linked raw
    /user-images\.githubusercontent\.com\//i, // dragged into the body
    /github\.com\/user-attachments\/assets\//i // dragged into the body, current form
  ];

  return patterns.some((p) => p.test(body));
}

export function evaluate({ files, body, labels }) {
  const visible = files.filter(isUserVisible);

  if (visible.length === 0) {
    return { ok: true, reason: 'no user-visible files changed' };
  }

  if (labels.some((l) => l.toLowerCase() === 'no-visible-change')) {
    return { ok: true, reason: 'labelled no-visible-change' };
  }

  if (hasImage(body)) {
    return { ok: true, reason: 'body contains an image' };
  }

  return { ok: false, reason: 'user-visible change with no image', visible };
}

/**
 * Proves the detector both ways on every run.
 *
 * A check that silently stops detecting is worse than no check, because it reads as a pass. These
 * run before the real evaluation, so a regression in the matching fails CI loudly rather than
 * quietly waving pull requests through.
 */
const CASES = [
  { name: 'template change, no image -> fails', input: { files: ['libs/a/ngx/src/lib/x.component.html'], body: 'Closes #1', labels: [] }, ok: false },
  { name: 'template change with a markdown image -> passes', input: { files: ['libs/a/ngx/src/lib/x.component.html'], body: '![before](https://example.com/a.png)', labels: [] }, ok: true },
  { name: 'template change with a raw link -> passes', input: { files: ['libs/a/x.component.html'], body: 'see https://raw.githubusercontent.com/o/r/abc/docs/screenshots/s/a.jpg', labels: [] }, ok: true },
  { name: 'template change with the label -> passes', input: { files: ['libs/a/x.component.html'], body: 'Closes #1', labels: ['no-visible-change'] }, ok: true },
  { name: 'stylesheet change, no image -> fails', input: { files: ['apps/b/src/styles.scss'], body: '', labels: [] }, ok: false },
  { name: 'component change, no image -> fails', input: { files: ['libs/a/x.component.ts'], body: '', labels: [] }, ok: false },
  { name: 'directive change, no image -> fails', input: { files: ['libs/a/x.directive.ts'], body: '', labels: [] }, ok: false },
  { name: 'service change only -> passes', input: { files: ['libs/a/x.service.ts'], body: '', labels: [] }, ok: true },
  { name: 'spec file only -> passes', input: { files: ['libs/a/x.component.spec.ts'], body: '', labels: [] }, ok: true },
  { name: 'docs only -> passes', input: { files: ['docs/releases/unreleased.md', 'docs/screenshots/s/a.png'], body: '', labels: [] }, ok: true },
  { name: 'workflow only -> passes', input: { files: ['.github/workflows/x.yml'], body: '', labels: [] }, ok: true },
  { name: 'an html image tag counts', input: { files: ['libs/a/x.component.html'], body: '<img src="a.png">', labels: [] }, ok: true }
];

export function selfTest() {
  const failures = CASES.filter((c) => evaluate(c.input).ok !== c.ok);

  CASES.forEach((c) => {
    const got = evaluate(c.input).ok;
    console.log(`${got === c.ok ? 'ok  ' : 'FAIL'} ${c.name}`);
  });

  return failures.length;
}

if (process.argv[2] === '--self-test') {
  process.exit(selfTest() === 0 ? 0 : 1);
}
