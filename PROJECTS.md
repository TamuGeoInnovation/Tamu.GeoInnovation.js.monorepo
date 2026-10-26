# Who directs what

**One file, one table: each project, the chat that directs it, and since when.** The maintainer decided on 25 October 2026 (evening) to run
the work as **one coordinator and project leads** (`DIRECTOR.md`, "The coordinator"). A handover is a one-line change here, made by the
director handing over, in the same commit as its handover notes. **If this file and a chat disagree, this file wins**; fix the chat.

`tools/board.sh` shows what every listener is doing, from what they pushed. `tools/roster.sh` shows who is up.

| Project | Director (chat, machine) | Since | Notes |
| --- | --- | --- | --- |
| **Coordination** (lab time, the lock-file queue, questions to the maintainer) | *to be started the morning of 26 October 2026*: a fresh chat on the work computer, "coordinator" | - | Until then each project lead schedules its own work, as before. Its start: `coordinator/START.md` |
| **Security and dependencies** (#1218, #2111, #2122, the lock queue's security PRs) | `work (security)`: the work computer's security chat | 23 October 2026 | Hand-off: `security/HANDOFF.md`. Stays on the work computer, reached over Remote Control |
| **AggieMap** | `home (aggiemap)`: the home computer's AggieMap chat | 25 October 2026, evening | Release-494 (`392be39db`) is the production candidate, waiting on #2209 |
| **GIS Day** | `home (gisday)`: the home computer's GIS Day chat | 25 October 2026, evening | `DIRECTOR.md`, "Handover (gisday)" |
| **Visual testing** (`tools/visual-baselines`) | `work (visual testing)`: the work computer's Visual Testing chat | 25 October 2026 | |

## Listeners

| Listener | Machine | Agent | Started by | Takes batches from |
| --- | --- | --- | --- | --- |
| `work-lab-leila` | the lab | Claude Code | itself (`tools/listen.sh`) | any project lead; the coordinator orders them once it exists |
| `copilot-home` | the home computer | GitHub Copilot CLI | `tools/agent-runner.ps1` | any project lead |
| `codex-home` | the home computer | OpenAI Codex CLI | `tools/agent-runner.ps1 -Agent codex` (not running yet) | any project lead |
| `home` | the home computer | Claude Code | itself (`tools/listen.sh`) | any project lead |
| `work` | the work computer | Claude Code | itself (`tools/listen.sh`) | any project lead (not listening as of 25 October) |
