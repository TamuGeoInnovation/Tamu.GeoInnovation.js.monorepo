#!/usr/bin/env bash
# One answer to "which issue is this branch for". It names the Docker volume a check runs in
# (scripts/check-in-volume.sh) and decides which volumes a sweep may remove (scripts/tidy.sh), so both
# source this file rather than each deciding for itself - the two disagreeing is the fault behind #3802.
# Tested by scripts/volume-name.test.sh.
#
# A volume is shared on purpose: every check for one issue reuses that issue's clone and its Nx cache,
# which is why an unchanged task replays in about a second (#1402). So the name has to mean "issue 3802"
# and nothing else.
#
# It used to be the first run of digits anywhere in the branch name, which sent every dated branch to
# tamu-js-2026 - five in one checkout, docs/release-notes-2026-11-26 and batch/2026-10-06-verify among
# them - sharing one volume with each other and with any branch for the real issue #2026. The second
# dated branch's check was then refused as "already running" in a volume it had nothing to do with, and
# a sweep read 2026 as a closed issue and listed the volume as removable whatever was in it (#3802).

# Prints the issue number <branch> is for, or nothing when it is not an issue branch.
#
# Branches here are <type>/<issue>-<topic> (CONTRIBUTING.md), so the number counts only as the leading
# token of the part after the first slash: fix/3802-volume-name yes; release/v2, mb-a81 and
# verify/green-batch-2026-11-23 no. A date standing where the issue number would be is rejected by its
# shape - four digits, two, two, hyphen-separated - and never by its value. Ruling out numbers that look
# like years is tempting and wrong: issue numbers are in the 3900s and will pass 2026-shaped values,
# after which a range test would start dropping real issues with nothing to say it had.
branch_issue() {
  local rest

  case "$1" in
    */*) rest="${1#*/}" ;;
    *) return 0 ;;
  esac

  case "$rest" in
    [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*) return 0 ;;
  esac

  case "$rest" in
    [0-9]*) printf '%s\n' "${rest%%[!0-9]*}" ;;
  esac
}

# Prints the Docker volume name for <branch>: tamu-js-<issue> for an issue branch, and otherwise
# tamu-js-<the branch name, sanitised>, which gets its own volume rather than sharing anyone else's.
# A name that is not tamu-js-<number> is never on a sweep's removable list, which is the point.
volume_for_branch() {
  local issue
  issue="$(branch_issue "$1")"
  printf 'tamu-js-%s\n' "${issue:-$(printf '%s' "$1" | tr -c 'A-Za-z0-9_.-' '-')}"
}
