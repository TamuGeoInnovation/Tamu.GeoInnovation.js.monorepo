#!/usr/bin/env bash
# Tests tools/health.sh: the colour each measure gets from a machine's HEALTH.json, read from fixture files, and the
# thresholds read from fixture copies of the scripts that define them.
# Usage: bash tools/health.test.sh      (writes only inside its own temporary directory; no Docker, no network)
#
# Written 26 November 2026 for #3708. The case that matters most is the threshold one: CHECK_SWEEP_FREE_GB,
# CHECK_MIN_FREE_GB and TIDY_IMAGE_MAX_GB are read from scripts/check-in-volume.sh and scripts/tidy.sh, never copied, so
# a fixture script with a different default must move the colour - and a missing script must say so, not fall back to a
# number written here.
set -u
here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0
ok()   { pass=$((pass+1)); printf 'ok    %s\n' "$1"; }
no()   { fail=$((fail+1)); printf 'FAIL  %s\n       wanted: %s\n       got:    %s\n' "$1" "$2" "$3"; }
check() { if [ "$2" = "$3" ]; then ok "$1"; else no "$1" "$2" "$3"; fi; }

# shellcheck source=health.sh
. "$here/health.sh"

# The scripts the thresholds come from, as development writes them.
mkdir -p "$tmp/scripts"
printf '%s\n' 'local path="$1" needed="${2:-${CHECK_MIN_FREE_GB:-20}}" free' \
  'local path="$1" watermark="${2:-${CHECK_SWEEP_FREE_GB:-60}}"' > "$tmp/scripts/check-in-volume.sh"
printf '%s\n' 'advice="$(image_advice "$size" "${TIDY_IMAGE_MAX_GB:-300}" "$gain")"' > "$tmp/scripts/tidy.sh"
read_thresholds "$tmp/scripts"
check 'the sweep watermark is read from check-in-volume.sh' '60' "$SWEEP_GB"
check 'the refusal floor is read from check-in-volume.sh' '20' "$MIN_GB"
check 'the image threshold is read from tidy.sh' '300' "$IMAGE_GB"

# A HEALTH.json is one key per line; json_get reads one value, strings unquoted.
cat > "$tmp/h.json" <<'EOF'
{
  "machine": "lab",
  "disk_free_gib": 2512,
  "main_branch": "development",
  "ssh_github": "not measured here",
  "docker_answers": true,
  "note": "a \"quoted\" word"
}
EOF
check 'a number is read' '2512' "$(json_get "$tmp/h.json" disk_free_gib)"
check 'a string is read without its quotes' 'development' "$(json_get "$tmp/h.json" main_branch)"
check 'an escaped quote comes back as a quote' 'a "quoted" word' "$(json_get "$tmp/h.json" note)"
check 'a missing key is empty' '' "$(json_get "$tmp/h.json" nothing_here)"

# Each rule, at and either side of its line.
check 'free disk well above the watermark is green' 'green' "$(rate_free_disk 2512)"
check 'free disk below the sweep watermark is amber' 'amber' "$(rate_free_disk 59)"
check 'free disk below the refusal floor is red' 'red' "$(rate_free_disk 19)"
check 'the image over its threshold is amber' 'amber' "$(rate_image 730)"
check 'the image under it is green' 'green' "$(rate_image 299)"
check 'over 100 local branches is amber' 'amber' "$(rate_over 101 100)"
check '100 local branches is green' 'green' "$(rate_over 100 100)"
check 'a main checkout 6 days behind is green' 'green' "$(rate_behind 6 true)"
check 'a main checkout 7 days behind is amber' 'amber' "$(rate_behind 7 true)"
check 'a main checkout 30 days behind is red' 'red' "$(rate_behind 30 true)"
check 'a main checkout with no tidy.sh is red however recent' 'red' "$(rate_behind 0 false)"
check 'any uncommitted change in the main checkout is amber' 'amber' "$(rate_any 1)"
check 'none is green' 'green' "$(rate_any 0)"
check 'an orphaned check container is red' 'red' "$(rate_any_red 1)"
check 'Docker memory over 75% reserved is amber' 'amber' "$(rate_memory 13 16)"
check 'Docker memory over its limit is red' 'red' "$(rate_memory 17 16)"
check 'Docker memory at half is green' 'green' "$(rate_memory 8 16)"
check 'a check running 16 minutes is red' 'red' "$(rate_over_red 16 15)"
check 'a HEALTH.json 30 minutes old is green' 'green' "$(rate_age 30)"
check 'one 61 minutes old is amber' 'amber' "$(rate_age 61)"
check 'one 181 minutes old is red' 'red' "$(rate_age 181)"
check 'a GitHub check that failed is red' 'red' "$(rate_ok failed)"
check 'one that passed is green' 'green' "$(rate_ok ok)"
check 'core.longpaths off is amber' 'amber' "$(rate_flag false amber)"
check 'the build agents not running is red' 'red' "$(rate_flag false red)"

