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
