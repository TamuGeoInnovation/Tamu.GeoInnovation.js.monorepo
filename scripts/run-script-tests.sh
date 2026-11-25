#!/usr/bin/env bash
# Runs every scripts/*.test.sh, each to the end, and exits 1 if any failed (#3442). Used by
# .github/workflows/scripts-tests.yml; from Git Bash it works the same, given a node on the PATH.
set -uo pipefail

cd "$(dirname "$0")/.."

git config --global user.name >/dev/null 2>&1 || git config --global user.name 'scripts-tests'
git config --global user.email >/dev/null 2>&1 || git config --global user.email 'scripts-tests@example.invalid'

failed=()
for suite in scripts/*.test.sh; do
  echo "::group::$suite"
  start=$SECONDS
  bash "$suite"
  status=$?
  echo "::endgroup::"
  echo "$suite: exit $status ($((SECONDS - start)) s)"
  [ "$status" -eq 0 ] || failed+=("$suite")
done

if [ "${#failed[@]}" -gt 0 ]; then
  printf 'Failed: %s\n' "${failed[@]}"
  exit 1
fi
echo "Every scripts/*.test.sh passed."
