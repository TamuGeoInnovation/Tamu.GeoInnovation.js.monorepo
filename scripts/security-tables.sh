#!/usr/bin/env bash
# Prints "the tables" for a commit: vulnerabilities, how far each direct dependency is from the latest it may take
# (#1218), and what knip finds unused (#2122). The maintainer asks for all three together.
#
#   scripts/security-tables.sh                 # origin/development, as this checkout last fetched it
#   scripts/security-tables.sh <branch|commit> # any ref the main checkout has
#   scripts/security-tables.sh ... > tables.md # the tables are on stdout; progress is on stderr
#
# From Git Bash, in the main checkout or any worktree; `git fetch origin` first. Like scripts/check-in-volume.sh, it works
# in a Linux clone kept in a Docker volume (tamu-js-tables), mounting the main checkout read-only at /src, so only
# committed work is seen. npm ci runs only when the lock changed since the last run; knip needs the install.
#
# What each table is built from (tools/security-findings/README.md, "The tables", says how to read them):
#   1. npm audit --package-lock-only, everything and --omit=dev, compared with .github/security/accepted-advisories.json
#      the way the daily scan compares them (findings.mjs).
#   2. Each direct dependency's installed version (package-lock.json) against the newest stable release at least 7 days
#      old, from the registry; holds read from .github/dependabot.yml.
#   3. knip at the version that configured it (PR 2389), with knip.json; projects found by project.json; the projects
#      build.yml excludes.
# Status and decisions (accepted, held, waiting on the maintainer) are not here: the tables give the numbers, and the
# person showing them adds what has been decided.
set -euo pipefail

KNIP_VERSION=6.42.0
NODE_IMAGE=node:24.22.1
VOLUME=tamu-js-tables

ref="${1:-origin/development}"
main="$(git rev-parse --path-format=absolute --git-common-dir)"
main="$(cd "$main/.." && { pwd -W 2>/dev/null || pwd; })"
sha="$(git -C "$main" rev-parse --verify "$ref^{commit}")"
echo "tables: $ref = $sha" >&2

MSYS_NO_PATHCONV=1 docker run --rm -i -m 16g \
  -v "$main:/src:ro" -v "$VOLUME:/v" -e SHA="$sha" -e KNIP_VERSION="$KNIP_VERSION" \
  "$NODE_IMAGE" bash -s <<'EOF'
set -euo pipefail
exec 3>&1 1>&2
git config --global --add safe.directory '*'
[ -d /v/repo/.git ] || git clone -q --no-checkout /src /v/repo
cd /v/repo
git fetch -q /src '+refs/heads/*:refs/src/heads/*' '+refs/remotes/origin/*:refs/src/origin/*'
git checkout -q --force --detach "$SHA"
hash="$(cat package.json package-lock.json | sha256sum | cut -d' ' -f1)"
if [ "$(cat /v/lock.sha256 2>/dev/null)" != "$hash" ]; then
  echo "tables: npm ci (the lock changed)"
  npm ci --no-audit --no-fund --loglevel=error
  echo "$hash" > /v/lock.sha256
fi
o=/v/out; rm -rf "$o"; mkdir -p "$o"
echo "tables: npm audit"
npm audit --package-lock-only --json > "$o/audit-all.json" || true
npm audit --package-lock-only --omit=dev --json > "$o/audit-prod.json" || true
echo "tables: knip $KNIP_VERSION"
npx -y "knip@$KNIP_VERSION" --include files,dependencies --no-exit-code --reporter json > "$o/knip.json"
find apps libs -name project.json -not -path '*/node_modules/*' -printf '%h\n' | sort > "$o/roots.txt"
excluded="$(sed -nE "s/^ *EXCLUDED_PROJECTS: *'([^']*)'.*/\1/p" .github/workflows/build.yml | head -1)"
holds="$(sed -nE "s/^ *- dependency-name: *'?([^' ]+)'?.*/\1/p" .github/dependabot.yml | paste -sd, -)"
echo "tables: the registry"
{
  echo "# The tables, $(git log -1 --format='%h %cs' "$SHA")"
  echo
  node tools/security-findings/tables.mjs \
    --audit-all "$o/audit-all.json" --audit-prod "$o/audit-prod.json" \
    --accepted .github/security/accepted-advisories.json \
    --package package.json --lock package-lock.json \
    --knip "$o/knip.json" --roots "$o/roots.txt" --excluded "$excluded" --holds "$holds"
} >&3
EOF
