#!/usr/bin/env bash
# Tests collate-release-notes.mjs (#2835) against a throwaway copy of docs/releases, so the real notes
# are never touched. Needs node; no network, and it runs in a few seconds:
#
#   bash scripts/collate-release-notes.test.sh
#
# Machines here have no host node, so run it in the same image as everything else:
#
#   MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD:/w" -w /w node:24.22.1 bash scripts/collate-release-notes.test.sh
#
# The case that matters: a GIS Day entry written without `app: gisday`. On 10 November 2026 the
# script collated 23 of them into AggieMap's notes, and an AggieMap release read as though it had
# shipped GIS Day's work. Nothing failed, because nothing checked; the maintainer found it in the
# finished document after it had been shared.
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
script="$here/collate-release-notes.mjs"
environments="$here/../test/smoke/aggiemap/environments.json"

root="$(mktemp -d)"
trap 'rm -rf "$root"' EXIT

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}
contains() { # <description> <needle> <haystack>
  case "$3" in *"$2"*) echo "ok   $1" ;; *) echo "FAIL $1: [$3] does not contain [$2]"; failed=1 ;; esac
}
lacks() { # <description> <needle> <haystack>
  case "$3" in *"$2"*) echo "FAIL $1: [$3] contains [$2]"; failed=1 ;; *) echo "ok   $1" ;; esac
}

# A fresh copy of the layout the script expects, with both applications' notes files as a release
# leaves them. unreleased.md's "What to test on dev" has no table, and a later section does: the rows
# must go into the section they belong to, not the next table the file happens to have.
fresh() {
  rm -rf "$root/r"
  mkdir -p "$root/r/scripts" "$root/r/docs/releases/unreleased" "$root/r/test/smoke/aggiemap"
  cp "$script" "$root/r/scripts/"
  cp "$environments" "$root/r/test/smoke/aggiemap/"
  echo '# Unreleased entries' >"$root/r/docs/releases/unreleased/README.md"
  cat >"$root/r/docs/releases/unreleased.md" <<'EOF'
# Unreleased

## Summary

Nothing yet.

## What to test on dev

**Nothing waiting.**

---

## Work in flight

| | | |
| --- | --- | --- |
| PR 1 | #1 | in flight |
EOF
  cat >"$root/r/docs/releases/gisday-unreleased.md" <<'EOF'
# GIS Day, unreleased

## Summary

## What to check, and where

| Change | Open this on dev | Look for |
| --- | --- | --- |
| An earlier change | Not on dev | It was there |

---

## The pull requests
EOF
}

entry() { # <file> <front matter lines> <body>
  printf -- '---\n%s\n---\n\n%s\n' "$2" "$3" >"$root/r/docs/releases/unreleased/$1"
}

run() { (cd "$root/r" && node scripts/collate-release-notes.mjs "$@" 2>&1); }
aggiemap() { cat "$root/r/docs/releases/unreleased.md"; }
gisday() { cat "$root/r/docs/releases/gisday-unreleased.md"; }

