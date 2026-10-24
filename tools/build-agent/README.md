# Build agent

A self-hosted **Azure Pipelines Linux agent in a container**, so the Monorepo pipeline can build on our own
machines as well as on Azure's three hosted agents (#2212). On the lab, `scripts/check-in-volume.sh` runs the
pipeline's work in 3 to 5 minutes. A hosted agent takes 15 to 25 minutes for one build.

| File | What it is |
| --- | --- |
| `Dockerfile` | Ubuntu 24.04, git, curl, jq, the Azure Pipelines agent (v4) and Node 24.22.1 in the agent's tool cache, where `UseNode@1` finds it instead of downloading it (the job log says *Found tool in cache: node 24.22.1 x64*); downloaded and checksummed at build time. No secrets. |
| `start.sh` | The container's entrypoint, adapted from Microsoft's [Run a self-hosted agent in Docker](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/docker) script: registers the agent, runs **one** job, removes the agent. |
| `run-agent.ps1` | The supervisor on Windows: reads the saved token (or asks for it), then runs one fresh container per job. |
| `save-agent-token.ps1` | Windows: asks for the token once and saves it so only this user on this machine can read it (DPAPI). |
| `install-agent-task.ps1`, `agent-task.ps1` | Windows: a hidden scheduled task at logon that waits for Docker and keeps `run-agent.ps1` running; `-Uninstall`. |
| `linux/` | Linux: `install.sh`, the systemd unit `tamu-build-agent.service`, and `run-agent.sh`, the same supervisor in bash. |
| `setup-organization.ps1` | Once per organization: creates the `Linux-Build` pool and sets the Monorepo pipeline's fork settings. |
| `egress/` | The agent's only way out: a Squid proxy (`Dockerfile`, `squid.conf`) that reaches the internet and refuses every private and local address. |

## Guard rails, and why

This repository is public and every pull request comes from a fork, so **the code a job runs is anyone's**. The
agent is set up so that code can do as little as possible:

- **It runs in a container, never on the host.** No host folder is mounted, the Docker socket is not, the host's
  network is not used, and the container is not privileged. No SSH keys, no `gh` login,
  nothing from `C:\Users`. A job sees only what it cloned. The one mount is the git mirror (below): a Docker volume, not
  a host folder, and **read-only**.
- **One job per container.** The agent runs with `--once`, and `run-agent.ps1` starts a fresh container for every
  job (`docker create --rm`), so nothing one job leaves behind, a file, a process or a cache, reaches the next.
- **Memory, CPU and processes are capped** (`--memory 12g --cpus 5 --pids-limit 8192`), so a job cannot starve the
  machine's own work.
- **Every Linux capability is dropped** except the three `start.sh` needs to switch to the agent's user and stop it
  (`SETUID`, `SETGID`, `KILL`), and `no-new-privileges` is set. The job's user, `agent`, has no capabilities and
  no `sudo`.
- **The job cannot read the token.** This differs from Microsoft's script, which writes the token to a file the
  job's user can read, and runs as that user, so `/proc/1/environ` holds the token too. Here `start.sh` starts
  as root, keeps the token only in its own memory, and runs the agent as `agent`. The token reaches `config.sh`
  through `VSTS_AGENT_INPUT_TOKEN`, set on that one command, never on a command line. The job runs as `agent`, and
  `agent` can read neither root's memory nor `/proc/1/environ`.
- **The agent is removed from the pool when its container stops**, after a job or on Ctrl+C. The agent's own
  credential (in `/azp/.credentials`) is readable by the job, as on any agent, so it must stop working once the
  job ends, and removing the agent does that.

- **It reaches the internet, and nothing local.** Each agent's container is on a network of its own,
  `tamu-agent-internal-<agent name>`, created with `--internal`: it has no route out at all, not even to another
  agent, and Docker gives it no outside DNS. Its only way out is the egress proxy, `tamu-agent-egress`, a Squid
  container on every agent's network and on Docker's default bridge. The
  proxy carries HTTPS (and plain HTTP) to public addresses on ports 443 and 80, and refuses every private,
  link-local, loopback and carrier-grade NAT address: the lab's own network, Docker's networks, the host
  (`host.docker.internal`) and cloud metadata addresses. It checks the address it actually connects to, so a public
  name that resolves to a private address is refused too. A job that ignores the proxy settings has nowhere to go,
  and with no capabilities it cannot change the container's routes. The proxy logs every connection, allowed or
  refused, to `docker logs tamu-agent-egress`.

  This needs no firewall rules on the host, so it works the same on Docker Desktop for Windows and on a plain Linux
  Docker host, and a restart of Docker changes nothing: the network persists, the proxy restarts itself
  (`--restart unless-stopped`), and `run-agent.ps1` recreates either if it is missing, before every job.

  **Why one network per agent:** a branch build on one agent has `app_configs` on disk while a fork's job may run on
  the next, so agents must not reach each other. Each network is a /28 of `172.31.251.0/24` picked from the agent's
  name, so it is the same at every start: `<machine>-<n>` takes slot n (1 to 12), `-test`, `-test2` and `-test3` take
  13 to 15, and slot s is `172.31.251.(16 s)/28`, with the proxy at `.(16 s + 2)`. So one machine holds up to twelve
  agents and three test ones. The proxy refuses those addresses like any other private one. Agents installed before
  this shared one network, `tamu-agent-internal` (`172.31.250.0/24`), which the proxy still accepts; reinstalling an
  agent moves it to its own, and the shared network is removed once only the proxy is left on it.

