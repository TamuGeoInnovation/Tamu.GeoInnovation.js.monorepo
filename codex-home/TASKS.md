# codex-home: current tasks

You are OpenAI's Codex CLI working on TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, a **listener** named **codex-home** (Codex on the home machine) under
`DIRECTOR.md` at the top of this branch. Read `DIRECTOR.md`, then the repository's `CLAUDE.md` on `development`: it is
your project instructions too (Nx in Docker, LF files, the repository is public, issues and pull requests rules).

**Rules for you, in addition to DIRECTOR.md's listener rules:**
- Work only in your own worktree, `C:\TAMU\wt-codex-home-<task>`, on a branch the batch names. Never in the main checkout
  or another worktree.
- **Never push code, never touch GitHub** (no issues, comments or PRs). Commit on your branch; the director pushes it
  and opens the PR. You push only `codex-home/STATUS.md` and `codex-home/reports/` on this branch.
- Commit messages end with `Co-Authored-By: OpenAI Codex <noreply@openai.com>`.
- Never ask the maintainer anything; questions go in your report under **Questions for the director**.

## Batch 1 (19 October 2026)

1. **Join, and a first survey**
   - Create `codex-home/STATUS.md` (Running now, Last batch done, Told directly, Findings), push it with `codex-home: joined`.
   - Survey, read only: list AggieMap's services and components (`libs/aggiemap`, `libs/maps`, `libs/ui-kits`,
     `libs/common`, `libs/ts/events`) that have no spec file, with a line on what each does and how hard a first
     useful test would be. No code changes.
   - Report in `codex-home/reports/2026-10-19-1.md`, push with `codex-home: finished batch 1`. Then watch for batch 2.
