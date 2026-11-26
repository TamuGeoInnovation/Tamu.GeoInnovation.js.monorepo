#!/usr/bin/env bash
# Measures this machine and writes <machine>/HEALTH.json, for tools/health.sh (#3708).
#
#   tools/machine-health.sh <machine>     run from the work-mailbox checkout; writes <machine>/HEALTH.json, commits nothing
#
# Why (26 November 2026): every machine had hundreds of finished branches and nobody had noticed, and home's main checkout
# was so far behind that scripts/tidy.sh did not exist in it. STATUS.md says what a machine is doing; this says what shape
# it is in. It is meant to run at every heartbeat and at the end of every batch.
#
# It only reads. It removes, starts and stops nothing, and the build agents' containers are only listed by name.
# NO SECRETS: the Auth0 settings file is reported as present or absent, never opened. The SSH greeting names a GitHub
# login, so only "ok" or "failed" is kept from it. Nothing here prints a token.
#
# A measure this machine cannot take - no gh, no Docker, no dev volume - is written as "not measured here", and
# tools/health.sh shows it grey, never green. Each machine that can take it fills it in.
#
# The file is one "key": value per line, flat, so tools/health.sh can read it with sed: none of these machines has jq.
# Tested by tools/machine-health.test.sh, which sources this file.
set -u

NM='not measured here'

json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr -d '\r\n'; }
jstr() { printf '"%s": "%s"' "$1" "$(json_escape "$2")"; }
jnum() { if [[ ${2:-} =~ ^-?[0-9]+(\.[0-9]+)?$ ]]; then printf '"%s": %s' "$1" "$2"; else jstr "$1" "$NM"; fi; }
jbool() { case "${2:-}" in true | false) printf '"%s": %s' "$1" "$2" ;; *) jstr "$1" "$NM" ;; esac; }

# GitHub answers `ssh -T` with exit 1 even when the key works; the greeting is what says so.
ssh_result() { case "$1" in *"successfully authenticated"*) echo ok ;; *) echo failed ;; esac; }
# Without the project scope, gh silently skips project fields.
project_scope() { case "$1" in *"'project'"*) echo ok ;; *) echo failed ;; esac; }
days_between() { echo $(( ($2 - $1) / 86400 )); }
# A check container whose script has died: running check-* containers with no check-in-volume.sh process to own them.
orphans() { if [ "$2" -gt 0 ]; then echo 0; else echo "$1"; fi; }
# The node image scripts/check-in-volume.sh runs checks in, read from its text.
check_image() { grep -oE 'node:[0-9]+\.[0-9]+\.[0-9]+' | head -1; }
# The Playwright version package.json pins, which test/smoke/aggiemap/run-local.sh turns into its image.
playwright_version() { sed -n 's/.*"@playwright\/test": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' | head -1; }
auth0_file_line() {
  local f=${AUTH0_SETTINGS_FILE:-C:/TAMU/gisday-local/auth0-dev.local.env}
  if [ -e "$f" ]; then jbool auth0_settings_file_exists true; else jbool auth0_settings_file_exists false; fi
}
is_lab() { case "$1" in *lab*) echo yes ;; *) echo no ;; esac; }

# Sourced (by the test): stop here, with only the functions defined.
[ "${BASH_SOURCE[0]}" = "$0" ] || return 0

machine=${1:?machine}
[ -d "$machine" ] || { echo "no folder $machine: run this from the work-mailbox checkout" >&2; exit 2; }
mailbox=$(pwd)
main=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
now=$(date -u +%s)
lines=()
add() { lines+=("$1"); }

add "$(jstr machine "$machine")"
add "$(jstr measured_utc "$(date -u +%Y-%m-%dT%H:%M:%SZ)")"

