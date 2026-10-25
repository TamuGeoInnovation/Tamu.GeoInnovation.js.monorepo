/**
 * What every page the visual-baselines tools write has in common (#2345): the repository's shared
 * styles (pages.scss, compiled here), AggieMap's fonts, the page frame, and the escaping of anything
 * read from disk. review.mjs writes a comparison page and index.mjs the home page and each set's
 * gallery; both start from this, so they read as one site whether opened from a workstation's folder
 * or served from the cluster.
 *
 * Plain HTML with relative links and no framework. The only request a page makes is for the fonts,
 * which fall back to the system's when offline.
 */

import { createRequire } from 'module';
import * as path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');

/** Text from a manifest or a file name, made safe to put in HTML. */
export const escape = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let shared;

/**
 * The repository's shared styles, compiled once per run. The compiler is loaded here rather than at the
 * top, so a script or test that writes pages with styles of its own (`page({ shared: '' })`) needs no
 * install, as the tools' own test workflow has none.
 */
export function sharedCss() {
  if (shared === undefined) {
    const sass = createRequire(import.meta.url)('sass');

    shared = sass.compile(path.join(HERE, 'pages.scss'), {
      loadPaths: [REPO],
      style: 'compressed',
      // The shared partials still use @import and the global colour functions, as every app does.
      silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      quietDeps: true
    }).css;
  }

  return shared;
}

/** How the page frame sits: a sticky header over the content. Only layout; the look is the shared styles'. */
const FRAME_CSS = `
  body { margin:0; background:#fff; }
  header.top { position:sticky; top:0; z-index:5; background:#fff; border-bottom:1px solid #e3e0dd; padding:14px 16px; }
  header.top .page-title { margin:0 0 4px; font-size:1.6rem; }
  .crumbs, .meta { color:#6b6b6b; font-size:13px; }
  .controls { margin-top:10px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; font-size:13px; }
  main { padding:16px; max-width:2000px; margin:0 auto; }
  code, .mono { font-family:Consolas, ui-monospace, monospace; font-size:13px; }
`;

/**
 * A whole page: its title, the sticky header's contents, the body, and any page-specific layout and script.
 * `shared` is the shared styles, compiled unless given.
 */
export function page({ title, crumbs = '', heading, meta = '', controls = '', body, css = '', script = '', bodyClass = '', shared = sharedCss() }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Oswald:400,600&display=swap">
<style>${shared}${FRAME_CSS}${css}</style>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<header class="top">
  ${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}
  <h1 class="page-title">${heading}</h1>
  ${meta ? `<div class="meta">${meta}</div>` : ''}
  ${controls ? `<div class="controls">${controls}</div>` : ''}
</header>
<main>
${body}
</main>
${script ? `<script>${script}</script>` : ''}
</body>
</html>
`;
}
