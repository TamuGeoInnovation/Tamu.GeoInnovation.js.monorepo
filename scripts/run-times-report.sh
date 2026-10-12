#!/usr/bin/env bash
# Prints every recorded run as one CSV table: one header, then the rows sorted by start time (#1593).
#
#   bash scripts/run-times-report.sh            # docs/build-times/runs in this checkout
#   bash scripts/run-times-report.sh <folder>
#
# The files are written by scripts/run-times.sh, one per run.
set -euo pipefail
# shellcheck source=run-times.sh
. "$(dirname "${BASH_SOURCE[0]}")/run-times.sh"

dir="${1:-$(git rev-parse --show-toplevel)/docs/build-times/runs}"
echo "$RUN_TIMES_HEADER"
for f in "$dir"/*.csv; do [ ! -f "$f" ] || sed 1d "$f"; done | sort
