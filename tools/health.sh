#!/usr/bin/env bash
# One table of every machine's health, from each <machine>/HEALTH.json on origin/work-mailbox (#3708).
#
#   tools/health.sh        read only; prints a Markdown table, one row per machine, each value green, amber or red
#
# Why (26 November 2026): every machine had hundreds of finished branches and nobody had noticed, and home's main checkout
# was so far behind that scripts/tidy.sh did not exist in it. Each STATUS.md says what a machine is working on, never what
# shape it is in. tools/machine-health.sh measures one machine; this reads them all.
#
# THE DISK AND IMAGE THRESHOLDS ARE READ, NEVER COPIED. CHECK_SWEEP_FREE_GB and CHECK_MIN_FREE_GB come from
# scripts/check-in-volume.sh and TIDY_IMAGE_MAX_GB from scripts/tidy.sh, on origin/development, so a change there moves
# the colours here with nothing to keep in step. A script that no longer defines one leaves it unknown, and that measure
# shows grey: a number written here as a fallback would be exactly the copy this rule exists to prevent. An environment
# variable of the same name still overrides, as it does for the script itself.
#
# Grey is "not measured here" or "cannot be rated", and it never outranks a real colour: a machine with nothing measured
# is not called healthy, and one red measure makes the row red whatever else is grey.
#
# The other thresholds are the maintainer's, from #3708 and its comment, and live only here.
# Tested by tools/health.test.sh, which sources this file.
set -u

# A value from a HEALTH.json written by machine-health.sh: one "key": value per line. Strings come back unquoted.
json_get() { # <file> <key>
  sed -n "s/^[[:space:]]*\"$2\":[[:space:]]*//p" "$1" | head -1 | sed -E 's/,[[:space:]]*$//; s/^"(.*)"$/\1/; s/\\"/"/g; s/\\\\/\\/g'
}

# The default a script gives ${VAR:-N}, or nothing when it gives none.
default_in() { # <file> <VAR>
  [ -f "$1" ] || return 0
  grep -oE "\\\$\{$2:-[0-9]+\}" "$1" | head -1 | grep -oE '[0-9]+'
}

# Sets SWEEP_GB, MIN_GB and IMAGE_GB from the scripts in <dir>, an environment variable of the same name winning.
read_thresholds() { # <directory holding check-in-volume.sh and tidy.sh>
  SWEEP_GB=${CHECK_SWEEP_FREE_GB:-$(default_in "$1/check-in-volume.sh" CHECK_SWEEP_FREE_GB)}
  MIN_GB=${CHECK_MIN_FREE_GB:-$(default_in "$1/check-in-volume.sh" CHECK_MIN_FREE_GB)}
  IMAGE_GB=${TIDY_IMAGE_MAX_GB:-$(default_in "$1/tidy.sh" TIDY_IMAGE_MAX_GB)}
}

isnum() { [[ ${1:-} =~ ^[0-9]+(\.[0-9]+)?$ ]]; }
gt() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a > b) }'; }
lt() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a < b) }'; }

rate_free_disk() { # <GiB free>
  isnum "$1" && isnum "${SWEEP_GB:-}" && isnum "${MIN_GB:-}" || { echo grey; return; }
  if lt "$1" "$MIN_GB"; then echo red; elif lt "$1" "$SWEEP_GB"; then echo amber; else echo green; fi
}
rate_image() { # <GiB>
  isnum "$1" && isnum "${IMAGE_GB:-}" || { echo grey; return; }
  if gt "$1" "$IMAGE_GB"; then echo amber; else echo green; fi
}
rate_over() { # <value> <amber above>
  isnum "$1" || { echo grey; return; }
  if gt "$1" "$2"; then echo amber; else echo green; fi
}
rate_over_red() { # <value> <red above>
  isnum "$1" || { echo grey; return; }
  if gt "$1" "$2"; then echo red; else echo green; fi
}
rate_behind() { # <days behind development> <tidy.sh present: true|false>
  [ "${2:-}" = false ] && { echo red; return; }
  isnum "$1" || { echo grey; return; }
  if ! lt "$1" 30; then echo red; elif ! lt "$1" 7; then echo amber; else echo green; fi
}
rate_any() { # <count>: any is amber
  isnum "$1" || { echo grey; return; }
  if gt "$1" 0; then echo amber; else echo green; fi
}
rate_any_red() { # <count>: any is red
  isnum "$1" || { echo grey; return; }
  if gt "$1" 0; then echo red; else echo green; fi
}
rate_memory() { # <GiB reserved> <GiB limit>: above 75% amber, above the limit red
  isnum "$1" && isnum "$2" && gt "$2" 0 || { echo grey; return; }
  if gt "$1" "$2"; then echo red; elif gt "$1" "$(awk -v l="$2" 'BEGIN { print l * 0.75 }')"; then echo amber; else echo green; fi
}
rate_age() { # <minutes since measured>: over 1 hour amber (may be asleep), over 3 hours red
  isnum "$1" || { echo grey; return; }
  if gt "$1" 180; then echo red; elif gt "$1" 60; then echo amber; else echo green; fi
}
rate_ok() { # ok | failed | anything else
  case "$1" in ok) echo green ;; failed) echo red ;; *) echo grey ;; esac
}
rate_flag() { # <true|false> <colour when false>
  case "$1" in true) echo green ;; false) echo "$2" ;; *) echo grey ;; esac
}

