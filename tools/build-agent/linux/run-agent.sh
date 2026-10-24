#!/bin/bash
# The build agent's supervisor on a Linux host, run by tamu-build-agent.service (#2212). The same loop as
# run-agent.ps1: a fresh container per job, the token read from a root-only file and handed to each container by
# environment variable, never on a command line. See ../README.md.
#
# Exit codes: 2 when Azure DevOps refuses the token (the service does not restart then), 1 for anything else.
set -euo pipefail

: "${AZP_AGENT_NAME:?AZP_AGENT_NAME is not set, e.g. vm-1}"
AZP_URL=${AZP_URL:-https://dev.azure.com/tamugeoinnovation}
AZP_POOL=${AZP_POOL:-Linux-Build}
TOKEN_FILE=${TOKEN_FILE:-/etc/tamu-build-agent/token}
IMAGE=${IMAGE:-tamu-gisc/build-agent:latest}
EGRESS_IMAGE=${EGRESS_IMAGE:-tamu-gisc/build-agent-egress:latest}

container="tamu-build-agent-$AZP_AGENT_NAME"
# The same network and proxy as on Windows: no route out but the proxy, which refuses every private address.
network=tamu-agent-internal
subnet=172.31.250.0/24
proxy=tamu-agent-egress
proxy_ip=172.31.250.2
proxy_url="http://$proxy:3128"

if [ ! -r "$TOKEN_FILE" ]; then
  echo "error: no token at $TOKEN_FILE. Run install.sh, or write it there (root, mode 600)." >&2
  exit 2
fi

# Creates the network and starts the proxy if either is missing; run before every job, so a restart of Docker
# while this runs is recovered from.
confirm_egress() {
  docker network inspect "$network" >/dev/null 2>&1 ||
    docker network create --internal --subnet "$subnet" "$network" >/dev/null
  if ! docker container inspect "$proxy" >/dev/null 2>&1; then
    docker run -d --name "$proxy" --restart unless-stopped \
      --memory 512m --cpus 1 --cap-drop ALL --security-opt no-new-privileges \
      "$EGRESS_IMAGE" >/dev/null
  fi
  if [ "$(docker container inspect -f '{{.State.Running}}' "$proxy")" != true ]; then
    docker start "$proxy" >/dev/null
  fi
  docker container inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$proxy" |
    grep -qw "$network" || docker network connect --ip "$proxy_ip" "$network" "$proxy"
}

stop_agent() {
  if docker container inspect "$container" >/dev/null 2>&1; then
    echo "Stopping agent '$AZP_AGENT_NAME' and removing it from the pool..."
    docker stop --time 120 "$container" >/dev/null || true
  fi
}
# 'systemctl stop' sends TERM: the agent is stopped the same way as Ctrl+C on Windows.
trap 'stop_agent; exit 0' TERM INT

echo "Starting agent '$AZP_AGENT_NAME' in pool '$AZP_POOL'."
failures=0
while true; do
  confirm_egress

  # The token is in this shell only for the 'docker create' that reads it, and passed by name (-e AZP_TOKEN).
  AZP_TOKEN=$(<"$TOKEN_FILE") docker create --rm --name "$container" \
    --memory 24g --memory-swap 24g --cpus 16 --pids-limit 8192 \
    --security-opt no-new-privileges \
    --cap-drop ALL --cap-add SETUID --cap-add SETGID --cap-add KILL \
    --network "$network" \
    -e AZP_URL="$AZP_URL" -e AZP_POOL="$AZP_POOL" -e AZP_AGENT_NAME="$AZP_AGENT_NAME" -e AZP_TOKEN \
    -e AZP_PROXY_URL="$proxy_url" \
    -e HTTP_PROXY="$proxy_url" -e HTTPS_PROXY="$proxy_url" -e http_proxy="$proxy_url" -e https_proxy="$proxy_url" \
    -e NODE_USE_ENV_PROXY=1 \
    "$IMAGE" >/dev/null

  started=$(date +%s)
  code=0
  # '& wait' so a TERM from systemd is handled at once.
  docker start --attach "$container" &
  wait $! || code=$?
  elapsed=$(($(date +%s) - started))
  echo "The agent's container exited with code $code after $elapsed seconds."

  if [ "$code" = 77 ]; then
    echo "Azure DevOps refused the token (expired, revoked or missing a scope)." \
      "Write a new one to $TOKEN_FILE, then: systemctl restart tamu-build-agent" >&2
    exit 2
  fi

  # A container that fails quickly every time (an unreachable address, say) would otherwise loop for ever;
  # after three, stop and let systemd start this again a minute later.
  if [ "$code" != 0 ] && [ "$elapsed" -lt 120 ]; then
    failures=$((failures + 1))
    if [ "$failures" -ge 3 ]; then
      echo "The agent failed to start three times in a row. Stopping; see its output above." >&2
      exit 1
    fi
    sleep 30
  else
    failures=0
  fi
done
