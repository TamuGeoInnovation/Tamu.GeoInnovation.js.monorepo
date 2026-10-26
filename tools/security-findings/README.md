# security-findings

Turns `npm audit` and Trivy output into one list, and decides which findings are **new** — that is,
not already in [`.github/security/accepted-advisories.json`](../../.github/security/accepted-advisories.json).

Used by two workflows:

| Where | What it does | Severity |
| --- | --- | --- |
| [`security-scan.yml`](../../.github/workflows/security-scan.yml) | Daily: audits the lock and scans the deployed images; opens or updates one `security-health` issue, and closes it when a run is clean | critical and high |
| [`publish.yml`](../../.github/workflows/publish.yml) | Blocks a push to the registry | **critical only** |

## Why the comparison is here and not in the workflow

A comparison written in YAML can only be tested by pushing a branch and waiting for a schedule, so in
practice it is never tested at all. The failure mode is silent: **a gate that lets everything through
looks exactly like a gate with nothing to catch.** `findings.test.mjs` plants a finding that is not
accepted and one that is, and requires the first to be reported and the second not. `tools-tests.yml`
runs it on every pull request that touches `tools/`.

## Running it by hand

```bash
npm audit --omit=dev --package-lock-only --json > npm-audit.json || true

docker run --rm -v "$PWD:/out" aquasec/trivy:0.76.1 image \
  --scanners vuln --severity CRITICAL,HIGH --format json --output /out/an-image.json --quiet \
  ghcr.io/tamugeoinnovation/gisday-nest:sha-abc1234

node tools/security-findings/check.mjs \
  --accepted .github/security/accepted-advisories.json \
  --npm npm-audit.json \
  --trivy an-image.json=ghcr.io/tamugeoinnovation/gisday-nest:sha-abc1234
```

Exit **0** nothing new, **1** something is, **2** the input itself is wrong. The third is deliberately
separate: a gate that cannot read its own accepted file must not report success.

## The accepted file

Every entry needs `id`, `package`, `reason` and `issue`. **An entry with no issue is rejected
outright**, because an acceptance nobody is tracking is how a finding becomes permanent — nothing will
ever remove it, and the file turns into a list of things the repository has given up on.

Matching is on **id *and* package**, case-insensitively. Both halves matter:

- One CVE lands on several packages in an image — OpenSSL's appear against `libcrypto3` and `libssl3`
  alike — and accepting it for one must not silently accept it for the other.
- Trivy and npm disagree on case.

A run also prints **acceptances nothing found any more**, which is how the file gets smaller instead of
only ever growing.

## What it does not do

- **Decide whether a finding is reachable.** It reports what is present in the lock or the image.
- **Cover anything below high.** Moderate and low are counted by `npm audit` for whoever runs it; they
  do not hold a daily health check red.
- **Scan what is deployed.** It scans the newest `sha-` tag built from `development` and the shared
  nginx base. An environment running an older tag can differ — on 23 October production was running an
  API image from March and a base image from November 2024 (#2111, #2119).

## Install scripts and registry signatures

Most malicious npm releases do their work in a `preinstall`, `install` or `postinstall` script, which npm runs
during `npm ci` (#2293). So only the scripts listed in **`allowScripts`** in the root `package.json` run, and
**`.npmrc`** sets `strict-allow-scripts`, which makes npm 11.19 refuse to install a package whose script is not
listed (`ESTRICTALLOWSCRIPTS`). Without that setting npm runs it anyway and only warns.

[`install-scripts.mjs`](install-scripts.mjs) checks the same from `package-lock.json`, which records
`hasInstallScript` for each package, so it needs no install. `lint.yml` runs it on every pull request, because
its own `npm ci` is skipped when the `node_modules` cache hits. Exit 1 names each package not listed.

Two kinds of entry are reported without failing. *Not installed any more* is an entry whose package is not in the lock
at all: it allows nothing, and `npm install-scripts prune` removes it. *Installed, but no install script recorded* is an
entry for a package the lock installs without `hasInstallScript`, and it **stays**: npm's `strict-allow-scripts` also
counts a `binding.gyp` as `install: node-gyp rebuild`, even when the package sets `"gypfile": false`, and the lock does
not record that. `better-sqlite3` 13 was one (the package is gone now): it shipped its own binaries, so it was denied (`false`), but removing the entry
makes `npm ci` fail with `ESTRICTALLOWSCRIPTS` (#2326).

**When it fails**, a dependency change brought a new install script, or a new copy of one. Read what the
script does (`node_modules/<name>/package.json`, `scripts`), then either:

```bash
npm install-scripts approve --no-allow-scripts-pin <name>
npm install-scripts deny <name>
```

`true` lets the script run; `false` skips it silently, for a script nothing here needs. Name-only entries
(the `--no-allow-scripts-pin`) keep a reviewed package's upgrades from failing every Dependabot pull request;
a pinned `name@1.2.3` entry would make each new version need a review.

**What is listed, and why** (24 October 2026, batch 123 of the lab):

| Package | Script | Allowed | Why |
| --- | --- | --- | --- |
| `esbuild`, `@swc/core`, `unrs-resolver`, `lmdb`, `msgpackr-extract`, `@parcel/watcher`, `fsevents` | check, or fall back to building, the native binary their platform package supplies | yes | each works without it on Linux x64, where the platform package is there; the script is the fallback where it is not |
| `nx` | checks the Nx Cloud client | yes | the build tool's own |
| `@vaadin/vaadin-usage-statistics` | swaps in a telemetry opt-out file when a project asks for it | **no** | this project does not ask |
| `browser-tabs-lock` | prints a thank-you banner | **no** | nothing to run |

The repository's own `postinstall` (`package.json`'s `scripts`) is not a dependency's, so it is not covered by
the list and still runs: it patches `@angular/service-worker`, which the front ends ship.

**`npm audit signatures`** (also in `lint.yml`) checks every registry package's signature against the registry's
keys, and its provenance where it has one, in about 15 seconds; it fails on a missing or invalid signature. On 24
October all 1,901 registry packages were signed and 456 had provenance. The one git dependency (`geojson-utils`)
has no registry signature to check and is not counted.
