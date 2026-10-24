# Build agent

A self-hosted **Azure Pipelines Linux agent in a container**, so the Monorepo pipeline can build on our own
machines as well as on Azure's three hosted agents (#2212). On the lab, `scripts/check-in-volume.sh` runs the
pipeline's work in 3 to 5 minutes. A hosted agent takes 15 to 25 minutes for one build.

| File | What it is |
| --- | --- |
| `Dockerfile` | Ubuntu 24.04, git, curl, jq, Node 24.22.1 and the Azure Pipelines agent (v4), downloaded and checksummed at build time. No secrets. |
| `start.sh` | The container's entrypoint, adapted from Microsoft's [Run a self-hosted agent in Docker](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/docker) script: registers the agent, runs **one** job, removes the agent. |
| `run-agent.ps1` | The supervisor the maintainer starts on a machine: asks for the token once, then runs one fresh container per job until Ctrl+C. |
| `setup-organization.ps1` | Once per organization: creates the `Linux-Build` pool and sets the Monorepo pipeline's fork settings. |

## Guard rails, and why

This repository is public and every pull request comes from a fork, so **the code a job runs is anyone's**. The
agent is set up so that code can do as little as possible:

- **It runs in a container, never on the host.** No host folder is mounted, the Docker socket is not, the network
  is Docker's own bridge rather than the host's, and the container is not privileged. No SSH keys, no `gh` login,
  nothing from `C:\Users`. A job sees only what it cloned.
- **One job per container.** The agent runs with `--once`, and `run-agent.ps1` starts a fresh container for every
  job (`docker create --rm`), so nothing one job leaves behind, a file, a process or a cache, reaches the next.
- **Memory, CPU and processes are capped** (`--memory 24g --cpus 16 --pids-limit 8192`), so a job cannot starve the
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

**What it does not stop: a job can reach the network**, including the machine's local network. The container is
on Docker's bridge network, so fork code could connect to anything the machine can reach. Before this takes a
fork's pull request unattended, restrict its outbound traffic (for example, a Docker network whose firewall rules
allow only the internet and not the local subnet).

**The pipeline's fork settings are part of the guard rails** (step 2 below): secrets are not given to fork builds,
and a pull request from someone outside the team builds only after a team member comments on it.

## Adding a machine as a build agent

Each agent is named after its machine, `<machine>-1`: `lab-1`, `home-1`. The name appears in every job's log,
which is public, so it is never the computer's hostname. **The token is always the maintainer's, typed into a
hidden prompt.** It is never written to a file, a command line or a message, and no Claude session handles it.

1. **The maintainer, once per organization: a token.** In Azure DevOps, User settings → Personal access tokens →
   New token, with scopes **Agent Pools: Read & manage** and **Build: Read & execute**, and a short expiry. Keep it
   only in a password manager.
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

   **Not yet safe to turn secrets off:** the Build stage downloads the secure file `app_configs.zip`, and every pull
   request here comes from a fork, so with secrets off for forks every pull request build would fail at that step.
   The pipeline must first skip that download on fork pull requests (#2212). Until then, run the script with
   `-DryRun` only, and change only the comment setting by hand.

3. **Per machine (needs Docker): build the image.** Fetch the repository, then:

   ```bash
   docker build -t tamu-gisc/build-agent:latest tools/build-agent
   ```

   About a minute. Rebuild it to take a new agent or Node version (change the `ARG`s in the `Dockerfile`, with the
   agent's SHA-256 from its release notes).
4. **Per machine: the maintainer starts the agent.**

   ```powershell
   powershell -File tools/build-agent/run-agent.ps1 -AgentName lab-1
   ```

   It asks for the token without echoing it and keeps it in memory for as long as it runs. Each container prints
   *Configuring agent*, then *Running one job* while it waits for and runs a job, then *Removing agent*; the next
   container starts at once. If a container fails to start three times in a row within two minutes (a wrong or
   expired token, an unreachable address), it stops and says so. Leave the window open; closing it is not a clean
   stop (see below).
5. **The maintainer, once per organization: let the pipeline use the pool.** Project settings → Agent pools →
   `Linux-Build` → Security → Pipeline permissions → add **Monorepo**. Without it, the first job that asks for the
   pool waits for a permission prompt.
6. **Check.** Organization settings → Agent pools → `Linux-Build` → Agents shows the agent **Online**. A pull request
   build that runs on the pool names the agent in its job log, under *Initialize job* → *Agent name*.

The pipeline uses the pool only once a job asks for it (`pool: name: Linux-Build` in `azure-pipelines.yml`). Until
then the agent waits and takes nothing.

## Stopping or removing an agent

**Ctrl+C** in the `run-agent.ps1` window. The supervisor stops the container with `docker stop`, `start.sh` tells
the agent to cancel any job it is running, and removes the agent from the pool. The agent then disappears from
the pool's Agents list.

Closing the window instead, or a crash or a restart of the machine, leaves the agent registered and offline. That
is harmless: the next start replaces it (`--replace`), and Azure does not send a job to an offline agent. If the
machine is leaving for good, remove the agent in Organization settings → Agent pools → `Linux-Build` → Agents → ⋮ →
Delete, and delete the image (`docker image rm tamu-gisc/build-agent:latest`).

If a container is left behind (`docker ps --filter name=tamu-build-agent`), `docker stop tamu-build-agent` removes
it the same way.

## Proven without Azure

On the lab, 23 October 2026 (#2212): the image runs the pipeline's Dependencies, Lint and Build work in a container
with these caps and no mounts; `start.sh` refuses to start without an address, without a token, or as a non-root
user; the guard rails hold from inside a running container (no Docker socket, no host folder, `agent` with no
capabilities, `memory.max` 24 GiB); and the token never reaches the job's environment or any process the job's
user can read. Registering with Azure, which needs the token, was not part of it.
