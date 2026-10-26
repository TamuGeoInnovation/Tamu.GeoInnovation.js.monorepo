#!/bin/bash
# Registers one Azure Pipelines agent, runs one job with it, and removes it again (#2212).
#
# Adapted from Microsoft's "Run a self-hosted agent in Docker" start script. The differences, and why, are in
# README.md; the main one is that the token never reaches the user the job runs as.
set -euo pipefail

fail() {
  echo "error: $1" >&2
  exit 1
}

header() {
  printf '\n\033[1;36m%s\033[0m\n\n' "$1"
}

[ "$(id -u)" = 0 ] || fail "start.sh must start as root, to keep the token from the job. The agent and the job run as 'agent'."
[ -n "${AZP_URL:-}" ] || fail "AZP_URL is not set. It is the organization's address, e.g. https://dev.azure.com/<organization>."

# The token is read from the environment, or from a file named by AZP_TOKEN_FILE, and then kept only in this
# root shell's memory. Microsoft's script writes it to a file the job's user can read; here the job runs as
# 'agent', which can read neither this process's memory nor /proc/1/environ.
if [ -n "${AZP_TOKEN_FILE:-}" ]; then
  [ -r "$AZP_TOKEN_FILE" ] || fail "AZP_TOKEN_FILE is set, but '$AZP_TOKEN_FILE' cannot be read."
  token=$(<"$AZP_TOKEN_FILE")
elif [ -n "${AZP_TOKEN:-}" ]; then
  token=$AZP_TOKEN
else
  fail "AZP_TOKEN is not set. Start the agent with run-agent.ps1, which asks for the token."
fi
unset AZP_TOKEN AZP_TOKEN_FILE
[ -n "$token" ] || fail "The token is empty."

pool=${AZP_POOL:-Linux-Build}
agent_name=${AZP_AGENT_NAME:-$(hostname)}

# The egress proxy, when the container has no other way out (run-agent.ps1 sets it). The agent uses it for its own
# connection, and passes it to the tasks it runs.
proxy_args=()
if [ -n "${AZP_PROXY_URL:-}" ]; then
  proxy_args=(--proxyurl "$AZP_PROXY_URL")
fi

agent_pid=

# Runs a command as 'agent'. The agent reads its token from VSTS_AGENT_INPUT_TOKEN, so it is set only on the
# two commands that need it, config.sh and config.sh remove, and is never on a command line.
as_agent() {
  HOME=/home/agent setpriv --reuid=agent --regid=agent --init-groups -- "$@"
}

cleanup() {
  trap '' EXIT INT TERM

  # On a stop, the agent is told first, so it can cancel its job and the removal is not refused. The signal goes
  # to Agent.Listener itself: run.sh runs it in the foreground, so run.sh would act on a signal only once it ended.
  if [ -n "$agent_pid" ] && kill -0 "$agent_pid" 2>/dev/null; then
    pkill -INT -x Agent.Listener || true
    wait "$agent_pid" || true
  fi

  # config.sh writes .agent once it has registered.
  if [ -e /azp/.agent ]; then
    header "Removing agent '$agent_name' from pool '$pool'"
    for attempt in 1 2 3; do
      if VSTS_AGENT_INPUT_TOKEN="$token" as_agent ./config.sh remove --unattended --auth PAT; then
        return
      fi
      echo "Removal failed (attempt $attempt of 3); retrying in 10 seconds."
      sleep 10
    done
    echo "warning: agent '$agent_name' could not be removed. The next start replaces it; or remove it in Azure DevOps." >&2
  fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

header "Configuring agent '$agent_name' in pool '$pool'"

# '& wait' rather than running in the foreground, so a stop is handled at once rather than when the command ends.
VSTS_AGENT_INPUT_TOKEN="$token" as_agent ./config.sh --unattended \
  --url "$AZP_URL" \
  --auth PAT \
  --pool "$pool" \
  --agent "$agent_name" \
  --work _work \
  --replace \
  --acceptTeeEula \
  "${proxy_args[@]}" &
if ! wait $!; then
  # A refused token gets its own exit code, so the supervisor stops and says so rather than retrying a token that
  # will never work. config.sh records Azure's answer in its diagnostic log.
  if grep -qsE 'VS30063|401 \(Unauthorized\)|TF400813' /azp/_diag/Agent_*.log; then
    echo "error: Azure DevOps refused the token (expired, revoked or missing the Agent Pools scope)." >&2
    exit 77
  fi
  exit 1
fi

header "Running one job"

# --once: the agent takes one job and exits, and the supervisor starts a fresh container for the next.
as_agent ./run.sh --once &
agent_pid=$!
wait "$agent_pid"
