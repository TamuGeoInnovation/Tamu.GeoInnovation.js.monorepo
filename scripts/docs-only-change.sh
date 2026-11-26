#!/usr/bin/env bash
# Says whether a change touches documentation only, so Azure can skip a pull request's install, lint and build (#1429).
#
#   git diff --name-only HEAD^1 HEAD | bash scripts/docs-only-change.sh
#
# Reads the changed paths, one per line, on stdin. Exits 0 and prints "docs-only" when there is at least one path and
# every path is under docs/ or ends in .md. Otherwise exits 1 and prints the first path that is not documentation, or
# "no changed files". An empty list counts as not docs-only, so a diff that failed or came back empty still builds.
#
# Why only pull requests. Build definition 19's only trigger is a pull request: a push to development starts no
# build, and a hand-queued development build is the deployable one, which always builds everything. A pull request's
# build exists for the required check `Monorepo`, and a `pr:` path filter would stop that check reporting, so a
# docs-only pull request could never merge. Skipping the stages instead lets the run finish green in about a minute,
# against 15 to 25 on the hosted pool.
#
# Tested by scripts/docs-only-change.test.sh.
set -uo pipefail

any=0
while IFS= read -r path || [ -n "$path" ]; do
  path="${path%$'\r'}"
  [ -n "$path" ] || continue
  any=1
  case "$path" in
    docs/*|*.md) ;;
    *) echo "builds: $path is not documentation"; exit 1 ;;
  esac
done

if [ "$any" = 0 ]; then
  echo "builds: no changed files"
  exit 1
fi
echo "docs-only"