gisday_row='testOnDev: |
  | GIS Day: sponsors ([#9001](x)) | Not on dev | The logo is larger |'

# 1. The warning: a GIS Day entry that does not say so.
fresh
entry 9001-gisday-sponsors.md "issue: 9001
title: Sponsor logos
$gisday_row" '### Sponsor logos are larger

On [txgisday.org/sponsors](https://txgisday.org/sponsors), a logo can be extra large.'
out=$(run --check); status=$?
expect "an undeclared GIS Day entry fails --check" "1" "$status"
contains "and says which entry" "9001-gisday-sponsors.md" "$out"
contains "and what to add" "app: gisday" "$out"
contains "and why it looks like GIS Day" "txgisday.org" "$out"

for host in gisday.tamu.edu gisday.ucgis.org; do
  fresh
  entry 9002-gisday-page.md "issue: 9002
title: A page" "### A page

See [the page](https://$host/sessions)."
  run --check >/dev/null; status=$?
  expect "a link to $host counts as GIS Day-looking" "1" "$status"
done

out=$(run --write); status=$?
expect "--write refuses an undeclared GIS Day entry as well" "1" "$status"
lacks "and writes nothing into AggieMap's notes" "A page" "$(aggiemap)"

# 2. A declared GIS Day entry goes to GIS Day's file, row and all.
fresh
entry 9001-gisday-sponsors.md "issue: 9001
title: Sponsor logos
app: gisday
$gisday_row" '### Sponsor logos are larger

On [txgisday.org/sponsors](https://txgisday.org/sponsors), a logo can be extra large.'
out=$(run --check); status=$?
expect "a declared GIS Day entry passes --check" "0" "$status"
out=$(run --write); status=$?
expect "--write takes it" "0" "$status"
contains "it lands in GIS Day's summary" "### Sponsor logos are larger" "$(gisday)"
contains "its row lands in GIS Day's table, above the earlier one" "| --- | --- | --- |
| GIS Day: sponsors ([#9001](x)) | Not on dev | The logo is larger |
| An earlier change |" "$(gisday)"
lacks "and nothing of it in AggieMap's notes" "Sponsor logos" "$(aggiemap)"
contains "--write says where each went" "gisday-unreleased.md" "$out"

# 3. An entry with no `app:` that does not look like GIS Day is AggieMap's, exactly as before.
fresh
entry 9003-vendor-lots.md 'issue: 9003
title: Vendor lots
testOnDev: |
  | Vendor lots ([#9003](x)) | [dev](https://dev.aggiemap.tamu.edu/parking/vendor-parking) | Maroon lots |' '### Vendor lots open their notes again

The lots can be clicked.'
out=$(run --check); status=$?
expect "an ordinary undeclared entry passes --check" "0" "$status"
out=$(run --write); status=$?
expect "--write takes it" "0" "$status"
contains "it lands in AggieMap's summary" "### Vendor lots open their notes again" "$(aggiemap)"
lacks "and nothing of it in GIS Day's file" "Vendor lots" "$(gisday)"

# Its row goes into its own section, which gets a table, and not into Work in flight's.
section=$(aggiemap | sed -n '/^## What to test on dev/,/^## Work in flight/p')
contains "its row is under What to test on dev" "| Vendor lots ([#9003](x))" "$section"
contains "in a table with the usual header" "| Change | Open this on dev | Look for |
| --- | --- | --- |
| Vendor lots" "$section"
inflight=$(aggiemap | sed -n '/^## Work in flight/,$p')
lacks "and not in the Work in flight table" "Vendor lots" "$inflight"

# 4. Declared AggieMap is AggieMap, even with a GIS Day link: declaring is how an author says so.
fresh
entry 9004-gis-day-notice.md 'issue: 9004
title: GIS Day notice
app: aggiemap' '### A GIS Day notice on the main map

It links to the event map, and to [txgisday.org](https://txgisday.org).'
run --check >/dev/null; status=$?
expect "a declared AggieMap entry with a GIS Day link passes --check" "0" "$status"

# 5. An application with no notes file fails, rather than being dropped or sent to AggieMap.
fresh
entry 9005-mailroom.md 'issue: 9005
title: Mailroom
app: mailroom' '### Mailroom sorts faster

It does.'
out=$(run --check); status=$?
expect "an application with no notes file fails --check" "1" "$status"
contains "and names the file it looked for" "mailroom-unreleased.md" "$out"
out=$(run --write); status=$?
expect "and --write" "1" "$status"
lacks "which writes nothing" "Mailroom" "$(aggiemap)"

# 6. Both applications in one collation: each entry goes to its own file, and nothing is written
# unless all of them can be.
fresh
entry 9001-gisday-sponsors.md "issue: 9001
title: Sponsor logos
app: gisday
$gisday_row" '### Sponsor logos are larger

On [txgisday.org/sponsors](https://txgisday.org/sponsors).'
entry 9003-vendor-lots.md 'issue: 9003
title: Vendor lots' '### Vendor lots open their notes again

The lots can be clicked.'
out=$(run --write); status=$?
expect "a mixed collation writes" "0" "$status"
contains "AggieMap's entry in AggieMap's notes" "Vendor lots open" "$(aggiemap)"
lacks "and not GIS Day's" "Sponsor logos" "$(aggiemap)"
contains "GIS Day's entry in GIS Day's file" "Sponsor logos are larger" "$(gisday)"
lacks "and not AggieMap's" "Vendor lots" "$(gisday)"

exit "$failed"