# When origin was last fetched is read before this script fetches it, or it would always say "now".
fetch_head="$(git -C "$main" rev-parse --path-format=absolute --git-common-dir)/FETCH_HEAD"
fetched=$( [ -f "$fetch_head" ] && date -u -d "@$(stat -c %Y "$fetch_head")" +%Y-%m-%dT%H:%M:%SZ || echo "$NM")
git -C "$main" fetch -q origin 2>/dev/null
git fetch -q origin work-mailbox 2>/dev/null

# --- Disk
add "$(jnum disk_free_gib "$(df -Pk "$main" 2>/dev/null | awk 'NR == 2 { printf "%.0f", $4 / 1048576 }')")"
image=${DOCKER_DISK_IMAGE:-${LOCALAPPDATA:-}/Docker/wsl/disk/docker_data.vhdx}
add "$(jnum docker_image_gib "$( [ -f "$image" ] && awk -v b="$(wc -c < "$image")" 'BEGIN { printf "%.0f", b / 1073741824 }')")"

# --- Docker
if docker info --format '{{.MemTotal}}' > /tmp/mh-docker 2>/dev/null; then
  docker_up=true
  add "$(jbool docker_answers true)"
  add "$(jnum volumes "$(docker volume ls -q | grep -c '^tamu-js-')")"
  add "$(jnum docker_memory_limit_gib "$(awk '{ printf "%.1f", $1 / 1073741824 }' /tmp/mh-docker)")"
  reserved=0; checks=0; longest=0
  while IFS='|' read -r name img; do
    case "$img" in node:*) ;; *) case "$name" in check-*) ;; *) continue ;; esac ;; esac
    reserved=$(( reserved + $(docker inspect --format '{{.HostConfig.Memory}}' "$name" 2>/dev/null || echo 0) ))
    case "$name" in check-*)
      checks=$((checks + 1))
      started=$(date -u -d "$(docker inspect --format '{{.State.StartedAt}}' "$name" 2>/dev/null)" +%s 2>/dev/null || echo "$now")
      m=$(( (now - started) / 60 )); [ "$m" -gt "$longest" ] && longest=$m ;;
    esac
  done < <(docker ps --format '{{.Names}}|{{.Image}}')
  add "$(jnum check_containers "$checks")"
  add "$(jnum check_memory_reserved_gib "$(awk -v b="$reserved" 'BEGIN { printf "%.1f", b / 1073741824 }')")"
  scripts_running=$(ps -ef 2>/dev/null | grep -c '[c]heck-in-volume.sh')
  add "$(jnum orphaned_check_containers "$(orphans "$checks" "$scripts_running")")"
  add "$(jnum longest_check_minutes "$longest")"
else
  docker_up=false
  add "$(jbool docker_answers false)"
  for k in volumes docker_memory_limit_gib check_containers check_memory_reserved_gib orphaned_check_containers longest_check_minutes; do
    add "$(jnum "$k" '')"
  done
fi

# --- Branches and worktrees (the main checkout's repository, which every worktree shares)
add "$(jnum local_branches "$(git -C "$main" for-each-ref --format=x refs/heads | wc -l)")"
add "$(jnum worktrees "$(git -C "$main" worktree list --porcelain | grep -c '^worktree ')")"
local_only=0
while read -r b; do
  [ "$(git -C "$main" rev-list --count "$b" --not --remotes 2>/dev/null || echo 0)" -gt 0 ] && local_only=$((local_only + 1))
done < <(git -C "$main" for-each-ref --format='%(refname:short)' refs/heads)
add "$(jnum local_only_branches "$local_only")"
dirty=0; oldest=0; stale_nx=0
while read -r w; do
  [ -d "$w" ] || continue
  # The task database behind #1626, not the rest of the folder: its file maps and hashes are ordinary cache.
  compgen -G "$w/.nx/workspace-data/machine-v*.db" >/dev/null && stale_nx=$((stale_nx + 1))
  changed=$(git -C "$w" --no-optional-locks status --porcelain 2>/dev/null | sed -E 's/^...//; s/.* -> //')
  [ -n "$changed" ] || continue
  dirty=$((dirty + 1))
  while IFS= read -r p; do
    t=$(stat -c %Y "$w/$p" 2>/dev/null) || continue
    d=$(( (now - t) / 86400 )); [ "$d" -gt "$oldest" ] && oldest=$d
  done <<< "$changed"