worst() { # <colour>... -> the worst; grey only when nothing else was rated
  local c w=grey
  for c in "$@"; do
    case "$c" in
      red) w=red ;;
      amber) [ "$w" = red ] || w=amber ;;
      green) [ "$w" = grey ] && w=green ;;
    esac
  done
  echo "$w"
}

# Minutes since an ISO UTC time, or nothing.
minutes_since() {
  local t
  t=$(date -u -d "$1" +%s 2>/dev/null) || return 0
  echo $(( ( $(date -u +%s) - t ) / 60 ))
}

# The HEALTH.json files to read: HEALTH_DIR's */HEALTH.json for a test, otherwise origin/work-mailbox's, copied out.
health_files() {
  if [ -n "${HEALTH_DIR:-}" ]; then
    ls "$HEALTH_DIR"/*/HEALTH.json 2>/dev/null
    return
  fi
  local out=${HEALTH_WORK:?} f
  for f in $(git ls-tree -r --name-only origin/work-mailbox | grep -E '^[^/]+/HEALTH\.json$'); do
    mkdir -p "$out/$(dirname "$f")"
    git show "origin/work-mailbox:$f" | tr -d '\r' > "$out/$f"
    echo "$out/$f"
  done
}

cell() { # <value> <colour> [unit]
  local v=$1
  [ -n "$v" ] || v='-'
  if [ "$v" = 'not measured here' ]; then printf 'not measured'; else printf '%s%s %s' "$v" "${3:-}" "$2"; fi
}

render_table() {
  echo '| Machine | Overall | Seen | Free disk | Docker image | Branches | Worktrees | Main checkout behind | Main checkout uncommitted | Docker memory | Orphaned checks | Longest check | Dev node_modules | Stale Nx records | GitHub | Mailbox lag | core.longpaths | Oldest uncommitted | Playwright image | Build agents |'
  echo '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |'
  local f
  for f in $(health_files); do
    g() { json_get "$f" "$1"; }
    local machine age seen disk image br wt behind tidy dirty mem lim orph long devnm nx ssh ghs gscope lag lp old pw ag
    machine=$(g machine)
    age=$(minutes_since "$(g measured_utc)")
    local c_seen c_disk c_image c_br c_wt c_behind c_dirty c_mem c_orph c_long c_dev c_nx c_gh c_lag c_lp c_old c_pw c_ag
    c_seen=$(rate_age "$age"); seen=${age:+${age} min ago}
    disk=$(g disk_free_gib); c_disk=$(rate_free_disk "$disk")
    image=$(g docker_image_gib); c_image=$(rate_image "$image")
    br=$(g local_branches); c_br=$(rate_over "$br" 100)
    wt=$(g worktrees); c_wt=$(rate_over "$wt" 40)
    behind=$(g main_behind_days); tidy=$(g main_has_tidy); c_behind=$(rate_behind "$behind" "$tidy")
    dirty=$(awk -v a="$(g main_tracked_changes)" -v b="$(g main_untracked)" 'BEGIN { if (a ~ /^[0-9]+$/ && b ~ /^[0-9]+$/) print a + b }')
    c_dirty=$(rate_any "$dirty")
    mem=$(g check_memory_reserved_gib); lim=$(g docker_memory_limit_gib); c_mem=$(rate_memory "$mem" "$lim")
    orph=$(g orphaned_check_containers); c_orph=$(rate_any_red "$orph")
    long=$(g longest_check_minutes); c_long=$(rate_over_red "$long" "${HEALTH_CHECK_MAX_MIN:-15}")
    devnm=$(g dev_nm_angular); local lock vt; lock=$(g lock_angular); vt=$(g dev_nm_vite_temp)
    if [ -z "$devnm" ] || [ "$devnm" = 'not measured here' ]; then c_dev=grey
    elif [ "$devnm" != "$lock" ] || [ "$vt" = true ]; then c_dev=amber; else c_dev=green; fi
    nx=$(g stale_nx_records); c_nx=$(rate_any "$nx")
    ssh=$(g ssh_github); ghs=$(g gh_auth); gscope=$(g gh_project_scope)
    c_gh=$(worst "$(rate_ok "$ssh")" "$(rate_ok "$ghs")" "$(rate_ok "$gscope")")
    lag=$(g mailbox_oldest_queued_hours); c_lag=$(rate_over "$lag" 1)
    lp=$(g core_longpaths); c_lp=$(rate_flag "$lp" amber)
    old=$(g oldest_uncommitted_days); c_old=$(rate_over "$old" 7)
    pw=$(g playwright_image_present); c_pw=$(rate_flag "$pw" amber)
    ag=$(g build_agents_running)
    if [ "$ag" = 'not applicable' ]; then c_ag=grey; else c_ag=$(rate_flag "$ag" red); fi
    local overall
    overall=$(worst "$c_seen" "$c_disk" "$c_image" "$c_br" "$c_wt" "$c_behind" "$c_dirty" "$c_mem" "$c_orph" "$c_long" \
      "$c_dev" "$c_nx" "$c_gh" "$c_lag" "$c_lp" "$c_old" "$c_pw" "$c_ag")
    printf '| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' \
      "$machine" "$overall" "$(cell "$seen" "$c_seen")" "$(cell "$disk" "$c_disk" ' GiB')" "$(cell "$image" "$c_image" ' GiB')" \
      "$(cell "$br" "$c_br")" "$(cell "$wt" "$c_wt")" \
      "$(cell "${behind:+$behind d}${tidy:+, tidy.sh $( [ "$tidy" = true ] && echo present || echo missing )}" "$c_behind")" \
      "$(cell "$dirty" "$c_dirty")" "$(cell "${mem:+$mem of ${lim} GiB}" "$c_mem")" "$(cell "$orph" "$c_orph")" \
      "$(cell "${long:+$long min}" "$c_long")" "$(cell "${devnm:+$devnm (lock $lock)$( [ "$vt" = true ] && echo ', .vite-temp left over')}" "$c_dev")" "$(cell "$nx" "$c_nx")" \
      "$(cell "ssh $ssh, gh $ghs, project $gscope" "$c_gh")" "$(cell "${lag:+$lag h}" "$c_lag")" "$(cell "$lp" "$c_lp")" \
      "$(cell "${old:+$old d}" "$c_old")" "$(cell "$pw" "$c_pw")" "$(cell "$ag" "$c_ag")"
  done
}

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

git fetch -q origin work-mailbox development 2>/dev/null
HEALTH_WORK=$(mktemp -d); trap 'rm -rf "$HEALTH_WORK"' EXIT
mkdir -p "$HEALTH_WORK/scripts"
git show origin/development:scripts/check-in-volume.sh > "$HEALTH_WORK/scripts/check-in-volume.sh" 2>/dev/null
git show origin/development:scripts/tidy.sh > "$HEALTH_WORK/scripts/tidy.sh" 2>/dev/null
read_thresholds "$HEALTH_WORK/scripts"
render_table
echo
echo "Free disk: amber below ${SWEEP_GB:-?} GiB (CHECK_SWEEP_FREE_GB), red below ${MIN_GB:-?} GiB (CHECK_MIN_FREE_GB). Docker image: amber above ${IMAGE_GB:-?} GiB (TIDY_IMAGE_MAX_GB). All three read from origin/development's scripts."
echo "Grey means not measured on that machine, or no threshold could be read. One red value makes a row red."
