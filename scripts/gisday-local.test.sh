#!/usr/bin/env bash
# Tests what gisday-local.sh asks Docker to run for the GIS Day dev server, with a stand-in `docker`
# that records its arguments. No Docker, no network; runs in a second:
#
#   bash scripts/gisday-local.test.sh
#
# Exits non-zero, naming each failed case.
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/.." && pwd)"

bin="$(mktemp -d)"
trap 'rm -rf "$bin"' EXIT
log="$bin/docker.log"

# Every docker call succeeds and records its arguments, one call per line.
cat >"$bin/docker" <<'SH'
#!/usr/bin/env bash
echo "$*" >>"$DOCKER_LOG"
exit 0
SH
chmod +x "$bin/docker"

failures=0
check() {
  local name="$1" condition="$2"
  if eval "$condition"; then
    echo "ok   $name"
  else
    echo "FAIL $name"
    failures=$((failures + 1))
  fi
}

# The dev server's `docker run`, for `web` with the arguments given.
dev_server_run() {
  : >"$log"
  (cd "$repo" && PATH="$bin:$PATH" DOCKER_LOG="$log" bash scripts/gisday-local.sh web "$@" >/dev/null 2>&1)
  grep -- "--name gisday-dev" "$log"
}

run="$(dev_server_run)"

check "web starts the dev server" '[ -n "$run" ]'
check "the dev server polls for changes, which the Windows bind mount does not report" \
  'grep -q -- "--poll=" <<<"$run"'
# With polling, Node's 4 default file-system threads are kept busy checking the checkout over the bind
# mount, and Vite's dependency optimizer waits behind them for good: the first page load never finishes
# (#1955).
check "a polling dev server gets more file-system threads than Node's default 4" \
  'grep -qE -- "-e UV_THREADPOOL_SIZE=([5-9]|[1-9][0-9]+)( |$)" <<<"$run"'

site_run="$(dev_server_run --site ucgis)"
check "web --site starts the dev server with the same threads" \
  'grep -qE -- "-e UV_THREADPOOL_SIZE=([5-9]|[1-9][0-9]+)( |$)" <<<"$site_run"'

check "web without --static runs no nginx" '! grep -q nginx "$log"'

# Every docker call for `web` with the arguments given.
web_calls() {
  : >"$log"
  (cd "$repo" && PATH="$bin:$PATH" DOCKER_LOG="$log" bash scripts/gisday-local.sh web "$@" >/dev/null 2>&1)
  cat "$log"
}

# --static builds once and serves the build from nginx, because the dev server can stall for good at
# Vite's dependency optimizer (#2057).
static="$(web_calls --static)"
check "web --static builds gisday-angular with the local configuration" \
  'grep -q -- "nx.js build gisday-angular --configuration local" <<<"$static"'
check "web --static serves the build from nginx as gisday-dev on 4201" \
  'grep -- "--name gisday-dev" <<<"$static" | grep -q -- "-p 4201:4201 .*/dist/apps/gisday-angular:/site:ro.*gisday-local-static.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine"'
check "web --static starts no dev server" '! grep -q -- "nx.js serve" <<<"$static"'
check "web --static starts no site proxy" '! grep -q -- "--name gisday-site" <<<"$static"'

for args in "--static --site ucgis" "--site ucgis --static"; do
  # shellcheck disable=SC2086
  calls="$(web_calls $args)"
  check "web $args puts nginx on 4202" \
    'grep -- "--name gisday-dev" <<<"$calls" | grep -q -- "-p 4202:4201 .*nginx:alpine"'
  check "web $args puts the site proxy on 4201, in front of gisday-dev" \
    'grep -- "--name gisday-site" <<<"$calls" | grep -q -- "-p 4201:4201 .*gisday-site-proxy.js ucgis gisday-dev 4201 4201"'
done

check "the nginx settings sit beside the script" '[ -f "$repo/scripts/gisday-local-static.conf" ]'

if [ "$failures" -gt 0 ]; then
  echo "$failures failed"
  exit 1
fi
echo "all passed"