done < <(git -C "$main" worktree list --porcelain | sed -n 's/^worktree //p')
add "$(jnum dirty_worktrees "$dirty")"
add "$(jnum oldest_uncommitted_days "$oldest")"
# A task record is stale only while no Nx is running to own it (#1626).
if ps -ef 2>/dev/null | grep -q '[n]x\.js'; then add "$(jnum stale_nx_records '')"; else add "$(jnum stale_nx_records "$stale_nx")"; fi

if command -v gh >/dev/null 2>&1 && git -C "$main" cat-file -e origin/development:scripts/unopened-branches.sh 2>/dev/null; then
  unopened=$(cd "$main" && bash <(git show origin/development:scripts/unopened-branches.sh) 2>/dev/null |
    sed -n 's/^Ahead of development: \([0-9]*\) with their issue open.*/\1/p')
  add "$(jnum unopened_branches_issue_open "$unopened")"
else
  add "$(jnum unopened_branches_issue_open '')"
fi

# --- The main checkout
add "$(jstr main_path "$main")"
branch=$(git -C "$main" symbolic-ref -q --short HEAD || echo detached)
add "$(jstr main_branch "$branch")"
add "$(jstr main_commit "$(git -C "$main" rev-parse --short HEAD)")"
add "$(jnum main_behind_commits "$(git -C "$main" rev-list --count HEAD..origin/development 2>/dev/null)")"
if [ "$(git -C "$main" rev-list --count HEAD..origin/development 2>/dev/null || echo 0)" -gt 0 ]; then
  add "$(jnum main_behind_days "$(days_between "$(git -C "$main" log -1 --format=%ct HEAD)" "$(git -C "$main" log -1 --format=%ct origin/development)")")"
else
  add "$(jnum main_behind_days 0)"
fi
status=$(git -C "$main" --no-optional-locks status --porcelain 2>/dev/null)
add "$(jnum main_tracked_changes "$(printf '%s\n' "$status" | grep -c '^[ MADRCU][MADRCU ] \|^[MADRCU]')")"
add "$(jnum main_untracked "$(printf '%s\n' "$status" | grep -c '^??')")"
add "$(jnum main_unpushed_commits "$(git -C "$main" rev-list --count HEAD --not --remotes 2>/dev/null)")"
add "$(jstr origin_fetched_utc "$fetched")"
add "$(jbool main_has_tidy "$( [ -f "$main/scripts/tidy.sh" ] && echo true || echo false)")"

# --- The mailbox checkout
add "$(jnum mailbox_behind "$(git -C "$mailbox" rev-list --count HEAD..origin/work-mailbox 2>/dev/null)")"
queued=$(bash "$mailbox/tools/queued.sh" "$machine" 2>/dev/null | awk '$2 == "queued" { print $1 }')
add "$(jnum mailbox_queued "$(printf '%s' "$queued" | grep -c .)")"
oldest_q=''
for id in $queued; do
  t=$(git log --format=%ct -S"## Batch $id " origin/work-mailbox -- "$machine/TASKS.md" 2>/dev/null | tail -1)
  [ -n "$t" ] || continue
  h=$(( (now - t) / 3600 )); { [ -z "$oldest_q" ] || [ "$h" -gt "$oldest_q" ]; } && oldest_q=$h
done
add "$(jnum mailbox_oldest_queued_hours "${oldest_q:-0}")"

# --- Sweeps: tidy.sh records only when --if-due last ran, and nothing of what any sweep removed.
stamp="${TIDY_STAMP:-${TMPDIR:-/tmp}/tamu-tidy-last}"
add "$(jstr tidy_last_scheduled_utc "$( [ -f "$stamp" ] && date -u -d "@$(stat -c %Y "$stamp")" +%Y-%m-%dT%H:%M:%SZ || echo "$NM")")"
add "$(jstr tidy_last_removed "$NM")"

