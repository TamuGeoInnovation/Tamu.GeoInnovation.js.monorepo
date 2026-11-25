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

# The API picks a site's sessions and emails by the request's host (siteHost), and a same-origin GET through the proxy
# carries no Origin, so the proxy names the site's own host in x-forwarded-host; without it the API answered as
# txgisday.org (#3050). The host is the one in the site's `address` in sites.ts.
for key in ucgis tamu txgisday; do
  host="$(sed -n "/^  $key: {/,/^  }/s#^ *address: 'https://\([^/']*\)'.*#\1#p" "$repo/libs/gisday/common/src/lib/sites.ts")"
  calls="$(web_calls --static --site "$key")"
  check "web --site $key tells the site proxy its host, $host" \
    '[ -n "$host" ] && grep -- "--name gisday-site" <<<"$calls" | grep -q -- "gisday-site-proxy.js $key gisday-dev 4201 4201 $host\$"'
done
check "the site proxy sends the host it is given as x-forwarded-host" \
  'grep -q "x-forwarded-host" "$repo/scripts/gisday-site-proxy.js"'

check "the nginx settings sit beside the script" '[ -f "$repo/scripts/gisday-local-static.conf" ]'

# Auth0 never skips its consent screen for a page on localhost, so the site is opened at gisday.local.test, which the
# hosts file points at 127.0.0.1 (#3136). `web` says so, and says when the hosts file does not have it; it never edits it.
web_says() {
  local hosts="$1"
  shift
  : >"$log"
  (cd "$repo" && PATH="$bin:$PATH" DOCKER_LOG="$log" GISDAY_HOSTS_FILE="$hosts" bash scripts/gisday-local.sh web "$@" 2>&1)
}
printf '# hosts\n127.0.0.1 localhost\n127.0.0.1\tgisday.local.test  # GIS Day local, #3136\n' >"$bin/hosts-with"
printf '127.0.0.1 localhost\n# 127.0.0.1 gisday.local.test\n10.0.0.1 gisday.local.test\n127.0.0.1 gisday.local.test.example\n' \
  >"$bin/hosts-without"
cp "$bin/hosts-with" "$bin/hosts-with.before"
for args in "" "--static" "--site ucgis"; do
  # shellcheck disable=SC2086
  said="$(web_says "$bin/hosts-with" $args)"
  check "web $args says to open http://gisday.local.test:4201" 'grep -q "Then open http://gisday.local.test:4201 " <<<"$said"'
  check "web $args still offers http://localhost:4201" 'grep -q "or http://localhost:4201" <<<"$said"'
  check "web $args says nothing about the hosts file when it has the name" '! grep -q "is not in" <<<"$said"'
  # auth0-spa-js runs only on a secure page, and http://gisday.local.test is not one unless the browser is told (#3136).
  check "web $args says the browser must treat gisday.local.test as secure" \
    'grep -q "the browser must treat it as secure: docs/gisday-local.md#signing-in" <<<"$said"'
  # shellcheck disable=SC2086
  said="$(web_says "$bin/hosts-without" $args)"
  check "web $args says when the hosts file does not point gisday.local.test at 127.0.0.1" \
    'grep -q "gisday.local.test is not in .*hosts-without. Add the line .127.0.0.1 gisday.local.test." <<<"$said"'
done
check "web leaves the hosts file as it was" 'cmp -s "$bin/hosts-with" "$bin/hosts-with.before"'
check "web without a hosts file says to add the line" \
  'web_says "$bin/no-such-hosts" | grep -q "gisday.local.test is not in"'
# The dev server refuses a request whose Host it does not know (Vite's allowedHosts), so the name has to be allowed
# in the configuration `web` serves, which is `local`.
check "the local dev server answers to gisday.local.test" \
  'sed -n "/\"serve\": {/,/\"readyWhen\"/p" "$repo/apps/gisday-angular/project.json" |
     sed -n "/\"local\": {/,/}/p" | grep -q "\"allowedHosts\": \[\"gisday.local.test\"\]"'
check "the API sample allows gisday.local.test as an origin, beside localhost" \
  'grep -qx "ORIGINS=http://localhost:4201,http://gisday.local.test:4201" "$repo/apps/gisday-nest/local.env.sample"'
check "the site returns from sign-in to its own address, not to a fixed host" \
  'grep -q "redirect_uri: window.location.origin + .\/callback." "$repo/apps/gisday-angular/src/environments/environment.local.ts"'

# Every docker call for `restore`, with a settings folder of its own: `restore` only needs local-db.env to exist.
restore_calls() {
  local dir
  dir="$(mktemp -d "$bin/local.XXXX")"
  : >"$dir/local-db.env"
  : >"$log"
  (cd "$repo" && PATH="$bin:$PATH" DOCKER_LOG="$log" GISDAY_LOCAL_DIR="$dir" bash scripts/gisday-local.sh restore >/dev/null 2>&1)
  cat "$log"
}

# The seed predates the newest migrations, so a restore that stopped there left an API that answered 500 on the
# sponsors and on a season day's events until someone ran `migrate run` (#2196).
restored="$(restore_calls)"
check "restore restores the database" 'grep -q -- "RESTORE DATABASE" <<<"$restored"'
check "restore then runs the migrations on that database, as migrate run does" \
  'grep -- "nx.js run" <<<"$restored" | grep -q -- "-e TYPEORM_DATABASE=gisday-nest-eh .*gisday-nest:migration-run"'
check "restore runs the migrations after the restore, not before" \
  '[ "$(grep -n -- "RESTORE DATABASE" <<<"$restored" | cut -d: -f1)" -lt "$(grep -n -- "gisday-nest:migration-run" <<<"$restored" | cut -d: -f1)" ] 2>/dev/null'

if [ "$failures" -gt 0 ]; then
  echo "$failures failed"
  exit 1
fi
echo "all passed"
