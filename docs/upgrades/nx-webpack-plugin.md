# The inferred webpack plugin: three silent faults the API builds work around

The four API applications (`geoservices-nest`, `gisday-nest`, `mailroom-nest`, `mailroom-helper-nest`) build through
Nx's inferred `@nx/webpack/plugin` target, with an `NxAppWebpackPlugin` in each `webpack.config.js`
([#2168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2168)). Moving them there from the
`@nx/webpack:webpack` executor met three behaviours of the plugin that each **produced a wrong build without a word**.
The output looked fine and failed only in use. Each `webpack.config.js` works around all three, with a comment where
it does, and the conversion was proven by comparing every built file of every app, byte for byte, with the executor's
output (work-lab-leila's batch 50, `work-lab-leila/reports/2026-10-23-44.md` on `work-mailbox`).

**Read this before writing a new inferred webpack app here, and before upgrading Nx.** The record is
[#2206](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2206).

## The three faults

| What the plugin does | What it broke | The workaround in each `webpack.config.js` |
| --- | --- | --- |
| **`tsConfig: './tsconfig.app.json'`** is made workspace-relative, then read from the project folder, where the inferred target runs webpack. `readTsConfig` finds nothing and says nothing | The generated `package.json` lost `tslib`, which `main.js` requires, so the image did not start | `tsConfig: path.join(__dirname, 'tsconfig.app.json')`, an absolute path |
| **`fileReplacements` are resolved from the workspace root**, so `./src/environments/environment.ts` names a file that does not exist, and a replacement that matches nothing is skipped silently | Every production build shipped `environment.ts` in place of `environment.prod.ts` | Both sides of each replacement are `path.join(__dirname, ...)` |
| **`output.libraryTarget = 'commonjs'` is set in `apply()`**, after webpack 5 has already normalised `output.library` | `main.js` no longer exported what its entry exports, and the minified names changed | `output: { library: { type: 'commonjs' } }` in the exported config |

## Where each stands, by Nx version

| Fault | Nx 23 (found) | Nx 24.0.6 (read, not built, 23 November 2026) |
| --- | --- | --- |
| `fileReplacements` from the workspace root | Yes | **Still so.** `normalizeFileReplacements(workspaceRoot, ...)` does `path.resolve(workspaceRoot, ...)`, and `normalizeRelativePaths` leaves `{ replace, with }` objects alone. The workaround stays |
| `tsConfig` read from the wrong folder | Yes | `normalizeRelativePaths` now joins a relative option onto the project root. Whether the read then resolves it correctly needs a build to settle. The absolute path is right either way, so it stays |
| `libraryTarget` set too late | Yes | `apply-base-config.js` keeps a `libraryTarget` you set and defaults `target: 'node'` to `commonjs`, but still assigns `config.output` inside `apply()`, the timing that broke it. Stays until a build compares `main.js` with and without |

None of the three can be dropped on a reading of the source alone.

## Re-checking at the next Nx upgrade

1. For each fault, remove its workaround from one app on a scratch branch.
2. Build that app in `production` and `development`, before and after, with the same Nx.
3. Compare every file under `dist/apps/<app>/`, byte for byte, as batch 50 did. Check in particular the generated
   `package.json` (does it list `tslib`?), which environment file is bundled, and what `main.js` exports.
4. Drop a workaround only when its build is identical without it, and add a column to the table above either way.
