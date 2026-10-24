#!/bin/bash
# Installs the build agent as a systemd service on a Linux host with Docker Engine (#2212). Run as root, from a
# checkout of the repository:
#
#   sudo tools/build-agent/linux/install.sh vm-1
#
# It builds the two images, asks for the token once without echoing it (unless one is already saved), saves it
# root-only, and installs and starts tamu-build-agent.service. 'install.sh --uninstall' stops the agent cleanly (it
# is removed from the pool) and removes the service; the token file is left.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
token_dir=/etc/tamu-build-agent
token_file=$token_dir/token
unit=/etc/systemd/system/tamu-build-agent.service

if [ "$(id -u)" != 0 ]; then
  echo "error: run install.sh as root (sudo)." >&2
  exit 1
fi

if [ "${1:-}" = --uninstall ]; then
  systemctl disable --now tamu-build-agent.service 2>/dev/null || true
  rm -f "$unit" /opt/tamu-build-agent/run-agent.sh
  systemctl daemon-reload
  echo "Removed tamu-build-agent.service. The token is still at $token_file; delete it too if this machine is leaving."
  exit 0
fi

name=${1:-}
if ! [[ "$name" =~ ^[a-z][a-z0-9]*-([0-9]+|test)$ ]]; then
  echo "usage: install.sh <machine>-1, e.g. vm-1. Never the hostname: the name is shown in public job logs." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "error: Docker does not answer. Install Docker Engine and start it first." >&2
  exit 1
fi

echo "Building the images..."
docker build -q -t tamu-gisc/build-agent:latest "$here/.." >/dev/null
docker build -q -t tamu-gisc/build-agent-egress:latest "$here/../egress" >/dev/null

# The token: root-only, the file created empty with its permissions before anything is written to it.
install -d -m 700 -o root -g root "$token_dir"
if [ ! -s "$token_file" ]; then
  read -rsp 'Azure DevOps personal access token (scopes: Agent Pools read & manage, Build read & execute): ' token
  echo
  if [ -z "$token" ]; then
    echo "error: no token was entered." >&2
    exit 1
  fi
  install -m 600 -o root -g root /dev/null "$token_file"
  printf '%s' "$token" >"$token_file"
  unset token
  echo "Saved the token to $token_file (root only)."
fi

install -d -m 755 /opt/tamu-build-agent
install -m 755 "$here/run-agent.sh" /opt/tamu-build-agent/run-agent.sh
sed "s/%AGENT_NAME%/$name/g" "$here/tamu-build-agent.service" >"$unit"
chmod 644 "$unit"
systemctl daemon-reload
systemctl enable tamu-build-agent.service >/dev/null
systemctl restart tamu-build-agent.service
echo "Installed and started tamu-build-agent.service as agent '$name'. Logs: journalctl -u tamu-build-agent -f"
