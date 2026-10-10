#!/usr/bin/env bash
# Records each run in its own small file, docs/build-times/runs/<start>-<tool>-<machine>.csv: the header
# line and one row (#1593). One file per run, so two branches' runs never conflict when they merge;
# scripts/run-times-report.sh prints them all as one table. Sourced by scripts/check-in-volume.sh and
# test/smoke/aggiemap/run-local.sh, which call run_times_now when they start and run_times_record when
# they finish. Tested by scripts/run-times.test.sh.
#
# The file goes into the checkout the script was run from, uncommitted; commit it with your work.
# BUILD_TIMES_MACHINE names the machine (e.g. home, office). Set it once on each machine; without it the
# machine is "unspecified". The hostname is never used: this repository is public.

# Prints the time now in US Central, e.g. "2026-10-09 19:25:30 CDT", from PowerShell's time zone data.
# Git Bash has no tz database, so TZ=America/Chicago would silently give UTC (#1423). Where there is no
# PowerShell (Linux, the cloud session), prints UTC and says so: "2026-10-10 00:25:30 UTC".
run_times_now() {
  local ps="${RUN_TIMES_POWERSHELL:-powershell.exe}" t=""
  if command -v "$ps" >/dev/null 2>&1; then
    t="$("$ps" -NoProfile -NonInteractive -Command "\$z = [TimeZoneInfo]::FindSystemTimeZoneById('Central Standard Time'); \$t = [TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, \$z); \$t.ToString('yyyy-MM-dd HH:mm:ss') + ' ' + \$(if (\$z.IsDaylightSavingTime(\$t)) { 'CDT' } else { 'CST' })" 2>/dev/null | tr -d '\r')"
  fi
  case "$t" in
    [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\ [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\ C[DS]T) echo "$t" ;;
    *) date -u '+%Y-%m-%d %H:%M:%S UTC' ;;
  esac
}

# Prints the machine's name: BUILD_TIMES_MACHINE, made safe for a file name, or "unspecified".
run_times_machine() {
  printf '%s' "${BUILD_TIMES_MACHINE:-unspecified}" | tr -c 'A-Za-z0-9_.-' '-'
}

# Prints its argument as one CSV field: quoted, with quotes doubled, when it holds a comma, quote or newline.
run_times_csv_field() {
  case "$1" in
    *[,\"$'\n']*) printf '"%s"' "${1//\"/\"\"}" ;;
    *) printf '%s' "$1" ;;
  esac
}

RUN_TIMES_HEADER='started,machine,tool,ran,exit,summary,seconds,elapsed,setup'

# Writes a run's file into <folder>, named from <started> (as run_times_now prints it), the tool and the
# machine: 2026-10-09T192530-check-home.csv, or 2026-10-10T002530utc-check-home.csv for a UTC start.
#   run_times_record <folder> <started> <tool> <ran> <exit> <summary> <seconds> [<setup>]
# Never fails and never stops a `set -e` script: a file that cannot be written is a warning on stderr.
run_times_record() {
  local file
  if file="$(
    set -eu
    dir="$1"; started="$2"; tool="$3"; ran="$4"; code="$5"; summary="$6"; seconds="$7"; setup="${8:-}"
    machine="$(run_times_machine)"
    elapsed="$(printf '%d:%02d:%02d' $((seconds / 3600)) $((seconds % 3600 / 60)) $((seconds % 60)))"
    row=""
    for f in "$started" "$machine" "$tool" "$ran" "$code" "$summary" "$seconds" "$elapsed" "$setup"; do
      row="${row:+$row,}$(run_times_csv_field "$f")"
    done
    stamp="${started:0:10}T${started:11:8}"
    stamp="${stamp//:/}"
    case "$started" in *\ C[DS]T) ;; *) stamp="${stamp}utc" ;; esac
    file="$dir/$(printf '%s' "$stamp-$tool-$machine" | tr -c 'A-Za-z0-9_.-' '-').csv"
    # Two runs of one tool on one machine in the same second: keep both.
    [ ! -e "$file" ] || file="${file%.csv}-$$.csv"
    # Chained, because `set -e` does nothing inside an `if` condition.
    { mkdir -p "$dir" && printf '%s\n%s\n' "$RUN_TIMES_HEADER" "$row" >"$file"; } 2>/dev/null && printf '%s' "$file"
  )"; then
    echo "Run time recorded in $file" >&2
  else
    echo "Warning: could not record this run's time in $1 (the run's result is unaffected)." >&2
  fi
  return 0
}

# Prints the setup steps' durations from a check-in-volume.sh log, e.g. "clone 30 s, npm ci 66 s": the
# time between each "=== clone|npm ci HH:MM:SS" line and the "=== exit" line after it.
run_times_check_setup() {
  sed -n 's/^=== \(clone\|npm ci\|exit [0-9]*\) \([0-9:]*\)$/\1 \2/p' "$1" 2>/dev/null | awk '
    function s(t, p) { split(t, p, ":"); return p[1] * 3600 + p[2] * 60 + p[3] }
    $1 == "exit" && step != "" { d = s($3) - s(start); if (d < 0) d += 86400; out = out (out ? ", " : "") step " " d " s"; step = "" ; next }
    $1 != "exit" { step = ($1 == "npm" ? "npm ci" : $1); start = $NF }
    END { print out }'
}

# Prints what Nx ran, from a check-in-volume.sh log, e.g. "lint, test, build for 108 projects", or "no
# tasks"; several runs are joined with "; ".
run_times_check_summary() {
  sed -n -e 's/^ *NX *\(Successfully ran\|Ran\) targets\{0,1\} \(.* for .*\)$/\2/p' \
    -e 's/^ *NX *No tasks were run.*$/no tasks/p' "$1" 2>/dev/null |
    sed 's/[: ]*$//' | paste -sd';' - | sed 's/;/; /g'
}

# Prints Playwright's totals from a run's output, e.g. "5 passed, 1 failed, 0 flaky, 2 skipped, 3 workers",
# or nothing when the output has none (the run stopped before the tests).
run_times_smoke_summary() {
  sed 's/\x1b\[[0-9;]*m//g' "$1" 2>/dev/null | awk '
    /^Running [0-9]+ tests? using [0-9]+ workers?/ { workers = $5 }
    /^ +[0-9]+ (passed|failed|flaky|skipped)/ { n[$2] = $1; seen = 1 }
    END { if (seen) printf "%d passed, %d failed, %d flaky, %d skipped, %d workers\n", n["passed"], n["failed"], n["flaky"], n["skipped"], workers }'
}
