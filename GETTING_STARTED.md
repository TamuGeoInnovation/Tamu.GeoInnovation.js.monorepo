# Nx Workspace Setup Guide

## Table of Contents

- [Devcontainers: What and why?](#devcontainers-what-and-why)
- [Path 1: Windows Setup with Devcontainers (Recommended)](#path-1-windows-setup-with-devcontainers-recommended)
  - [1. Install WSL2](#1-install-wsl2)
  - [2. Install Docker Desktop](#2-install-docker-desktop)
  - [3. Install Visual Studio Code](#3-install-visual-studio-code)
  - [4. Install Git](#4-install-git)
  - [5. Create SSH Keys and Add to GitHub](#5-create-ssh-keys-and-add-to-github)
  - [6. Install Dev Containers Extension in VS Code](#6-install-dev-containers-extension-in-vs-code)
- [Path 2: Windows Setup with nvm-windows (Bare Metal)](#path-2-windows-setup-with-nvm-windows-bare-metal)
  - [1. Install Git](#1-install-git-1)
  - [2. Install nvm-windows](#2-install-nvm-windows)
  - [3. Install Node.js via nvm](#3-install-nodejs-via-nvm)
  - [4. Setup SSH Keys for GitHub](#4-setup-ssh-keys-for-github)
  - [5. Clone Repository and Install Dependencies](#5-clone-repository-and-install-dependencies)
- [Path 3: macOS/Linux Setup with nvm](#path-3-macoslinux-setup-with-nvm)
  - [1. Install Git](#1-install-git-2)
  - [2. Install nvm](#2-install-nvm)
  - [3. Install Node.js via nvm](#3-install-nodejs-via-nvm-1)
  - [4. Setup SSH Keys for GitHub](#4-setup-ssh-keys-for-github-1)
  - [5. Clone Repository and Install Dependencies](#5-clone-repository-and-install-dependencies-1)
- [Path 4: macOS/Linux Setup with Devcontainers (Recommended)](#path-4-macoslinux-setup-with-devcontainers)
  - [1. Install Docker](#1-install-docker)
  - [2. Install Visual Studio Code](#2-install-visual-studio-code-1)
  - [3. Install Git](#3-install-git-1)
  - [4. Create SSH Keys and Add to GitHub](#4-create-ssh-keys-and-add-to-github)
  - [5. Install Dev Containers Extension in VS Code](#5-install-dev-containers-extension-in-vs-code)
- [Path 5: Windows with Docker Only (No Local Node.js)](#path-5-windows-with-docker-only-no-local-nodejs)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Run AggieMap](#2-run-aggiemap)
  - [3. Stop AggieMap](#3-stop-aggiemap)
- [Working with Claude Code](#working-with-claude-code)
- [Final Step (All Paths): Run the Project](#final-step-all-paths-run-the-project)

---

# Devcontainers: What and why?

Devcontainers are the **_strongly recommended_** setup method for this project because they provide a consistent, isolated development environment that matches the production and CI setups. This ensures that all developers have the same tools and dependencies, reducing "works on my machine" issues. Additionally, devcontainers simplify the setup process by handling the installation of Node.js, TypeScript, and other tools automatically.

---

# Path 1: Windows Setup with Devcontainers (Recommended)

## Prerequisites

- **Enable virtualization in BIOS/UEFI**  
  Without this, WSL2 and Docker Desktop will not run on Windows.
- [How to enable virtualization on Windows](https://support.microsoft.com/en-us/windows/enable-virtualization-on-windows-c5578302-6e43-4b4b-a449-8ced115f58e1)

## 1. Install WSL2

👉 https://learn.microsoft.com/en-us/windows/wsl/install

Verify:

```powershell
wsl --status
```

**What to Expect:** Output includes `Default Version: 2`.  
**Troubleshooting:**

- If version is 1 → `wsl --set-default-version 2`.
- If `wsl` not recognized → enable _Windows Subsystem for Linux_ in “Turn Windows features on/off” and reboot.

📖 [WSL troubleshooting guide](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting)

---

## 2. Install Docker Desktop

👉 https://docs.docker.com/desktop/setup/install/windows-install/

Verify:

```powershell
docker version
```

**What to Expect:** Both `Client` and `Server` sections appear.  
**Troubleshooting:**

- If only `Client` → Docker Desktop not running.
- Ensure WSL2 backend is enabled in settings.

📖 [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/wsl/) | [Docker troubleshooting](https://docs.docker.com/desktop/troubleshoot/overview/)

---

## 3. Install Visual Studio Code

👉 https://code.visualstudio.com/Download#

---

## 4. Install Git

👉 https://git-scm.com/downloads/win  
(Default install is fine; includes Git Bash.)

---

## 5. Create SSH Keys and Add to GitHub

👉 [GitHub SSH overview](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

Generate (Git Bash):

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Add to SSH agent:  
👉 [Adding keys to agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#adding-your-ssh-key-to-the-ssh-agent)

Test:

```bash
git clone git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
```

**What to Expect:** Repo clones without asking for username/password.  
**Troubleshooting:**

- “Permission denied (publickey)” → run `ssh-add` or re-check GitHub key.
- Ensure `ssh-agent` service is running.

📖 [Testing SSH connection](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)

---

## 6. Install Dev Containers Extension in VS Code

👉 [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**What to Expect:** VS Code status bar shows `Dev Container: <name>`.  
**Troubleshooting:**

- If container build fails → check Docker Desktop is running.
- If repo doesn’t clone → re-check SSH setup.

📖 [VS Code Remote - Containers docs](https://code.visualstudio.com/docs/remote/containers)

---

# Path 2: Windows Setup with nvm-windows (Bare Metal)

## 1. Install Git

👉 https://git-scm.com/downloads/win

---

## 2. Install nvm-windows

👉 https://github.com/coreybutler/nvm-windows/releases

Verify:

```powershell
nvm version
```

**What to Expect:** Version like `1.1.12`.  
**Troubleshooting:** Ensure `C:\Program Files\nvm` is in PATH.

📖 [nvm-windows wiki](https://github.com/coreybutler/nvm-windows/wiki)

---

## 3. Install Node.js via nvm

The repository defines the Node.js version used by CI and the devcontainer. Prefer installing the exact version listed in the GitHub Actions workflow so your local environment matches CI.

Canonical locations to check for the version:

- CI (exact version): `.github/workflows/build.yml` — look for `node-version` (e.g. `20.18.1`).
- Devcontainer (image major): `.devcontainer/devcontainer.json` — image like `mcr.microsoft.com/devcontainers/typescript-node:20` (Node 20).

Install and use the exact CI version with nvm (example uses the value currently in `build.yml`).

```powershell
nvm install 20.18.1
nvm use 20.18.1
```

Check:

```powershell
node -v
npm -v
```

What to expect: matching version numbers. If the workflow is updated later, re-run the `nvm install <version>` command with the new `node-version` from `.github/workflows/build.yml`.

Fallback: if you want the latest Node 20.x series instead of the exact patch version, you can use:

```powershell
nvm install 20
nvm use 20
```

**Troubleshooting:** Run `nvm use <version>` if mismatch.

📖 [Node.js releases](https://nodejs.org/en/about/releases)

---

## 4. Setup SSH Keys for GitHub

👉 [GitHub SSH docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

Test:

```bash
ssh -T git@github.com
```

**What to Expect:**

```
Hi <username>! You've successfully authenticated...
```

**Troubleshooting:** Start `ssh-agent` service and re-check key.

📖 [Testing your SSH connection](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)

---

## 5. Clone Repository and Install Dependencies

```powershell
git clone git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
cd Tamu.GeoInnovation.js.monorepo
npm ci
```

---

# Path 3: macOS/Linux Setup with nvm

## 1. Install Git

Ubuntu/Debian:

```bash
sudo apt update && sudo apt install git -y
```

macOS:

```bash
brew install git
```

---

## 2. Install nvm

👉 https://github.com/nvm-sh/nvm

Verify:

```bash
nvm --version
```

**What to Expect:** Version string.  
**Troubleshooting:** Add `source ~/.nvm/nvm.sh` to `.bashrc`/`.zshrc`.

---

## 3. Install Node.js via nvm

As above for macOS/Linux: prefer the exact CI Node.js patch version from `.github/workflows/build.yml`. Example (current CI value):

```bash
nvm install 20.18.1
nvm use 20.18.1
```

Check:

```bash
node -v
npm -v
```

What to expect: correct version numbers. If you later find the Getting Started guide is out of date, check the two canonical sources mentioned earlier and follow the `node-version` in `build.yml`.

---

## 4. Setup SSH Keys for GitHub

👉 [SSH key setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

Test:

```bash
ssh -T git@github.com
```

**What to Expect:** GitHub success message.

---

## 5. Clone Repository and Install Dependencies

```bash
git clone git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
cd Tamu.GeoInnovation.js.monorepo
npm ci
```

---

# Path 4: macOS/Linux Setup with Devcontainers

## 1. Install Docker

👉 [Docker Engine on Linux](https://docs.docker.com/engine/install/)  
👉 [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac/)

Verify:

```bash
docker version
```

**What to Expect:** Both `Client` and `Server` versions appear.

---

## 2. Install Visual Studio Code

👉 https://code.visualstudio.com/Download#

---

## 3. Install Git

Ubuntu/Debian:

```bash
sudo apt update && sudo apt install git -y
```

macOS:

```bash
brew install git
```

---

## 4. Create SSH Keys and Add to GitHub

👉 [GitHub SSH docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

Generate:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Test:

```bash
ssh -T git@github.com
```

**What to Expect:** GitHub success message.

---

## 5. Install Dev Containers Extension in VS Code

👉 [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

Use Command Palette → **Clone Repository in Named Container Volume** →

```
git@github.com:TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo.git
```

**What to Expect:** Repo cloned inside container, VS Code status bar shows `Dev Container: <name>`.

📖 [VS Code Remote - Containers docs](https://code.visualstudio.com/docs/remote/containers)

---

# Path 5: Windows with Docker Only (No Local Node.js)

Runs every Node command in a throwaway `node:20.18.1` container against your checkout, so nothing but Docker Desktop and Git is needed on the host. Use this if you don't want a devcontainer or a local Node install. It is also the setup Claude Code uses; see [Working with Claude Code](#working-with-claude-code).

## Prerequisites

- Docker Desktop and Git, installed as in Path 1, steps 2 and 4.
- SSH keys added to GitHub, as in Path 1, step 5.
- The repository cloned. The commands below assume `C:\TAMU\Tamu.GeoInnovation.js.monorepo`; change the `-v` path to match your clone.

Run the commands from **Git Bash**. `MSYS_NO_PATHCONV=1` stops Git Bash from rewriting the Windows path in `-v`.

## 1. Install Dependencies

```bash
MSYS_NO_PATHCONV=1 docker run --rm -m 8g -e CYPRESS_INSTALL_BINARY=0 \
  -v "C:\TAMU\Tamu.GeoInnovation.js.monorepo:/w" -w /w node:20.18.1 \
  sh -c "npm ci --no-audit --no-fund"
```

**What to Expect:** `added ~2200 packages`, then the repo's `postinstall` (`ngcc`) runs for a few minutes.
**Notes:**

- The first run also downloads the `node:20.18.1` image, which is several hundred MB.
- `CYPRESS_INSTALL_BINARY=0` skips the ~800 MB Cypress download. It would be thrown away with the container on every run anyway, and serving the app doesn't need it. Leave the flag off if you run Cypress tests.
- A full-tunnel VPN can slow these downloads badly. Disconnect it if you can.

## 2. Run AggieMap

```bash
MSYS_NO_PATHCONV=1 docker run --rm -d --name aggiemap-dev -m 8g -p 4200:4200 \
  -v "C:\TAMU\Tamu.GeoInnovation.js.monorepo:/w" -w /w node:20.18.1 \
  sh -c "node node_modules/nx/bin/nx.js serve aggiemap-angular --host 0.0.0.0 --port 4200 --poll=2000"
```

Watch the first compile, which takes a few minutes:

```bash
docker logs -f aggiemap-dev
```

**What to Expect:** `✔ Compiled successfully.` Then open [http://localhost:4200](http://localhost:4200). The map can take 20–40 seconds to draw the first time.
**Notes:**

- **`--poll=2000` is required on Windows.** File-change events don't cross the Windows-to-Linux bind mount. Without polling, the server compiles once and then never rebuilds, even though it looks like it's working.
- Use `node node_modules/nx/bin/nx.js`, not `nx` or `npx nx`. `node_modules/.bin` may not be populated.
- `localhost:4200` shows dev-only features. `http://127.0.0.1:4200` hides them, so you can check the production code path without deploying.
- Both hostnames read map layers from the **production** GIS server (`gis.it.tamu.edu`). Only hostnames containing `dev` use `gis-dev.it.tamu.edu`. See `libs/aggiemap/ngx/common/src/lib/connections.ts`.

## 3. Stop AggieMap

```bash
docker stop aggiemap-dev
```

The container is removed when it stops. Run step 2 again to restart.

---

# Working with Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) runs Node commands with the Docker-only setup in [Path 5](#path-5-windows-with-docker-only-no-local-nodejs), so the host needs no Node.js install. Open the Claude Code session in the repository folder (for example `C:\TAMU\Tamu.GeoInnovation.js.monorepo`) so git, file links and the diff view work.

## What Claude Code needs from you

Claude Code can check each of these, but some need you to act in a browser or sign in:

- **Docker Desktop running.**
- **Your SSH key on GitHub _and_ authorized for SSO.** On [GitHub → Settings → SSH keys](https://github.com/settings/keys), click **Configure SSO → Authorize** for TamuGeoInnovation next to the key. Without that step, the key signs in to GitHub but is refused on this organization's repositories.
- **The GitHub CLI signed in.** Install it with `winget install --id GitHub.cli`, then run `gh auth login` in your own terminal. Claude Code uses `gh` for issues, pull requests and CI status. If `gh` was installed after the Claude Code session started, the session may not find it on `PATH`; restart the session, or Claude Code can call `C:\Program Files\GitHub CLI\gh.exe` directly.

## Things to tell Claude Code (or check it knows)

- The trunk is `development`, not `master`. Branch protection requires a pull request.
- Run `nx` through the Docker command in Path 5, as `node node_modules/nx/bin/nx.js`.
- Don't edit files while a Docker run is in progress. The bind mount is live, so the run's result would describe files that changed partway through.
- Most libraries have no `build` target. To typecheck a library, build the app that uses it. `nx test` only typechecks what the specs import, and `nx lint` doesn't typecheck at all.

---

# Final Step (All Paths): Run the Project

```bash
npx nx run aggiemap-angular:serve --host 0.0.0.0
```

**What to Expect:**

```
Angular Live Development Server is listening on 0.0.0.0:4200,
open your browser on http://localhost:4200/
```

Open [http://localhost:4200](http://localhost:4200) to view AggieMap.
