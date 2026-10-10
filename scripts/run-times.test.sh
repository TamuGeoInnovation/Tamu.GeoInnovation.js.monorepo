#!/usr/bin/env bash
# Tests the run-time files scripts/run-times.sh writes for check-in-volume.sh and run-local.sh, and the
# table scripts/run-times-report.sh makes of them (#1593). No Docker, no network; runs in a few seconds:
#
#   bash scripts/run-times.test.sh
#
# Exits non-zero, naming each failed case.
set -uo pipefail

# shellcheck source=run-times.sh
. "$(dirname "$0")/run-times.sh"

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

failed=0
expect() { # <description> <expected> <actual>
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$2], got [$3]"; failed=1; fi
}

# One file per run, in a folder that does not exist yet, named from the start, the tool and the machine.
runs="$dir/docs/build-times/runs"
BUILD_TIMES_MACHINE=home run_times_record "$runs" "2026-10-09 19:25:30 CDT" check "fix/1-a affected" 0 \
  "lint, test, build for 108 projects" 3725 "clone 38 s, npm ci 67 s" 2>/dev/null
expect "a run's file is named from its start, tool and machine" "2026-10-09T192530-check-home.csv" "$(ls "$runs" 2>&1)"
file="$runs/2026-10-09T192530-check-home.csv"
expect "the file is the header and one row" 2 "$(wc -l <"$file" | tr -d ' ')"
expect "the header comes first" "$RUN_TIMES_HEADER" "$(sed -n 1p "$file")"
expect "a row has every column, quoted where a field holds a comma" \
  '2026-10-09 19:25:30 CDT,home,check,fix/1-a affected,0,"lint, test, build for 108 projects",3725,1:02:05,"clone 38 s, npm ci 67 s"' \
  "$(sed -n 2p "$file")"

# A UTC start says utc in the name; quotes are doubled; the setup column may be empty. With no
# BUILD_TIMES_MACHINE the machine is "unspecified", never the hostname.
(unset BUILD_TIMES_MACHINE; run_times_record "$runs" "2026-10-10 00:25:31 UTC" smoke 'production, args: --grep "a,b"' 1 "" 59 2>/dev/null)
expect "a UTC start says so in the file name, and an unnamed machine is unspecified" \
  '2026-10-10 00:25:31 UTC,unspecified,smoke,"production, args: --grep ""a,b""",1,,59,0:00:59,' \
  "$(sed -n 2p "$runs/2026-10-10T002531utc-smoke-unspecified.csv" 2>&1)"
expect "the hostname is in no file or file name" 0 "$({ ls "$runs"; cat "$runs"/*.csv; } | grep -c -F "$(hostname)")"

# A machine name is made safe for a file name.
BUILD_TIMES_MACHINE="Dan's PC/2" run_times_record "$runs" "2026-10-09 08:00:00 CDT" check x 0 "" 1 2>/dev/null
expect "a machine name is made safe for a file name" \
  "2026-10-09 08:00:00 CDT,Dan-s-PC-2,check,x,0,,1,0:00:01," "$(sed -n 2p "$runs/2026-10-09T080000-check-Dan-s-PC-2.csv" 2>&1)"

# The same tool on the same machine in the same second: both runs are kept.
BUILD_TIMES_MACHINE=home run_times_record "$runs" "2026-10-09 19:25:30 CDT" check y 0 "" 2 2>/dev/null
expect "two runs in the same second are both kept" 2 "$(ls "$runs" | grep -c '^2026-10-09T192530-check-home')"
rm -f "$runs"/2026-10-09T192530-check-home-*.csv

# The report: one header, then every run's row, sorted by start.
report="$(dirname "$0")/run-times-report.sh"
expect "the report is one header and the rows in start order" \
  "$RUN_TIMES_HEADER
2026-10-09 08:00:00 CDT,Dan-s-PC-2,check,x,0,,1,0:00:01,
2026-10-09 19:25:30 CDT,home,check,fix/1-a affected,0,\"lint, test, build for 108 projects\",3725,1:02:05,\"clone 38 s, npm ci 67 s\"
2026-10-10 00:25:31 UTC,unspecified,smoke,\"production, args: --grep \"\"a,b\"\"\",1,,59,0:00:59," \
  "$(bash "$report" "$runs" 2>&1)"
mkdir "$dir/empty"
expect "the report of no runs is the header alone" "$RUN_TIMES_HEADER" "$(bash "$report" "$dir/empty" 2>&1)"

# A file that cannot be written warns and leaves the run's exit code alone, even under set -e.
: >"$dir/a-file"
(set -euo pipefail; run_times_record "$dir/a-file/runs" "2026-10-09 19:25:30 CDT" check x 7 "" 1 2>"$dir/warning"; exit 7)
expect "a failed write does not change the exit code" 7 "$?"
expect "a failed write warns" 1 "$(grep -c '^Warning: could not record' "$dir/warning")"

# Central time from PowerShell where there is one; UTC, labelled, where there is not.
now="$(RUN_TIMES_POWERSHELL=no-such-powershell run_times_now)"
expect "without PowerShell the time is UTC and says so" "$(date -u '+%Y-%m-%d %H:%M'):${now:17:2} UTC" "$now"
if command -v powershell.exe >/dev/null 2>&1; then
  now="$(run_times_now)"
  case "$now" in *\ CDT | *\ CST) z=Central ;; *) z="not Central: $now" ;; esac
  expect "with PowerShell the time is Central, CDT or CST" Central "$z"
fi

# What the scripts read from their logs.
cat >"$dir/check.log" <<'LOG'
=== clone 23:59:40
=== exit 0 00:00:10
=== fetch development 00:00:10
=== exit 0 00:00:11
=== npm ci 00:00:11
=== exit 0 00:01:17
=== affected lint 00:01:17
 NX   Successfully ran target lint for 33 projects and 3 tasks they depend on
=== exit 0 00:02:00
=== affected test,build 00:02:00
 NX   Running targets test, build for 20 projects:
 NX   Ran targets test, build for 20 projects (41 tasks):
=== exit 1 00:03:00
LOG
expect "a check's clone and npm ci times, across midnight" "clone 30 s, npm ci 66 s" "$(run_times_check_setup "$dir/check.log")"
expect "a check's Nx runs" "lint for 33 projects and 3 tasks they depend on; test, build for 20 projects (41 tasks)" \
  "$(run_times_check_summary "$dir/check.log")"

printf ' NX   No tasks were run\n NX   Successfully ran targets test, build for 2 projects\n' >"$dir/none.log"
expect "a check's Nx run with nothing affected" "no tasks; test, build for 2 projects" "$(run_times_check_summary "$dir/none.log")"

printf '%b' 'Running 9 tests using 3 workers\n\n  \e[31m1 failed\e[39m\n    [chromium] a.spec.ts\n  1 flaky\n  2 skipped\n  5 passed (1.2m)\n' >"$dir/smoke.log"
expect "a smoke run's Playwright totals" "5 passed, 1 failed, 1 flaky, 2 skipped, 3 workers" "$(run_times_smoke_summary "$dir/smoke.log")"
expect "a smoke run that stopped before the tests has no totals" "" "$(run_times_smoke_summary "$dir/check.log")"

exit "$failed"
