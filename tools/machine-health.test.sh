#!/usr/bin/env bash
# Tests the parts of tools/machine-health.sh that decide what a measurement means, from fixture text, so no case needs
# Docker, GitHub or a real checkout.
# Usage: bash tools/machine-health.test.sh      (writes only inside its own temporary directory)
#
# Written 26 November 2026 for #3708. The secret case matters most: the Auth0 settings file is reported only as present or
# absent, so a file holding a value must not leak a byte of it into HEALTH.json.
set -u
here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0
ok()   { pass=$((pass+1)); printf 'ok    %s\n' "$1"; }
no()   { fail=$((fail+1)); printf 'FAIL  %s\n       wanted: %s\n       got:    %s\n' "$1" "$2" "$3"; }
check() { if [ "$2" = "$3" ]; then ok "$1"; else no "$1" "$2" "$3"; fi; }

# shellcheck source=machine-health.sh
. "$here/machine-health.sh"

# JSON: one key per line, strings escaped, numbers and booleans bare, "not measured here" for what cannot be read.
check 'a string is quoted' '"main_branch": "development"' "$(jstr main_branch development)"
check 'a quote and a backslash in a string are escaped' '"x": "a \"b\" c\\d"' "$(jstr x 'a "b" c\d')"
check 'a number is bare' '"local_branches": 67' "$(jnum local_branches 67)"
check 'a missing number is not measured' '"local_branches": "not measured here"' "$(jnum local_branches '')"
check 'a word where a number belongs is not measured' '"local_branches": "not measured here"' "$(jnum local_branches abc)"
check 'a boolean is bare' '"docker_answers": true' "$(jbool docker_answers true)"

# GitHub over SSH answers exit 1 even when it works; the greeting is what says so. The login in it is never kept.
check 'the SSH greeting means ok' 'ok' "$(ssh_result "Hi someone! You've successfully authenticated, but GitHub does not provide shell access.")"
check 'a refused key means failed' 'failed' "$(ssh_result 'git@github.com: Permission denied (publickey).')"
check 'no answer means failed' 'failed' "$(ssh_result '')"

# gh's token needs the project scope, or project fields are silently skipped.
check 'a token with project is ok' 'ok' "$(project_scope "  - Token scopes: 'gist', 'project', 'read:org', 'repo'")"
check 'a token without it fails' 'failed' "$(project_scope "  - Token scopes: 'gist', 'read:org', 'repo'")"

# Behind, in days, from two commit times.
check 'a commit two days older is 2 days behind' '2' "$(days_between 1000000 1172800)"
check 'the same commit is 0 days behind' '0' "$(days_between 1172800 1172800)"

# A check container whose script has died: running containers named check-* with no check-in-volume.sh to own them.
check 'two check containers and no script are two orphans' '2' "$(orphans 2 0)"
check 'a check container with its script running is no orphan' '0' "$(orphans 1 1)"

# A threshold or version read from the text of a script, never copied.
check 'the check image is read from check-in-volume.sh' 'node:24.22.3' "$(printf '%s\n' 'x' '  -e LINT_STEPS="$extra" node:24.22.3 sh -c "$(declare -f x)"' | check_image)"
check 'the Playwright version is read from package.json' '1.65.1' "$(printf '%s\n' '    "@playwright/test": "1.65.1",' | playwright_version)"

# THE SECRET CASE: the Auth0 settings file is present or absent, and nothing else.
printf 'AUTH0_CLIENT_SECRET=supersecretvalue\n' > "$tmp/auth0.env"
out=$(AUTH0_SETTINGS_FILE="$tmp/auth0.env" auth0_file_line)
check 'a present Auth0 file is reported as true' '"auth0_settings_file_exists": true' "$out"
case "$out" in *supersecret*) no 'and none of its contents' 'no contents' "$out" ;; *) ok 'and none of its contents' ;; esac
check 'an absent one is false' '"auth0_settings_file_exists": false' "$(AUTH0_SETTINGS_FILE="$tmp/none.env" auth0_file_line)"

# Whether this machine runs the lab's build agents is read from its name.
check 'a lab machine is the lab' 'yes' "$(is_lab work-lab-leila)"
check 'home is not' 'no' "$(is_lab home)"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