**The pipeline's fork settings are part of the guard rails** (step 2 below): secrets are not given to fork builds,
and a pull request from someone outside the team builds only after a team member comments on it.

## Adding a machine as a build agent

Each agent is named after its machine, `<machine>-1`: `lab-1`, `home-1`. The name appears in every job's log,
which is public, so it is never the computer's hostname. **The token is always the maintainer's, typed into a
hidden prompt.** It is saved once per machine where only the agent's owner can read it (below), and never put on
a command line, in a log or in a message; no Claude session handles it.

1. **The maintainer, once per organization: a token.** In Azure DevOps, User settings → Personal access tokens →
   New token, with scopes **Agent Pools: Read & manage** and **Build: Read & execute**, and an expiry of **90 days**
   (see [Token renewal](#token-renewal)). Keep it in a password manager.
2. **The maintainer, once per organization: the pool and the fork settings.** From the repository root:

   ```powershell
   powershell -File tools/build-agent/setup-organization.ps1 -DryRun
   powershell -File tools/build-agent/setup-organization.ps1
   ```

   It asks for the token, creates the `Linux-Build` pool if it does not exist (with `autoProvision`, so every
   project can use it), and sets the Monorepo pipeline's pull request trigger: forks build, **secrets are not made
   available to forks**, and a **team member's comment is required for non-team members**. It is safe to run twice:
   it skips a pool that exists and changes only settings that differ. `-DryRun` prints the changes and makes none.

   By hand instead: Organization settings → Agent pools → Add pool (self-hosted, `Linux-Build`, without granting
   access to all pipelines); then the Monorepo pipeline → Edit → ⋮ → Triggers → Pull request validation → *Pull requests from
   forks*: check *Require a team member's comment…* and *Only on pull requests from non-team members*, uncheck *Make
   secrets available to builds of forks*, and Save (not Save & queue).

   **Not safe to turn secrets off until #2216 merges:** the Build stage downloads the secure file `app_configs.zip`,
   and every pull request here comes from a fork, so with secrets off for forks every pull request build would fail
   at that step until the pipeline skips the download on fork pull requests (#2216). Until then, run the script with
   `-DryRun` only, and change only the comment setting by hand.

3. **Per machine (needs Docker): build the two images.** Fetch the repository, then:

   ```bash
   docker build -t tamu-gisc/build-agent:latest tools/build-agent
   docker build -t tamu-gisc/build-agent-egress:latest tools/build-agent/egress
   ```

   About a minute each; the agent's supervisor creates the network and starts the proxy itself. Rebuild the agent's
   image to take a new agent or Node version (change the `ARG`s in its `Dockerfile`, with the agent's SHA-256 from
   its release notes). On Linux, `install.sh` builds both.
4. **Per machine: the maintainer saves the token and starts the agent in the background.** It then runs with no
   window and no prompt, and comes back by itself after a restart.

   **Windows** (lab, home), as the user the agent runs as, without elevation:

   ```powershell
   powershell -File tools/build-agent/save-agent-token.ps1
   powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-1 -Start
   ```

   `save-agent-token.ps1` asks for the token without echoing it and saves it to
   `%LOCALAPPDATA%\tamu-build-agent\token.xml`: a SecureString protected with DPAPI, which only this user on this
   machine can decrypt, in a file only this user can open. `install-agent-task.ps1` registers the scheduled task
   `tamu-build-agent-lab-1`, which starts at this user's logon, hidden (`conhost --headless`). It waits for Docker
   Desktop to answer, then runs `run-agent.ps1 -TokenFile …` and restarts it a minute after it stops. It copies the
   scripts to `%LOCALAPPDATA%\tamu-build-agent\bin`, so switching the checkout's branch does not change what runs;
   run it again after pulling a change to them. `-Start` also starts it now. The task runs only while this user is
   logged on, because DPAPI needs the user's own logon to decrypt the token. Logs:
   `%LOCALAPPDATA%\tamu-build-agent\logs\`, one file per start, the newest twenty kept.

   **Linux** (the VMware build machines: Ubuntu with Docker Engine), as root:

   ```bash
   sudo tools/build-agent/linux/install.sh vm-1
   ```

   It builds both images, asks for the token without echoing it (unless one is saved), writes it to
   `/etc/tamu-build-agent/token` (root:root, mode 600, in a mode-700 folder), and installs and starts
   `tamu-build-agent.service`. That unit runs `linux/run-agent.sh`, the same loop in bash (Ubuntu has no PowerShell by
   default), after `docker.service`, at boot. Logs: `journalctl -u tamu-build-agent -f`.

   On both, each container prints *Configuring agent*, then *Running one job* while it waits for and runs a job,
   then *Removing agent*, and the next container starts at once. **If Azure DevOps refuses the token** (expired,
   revoked, a missing scope), the agent stops at once with one line saying so, and does not retry: see
   [Token renewal](#token-renewal). If a container fails to start three times in a row for any other reason (an
   unreachable address, say), the supervisor stops and is started again a minute later.

   To run the agent in a window instead, for a test: `powershell -File tools/build-agent/run-agent.ps1 -AgentName
   lab-test`, which asks for the token; Ctrl+C stops it.
5. **The maintainer, once per organization: let the pipeline use the pool.** Project settings → Agent pools →
   `Linux-Build` → Security → Pipeline permissions → add **Monorepo**. Without it, the first job that asks for the
   pool waits for a permission prompt.
6. **Check.** Organization settings → Agent pools → `Linux-Build` → Agents shows the agent **Online**. A pull request
   build that runs on the pool names the agent in its job log, under *Initialize job* → *Agent name*.

## The lab runs the heavy jobs

The Monorepo pipeline runs its heavy jobs (Cache or Restore, Lint, both Builds) on `Linux-Build` while `useLab` is
`true` in `azure-pipelines.yml`, and on Azure's hosted agents when it is `false`. The Setup stage's *Last SHA* job,
which always runs hosted, reads it (*Choose the lab or the hosted pool*) and says which in its log. Each heavy job is
in `azure-pipelines.yml` twice, once per pool, and exactly one of each pair runs. The lab's copy is named with
` on lab` (for example *Build development on lab*), so the job list and GitHub's checks show where each ran.

**There is no automatic fallback.** It was built at first: the Setup job asked Azure DevOps whether a `Linux-Build`
agent was online. But every pull request here comes from a fork, and a fork build's restricted job token cannot list
agent pools, so the answer was always "none" and every pull request ran hosted (build 5683, 23 October 2026). So if
every lab agent is down, pull request builds wait in the queue until one is back.

**To switch the lab off**, so everything runs hosted as before, change one line in `azure-pipelines.yml`:

```yaml
  useLab: false
```

## How many agents fit

Measured on the lab (#2212): one agent running the pipeline's whole workload (clone, `npm ci`, lint of 92 projects,
both builds) peaked at **10.4 GB of memory** with 6 CPUs (23 October 2026), and at **9.3 GB with 5 CPUs** (24 October
2026; the cgroup's `memory.peak`, page cache included), using at most 4.2 cores.

So each agent gets **`--memory 12g --cpus 5`** (the defaults of `run-agent.ps1`, `install-agent-task.ps1` and
`linux/run-agent.sh`): 2.7 GB over the measured peak. A machine runs as many as fit **while leaving at least 8 GB and 4
cores for its own work**, up to four. What counts is what Docker has, not the machine: `docker info --format '{{.NCPU}}
{{.MemTotal}}'`. The lab's Docker Desktop has 24 CPUs and 62.5 GiB, which fits **four**: 20 cores and 48 GiB, leaving 4
cores and 14.5 GiB. Five CPUs instead of six cost each build about 12 seconds (61 s against 48 s, measured on `development`
a day apart); a fourth agent saves a pull request the wait for the third agent to come back, about 25 seconds.
Each further agent on Windows is one more task, as in step 4:

```powershell
powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-2 -Start
powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-3 -Start
powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-4 -Start
```

They share the saved token and the egress proxy; each has its own network, so they cannot reach each other. On
Linux, set `MEMORY` and `CPUS` in the unit's environment to change one agent's share.

## The git mirror

A lab job's checkout used to clone the whole repository from GitHub, about 440 MB and up to 78 seconds, where a hosted
agent took 11 to 13. Now each agent has a bare mirror of the repository, `tamu-agent-git-mirror`, mounted at `/mirror`
**read-only**, and the lab's copies of the heavy jobs check out with `templates/tasks/checkoutFromMirror.yml` in place
of the checkout task (which cannot take a reference repository): `git init`, borrow the mirror's objects
(`objects/info/alternates`), then fetch every branch and the pull request's merge ref **from GitHub** and check out the
build's commit. Only what the mirror lacks travels; the history stays complete, as `affected` needs.

- **Only the supervisor writes the mirror, and only from GitHub**: before each job, `run-agent.ps1` (or
  `linux/run-agent.sh`) runs `git clone --mirror` the first time and `git fetch --prune` after that (about 1 second),
  in a short container of its own on Docker's default network, never in a job's container. A lock keeps agents
  started together from fetching into it at once. If the refresh fails, the job still checks out; it fetches more.
- **A job cannot change it**: the mount is read-only (`touch /mirror/…` gives *Read-only file system*), so nothing a
  fork's pull request runs can plant an object for the next job.
- **Measured** (24 October 2026, PR 2249's merge ref, a branch that exists only on a fork): **1.4 s with the mirror,
  48 KB fetched; 63.4 s and 439 MB without**, the same commit and the same tree, full history, `origin/development`
  present.
- Without a mirror (a hosted agent, or a lab agent whose volume is missing) the step fetches everything, with a
  warning, as the checkout task would.

## Token renewal

Tokens last 90 days. Before one expires (Azure DevOps emails a warning), or as soon as an agent stops with *Azure
DevOps refused the token*:

1. Create a new token as in step 1, and revoke the old one.
2. **Windows:** run `save-agent-token.ps1` again, then start the task by hand (`Start-ScheduledTask
   tamu-build-agent-lab-1`) or log off and on. A running agent picks the new token up with its next container.
   **Linux:** write the new token to `/etc/tamu-build-agent/token` (for example `sudo rm
   /etc/tamu-build-agent/token` and rerun `install.sh vm-1`, which asks for it), then `sudo systemctl restart
   tamu-build-agent`.

## Stopping or removing an agent

**In the background:** `install-agent-task.ps1 -AgentName lab-1 -Uninstall` on Windows, or `sudo
tools/build-agent/linux/install.sh --uninstall` on Linux. Either stops the agent cleanly, as below, and removes the
task or service. The saved token is left; delete it too if the machine is leaving. `sudo systemctl stop
tamu-build-agent` stops a Linux agent without removing it.

**In a window:** Ctrl+C. The supervisor stops the container with `docker stop`, `start.sh` tells the agent to
cancel any job it is running, and removes the agent from the pool. The agent then disappears from the pool's
Agents list.

Closing the window instead, or a crash or a restart of the machine, leaves the agent registered and offline. That
is harmless: the next start replaces it (`--replace`), and Azure does not send a job to an offline agent. If the
machine is leaving for good, remove the agent in Organization settings → Agent pools → `Linux-Build` → Agents → ⋮ →
Delete, and delete the image (`docker image rm tamu-gisc/build-agent:latest`).

If a container is left behind (`docker ps --filter name=tamu-build-agent`), `docker stop tamu-build-agent-<agent name>`
removes it the same way. The proxy and the networks can stay; if the machine is leaving, remove them too with
`docker rm -f tamu-agent-egress` and `docker network rm tamu-agent-internal-<agent name>` for each agent.

## Proven without Azure

On the lab, 23 October 2026 (#2212): the image runs the pipeline's Dependencies, Lint and Build work in a container
with these caps and no mounts; `start.sh` refuses to start without an address, without a token, or as a non-root
user; the guard rails hold from inside a running container (no Docker socket, no host folder, `agent` with no
capabilities, `memory.max` 24 GiB); and the token never reaches the job's environment or any process the job's
user can read. Registering with Azure, which needs the token, was not part of it.

The network restriction, on the lab the same day: from an agent container, npm, GitHub, Azure DevOps, Nx Cloud and
nodejs.org answer through the proxy; the LAN gateway, 10.x, 172.16.x, 172.17.x (Docker's bridge), 192.168.x,
Docker Desktop's host address, `host.docker.internal`, 169.254.169.254 and 127.0.0.1 are refused by it (403) on
ports 80 and 443; port 22 is refused; and without the proxy nothing is reachable, not even a public address. The
pipeline's install, lint and both builds still pass through it, and an agent with a dummy token reaches Azure
through it and is refused there (`VS30063`).

Running in the background, with a dummy token and the agent name `lab-test`, the same day. **Windows:** the saved
token's file allows only its user, with inheritance off, and holds a DPAPI blob, not the token. Registering the task
needed no elevation. Run by hand, it started hidden (no window), waited for Docker, reached Azure through the proxy,
was refused, and stopped once with its one line; no log holds the token. `-Uninstall` stopped a running agent in 2
seconds and left no task, process or container. **Linux**, on a throwaway Ubuntu 24.04 with systemd and Docker
Engine 29: `install.sh` built both images and saved the token root-only. The service started after Docker, and again
at boot; it was refused at *Connect*, exited 2, and was not restarted. With an unreachable address it failed three
times, exited 1, and systemd started it again. `--uninstall` left no unit or container.
