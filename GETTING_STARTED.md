# Nx Workspace Setup Guide

## Table of Contents

- [About Devcontainers](#why-devcontainers)
- [System Prerequisites](#system-prerequisites)
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
- [Final Step (All Paths): Run the Project](#final-step-all-paths-run-the-project)

---

# Devcontainers: What and why?

Devcontainers are the **strongly recommended** setup method for this project because they provide a consistent, isolated development environment that matches the production and CI setups. This ensures that all developers have the same tools and dependencies, reducing "works on my machine" issues. Additionally, devcontainers simplify the setup process by handling the installation of Node.js, TypeScript, and other tools automatically.

# System Prerequisites

- **Enable virtualization in BIOS/UEFI**  
  Without this, WSL2 and Docker Desktop will not run on Windows.
  - [How to enable virtualization on Windows](https://support.microsoft.com/en-us/windows/enable-virtualization-on-windows-c5578302-6e43-4b4b-a449-8ced115f58e1)

---

# Path 1: Windows Setup with Devcontainers (Recommended)

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
# from the repo root
nvm install
nvm use
```

Or explicitly:

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
# nvm install 20
# nvm use 20
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