# What a machine cannot measure is shown as such, never as green.
check 'a value not measured here is grey' 'grey' "$(rate_free_disk 'not measured here')"
check 'an empty value is grey' 'grey' "$(rate_over '' 100)"

# The worst colour wins the row; grey never outranks a real colour.
check 'red outranks amber' 'red' "$(worst green amber red grey)"
check 'amber outranks green and grey' 'amber' "$(worst grey green amber)"
check 'all grey is grey' 'grey' "$(worst grey grey)"

# A threshold the source script no longer defines is unknown, not a number written here.
mkdir -p "$tmp/empty"
read_thresholds "$tmp/empty"
check 'a missing script leaves the threshold unknown' '' "$SWEEP_GB"
check 'and a disk measure then cannot be rated' 'grey' "$(rate_free_disk 59)"

# THE CASE THAT PROVES THE THRESHOLD IS READ: a script whose default moves moves the colour.
sed 's/CHECK_SWEEP_FREE_GB:-60/CHECK_SWEEP_FREE_GB:-70/' "$tmp/scripts/check-in-volume.sh" > "$tmp/scripts/x" && mv "$tmp/scripts/x" "$tmp/scripts/check-in-volume.sh"
read_thresholds "$tmp/scripts"
check 'a watermark of 70 in the script makes 65 GiB amber' 'amber' "$(rate_free_disk 65)"

# The whole table, from two machines' files: one healthy, one in trouble.
mkdir -p "$tmp/mail/good" "$tmp/mail/bad"
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > "$tmp/mail/good/HEALTH.json" <<EOF
{
  "machine": "good",
  "measured_utc": "$now",
  "disk_free_gib": 900,
  "docker_image_gib": 100,
  "local_branches": 20,
  "worktrees": 5,
  "main_behind_days": 0,
  "main_has_tidy": true,
  "main_tracked_changes": 0,
  "main_untracked": 0
}
EOF
cat > "$tmp/mail/bad/HEALTH.json" <<EOF
{
  "machine": "bad",
  "measured_utc": "$now",
  "disk_free_gib": 10,
  "docker_image_gib": 730,
  "local_branches": 258,
  "worktrees": 129,
  "main_behind_days": 31,
  "main_has_tidy": false,
  "main_tracked_changes": 0,
  "main_untracked": 2
}
EOF
read_thresholds "$tmp/scripts"
table=$(HEALTH_DIR="$tmp/mail" render_table)
check 'the healthy machine is green overall' 'green' "$(printf '%s\n' "$table" | awk -F'|' '$2 ~ /good/ {gsub(/ /, "", $3); print $3}')"
check 'the machine in trouble is red overall' 'red' "$(printf '%s\n' "$table" | awk -F'|' '$2 ~ /bad/ {gsub(/ /, "", $3); print $3}')"
case "$table" in *'258 amber'*) ok 'its branch count shows with its colour' ;; *) no 'its branch count shows with its colour' '258 amber' "$table" ;; esac

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
