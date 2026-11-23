# Laptop: current tasks

## Batch 1 (gisday, for every director: make this machine ready for anything; 23 November 2026, from `work (gisday)`) (High) - **do this now**

**The maintainer's instruction (23 November 2026, relayed by the GIS Day director): the laptop is to be set up
completely, and you are to prompt him directly with every command it needs that you cannot run yourself.** This is
the one exception to "a listener never asks the maintainer": for this batch, ask him in your own chat. Record it under
**Told directly**.

Goal: when this batch is done, any director can give this machine any batch a development machine takes - AggieMap,
GIS Day or security - and nothing fails for want of setup.

1. **Audit first.** Compare this machine against `CLAUDE_SETUP.md` (every phase, including 6), `docs/gisday-local.md`,
   the smoke suite's README (`test/smoke/aggiemap/README.md`, `test/smoke/gisday/`), `tools/visual-baselines/README.md`,
   and what `home/STATUS.md` and `work/STATUS.md` say those machines can do. Write the gaps as a checklist in your
   `STATUS.md` under **Setup**, each marked done, yours, or the maintainer's. At least:
   - GIS Day local end to end: `scripts/gisday-local.sh`, its containers, its settings kept outside the repository
     (`C:/TAMU/gisday-local/`), and **signed-in** checks: `auth0-dev.local.env` for the **txgisday-dev** tenant only.
   - The Playwright image pulled, and one smoke spec run against dev for each app (AggieMap `one`, GIS Day), so a test
     batch can't fail on the first download.
   - An **SSH key** registered with GitHub (or HTTPS proven) so kubernetes-config can be cloned and pushed; a
     kubernetes-config clone at `C:\TAMU\kubernetes-config` on `master`. Kubernetes-config *work* still goes to `work`,
     but a clone costs nothing.
   - Docker's memory: if WSL's limit can go above about 15.4 GB on this hardware, say how (a `.wslconfig` change is his
     to make), and set `CHECK_MEMORY`/`CHECK_PARALLEL` to what fits until then.
   - `BUILD_TIMES_MACHINE=laptop` as a user environment variable.
   - The AggieMap dev server volume (`tamu-js-dev-nm`) installed from the current lock, and the server starting clean.
   - Anything else the documents or the other machines' status show this one lacks. Host Python is optional; say if
     something you'd be given needs it.
2. **Then ask the maintainer, in one message, for everything that is his**, as his global instructions say:
   Windows PowerShell 5.1, one command per block, each block that depends on a folder starting with its own `cd "<folder>";`,
   in the order they must run (a prerequisite gets its own earlier step), with what each does in a line. **Secrets go
   in through a hidden `Read-Host -AsSecureString` prompt written straight to the file, never pasted into chat or
   shown back**; never read `local-db.env`, and never print a secret's value. Anything needing a browser sign-in
   (GitHub SSH key page, Auth0 dashboard) is a numbered step for him with the exact page. Decisions go as numbered
   options with a recommendation. Ask once; when he says "done" or "written", verify each item yourself.
3. **Do everything that is yours** meanwhile, without waiting on his part.
4. **Prove it**: a bug-fix check (`scripts/check-in-volume.sh development gisday-angular,gisday-nest`), GIS Day local
   signed in as a made-up test user on txgisday-dev (no real names or emails, no real emails sent), one AggieMap smoke
   spec on dev, and one GIS Day smoke spec on dev. Report each result with its exit code.
5. Report `laptop/reports/2026-11-23-1.md`: the checklist, what was done by whom, what still can't be done and why.
   Update the **What this is** section of your `STATUS.md` so a director can see what this machine can now do.

Never: production, kubectl against the cluster, Auth0 tenants other than txgisday-dev, accepting Auth0 consent without
the maintainer saying so, or working around a permission refusal.