# --- Versions
add "$(jstr check_node_image "$(git -C "$main" show origin/development:scripts/check-in-volume.sh 2>/dev/null | check_image)")"
add "$(jstr lock_angular "$(git -C "$main" show origin/development:package.json 2>/dev/null | sed -n 's/.*"@angular\/core": *"[^0-9]*\([0-9][0-9.]*\)".*/\1/p' | head -1)")"
if [ "$docker_up" = true ] && docker volume inspect tamu-js-dev-nm >/dev/null 2>&1; then
  img=$(docker image ls --format '{{.Repository}}:{{.Tag}}' | grep -E '^node:[0-9]' | head -1)
  if [ -n "$img" ]; then
    read -r ng nx vt < <(MSYS_NO_PATHCONV=1 docker run --rm -v tamu-js-dev-nm:/nm "$img" sh -c \
      'node -p "[require(\"/nm/@angular/core/package.json\").version, require(\"/nm/nx/package.json\").version].join(\" \")" 2>/dev/null || echo "- -"; [ -e /nm/.vite-temp ] && echo true || echo false' | tr '\n' ' ')
    add "$(jstr dev_nm_angular "$ng")"; add "$(jstr dev_nm_nx "$nx")"; add "$(jbool dev_nm_vite_temp "$vt")"
  fi
fi
[[ " ${lines[*]} " == *'"dev_nm_angular"'* ]] || { add "$(jstr dev_nm_angular "$NM")"; add "$(jstr dev_nm_nx "$NM")"; add "$(jstr dev_nm_vite_temp "$NM")"; }
pw=$(git -C "$main" show origin/development:package.json 2>/dev/null | playwright_version)
add "$(jstr playwright_image "mcr.microsoft.com/playwright:v${pw}-noble")"
if [ "$docker_up" = true ]; then
  add "$(jbool playwright_image_present "$(docker image inspect "mcr.microsoft.com/playwright:v${pw}-noble" >/dev/null 2>&1 && echo true || echo false)")"
else
  add "$(jbool playwright_image_present '')"
fi

# --- GitHub access
ssh_out=$(ssh -T -o BatchMode=yes -o ConnectTimeout=10 git@github.com 2>&1)
add "$(jstr ssh_github "$(ssh_result "$ssh_out")")"
if command -v gh >/dev/null 2>&1; then
  if gh_out=$(gh auth status 2>&1); then add "$(jstr gh_auth ok)"; else add "$(jstr gh_auth failed)"; fi
  add "$(jstr gh_project_scope "$(project_scope "$gh_out")")"
else
  add "$(jstr gh_auth "$NM")"; add "$(jstr gh_project_scope "$NM")"
fi
add "$(jbool core_longpaths "$( [ "$(git config --get core.longpaths)" = true ] && echo true || echo false)")"

# --- The lab's Azure build agents: only listed by name, never touched.
if [ "$(is_lab "$machine")" = yes ]; then
  if [ "$docker_up" = true ]; then
    n=$(docker ps --format '{{.Names}}' | grep -c '^tamu-build-agent-lab-')
    add "$(jbool build_agents_running "$( [ "$n" -gt 0 ] && echo true || echo false)")"
    add "$(jnum build_agents_count "$n")"
  else
    add "$(jbool build_agents_running '')"
  fi
else
  add "$(jstr build_agents_running 'not applicable')"
fi

add "$(auth0_file_line)"

{
  echo '{'
  last=$((${#lines[@]} - 1))
  for i in "${!lines[@]}"; do
    if [ "$i" -lt "$last" ]; then printf '  %s,\n' "${lines[$i]}"; else printf '  %s\n' "${lines[$i]}"; fi
  done
  echo '}'
} > "$machine/HEALTH.json"
echo "wrote $machine/HEALTH.json (${#lines[@]} measures)"
