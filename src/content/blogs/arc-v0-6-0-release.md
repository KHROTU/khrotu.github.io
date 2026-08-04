---
title: 'Arc: v0.6.0 Release'
date: '2026-08-05'
slug: arc-v0-6-0-release
---

Arc version 0.6.0, first released on August 5, 2026.

## Highlights

### Auto Mode (Beta)

v0.6.0 brings the new Auto mode to Arc, which automatically routes prompts to the cheapest model that can handle the task. Relying on an in-house fine-tuned model, Auto mode makes sub-10ms decisions[^1] at 0.757 AUC[^2] based on internal testing. Crucially, Auto mode **isn't** limited to a specific set of models, and instead adapts to your configuration. [Learn more](/blogs/arc-auto-mode-beta).

### Prompt Polishing

When enabled, Arc automatically polishes your prompts before sending them to the model, and can be configured to provide either grammar/spelling-only corrections or full prompt rewriting.

### Chat History Encryption

Chat history is now stored in our own encrypted, compact ARCX binary format by default, providing better security and storage efficiency than JSON or SQLite.

## Changelog

### Chat

- Auto mode is available from the model picker. During beta, the router shows you its routing option with accept/reject controls before sending the prompt, giving you the final decision.
- Added prompt polishing. Polished prompts appear in the composer for approval before being sent.
- You can now see the model used for subagents.
- The stop button now stays visible whenever a task is running so you can cancel at any time.
- The queue/steer send button is now a single accent-coloured split control, matching the main send button.

### Sidebar Chat

- Added a collapsible plan bar above the composer, replacing the old to-do list UI.

### Fullscreen Chat

- None.

### Settings

- Added prompt polish settings, with `off`, `basic`, and `polish` modes.
- Added Auto quality bias, letting you route toward cheaper or stronger models.
- Added notification sound settings.

### Backend

- Pressing stop now always ends the current task. The busy state now reliably clears and you can send again, even if the agent got stuck mid-turn.
- Tasks that get repeated provider errors now end with a clear error instead of retrying forever.
- History compaction no longer splits tool-call chains across the compaction boundary.
- Larger sessions no longer lose older tool steps from the transcript after a restart.
- Post-edit LSP diagnostics and verification results are now part of the edit's own tool result instead of separate duplicate responses, fixing some provider errors and improving efficiency.
- Reverting a checkpoint now reliably removes the later snapshots, even when they were created moments apart.
- File tools now reject missing arguments with a clear error instead of writing the literal text `undefined` into files or searching for it.
- Editing files with Windows line endings no longer corrupts nearby lines when the search text has to be matched loosely.
- Added configurable per-session usage caps for `web.search`, `subagent.spawn`, and `mcp.call` tools.
- Writes to config files (`.arc/`, `.vscode/`, `.cursor/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, `.arcrules*`) now always require approval, even with auto-approve on.
- The agent now pauses and asks after repeated failing or identical tool calls instead of getting stuck.
- Messages marked `noCompact` (like plan instructions) now survive history compaction.
- Chat history automatically migrates to the encrypted ARCX format, cleaning up the old JSON file after the first save.
- Added `pre.compact` hook event with a `block` decision, plus an `instructions.loaded` hook event.
- Workspace conventions are now also picked up from `.cursorrules`, `.windsurfrules`, `.clinerules`, and `copilot-instructions.md`.
- Added `${env:VAR}` interpolation support in MCP server configs.

[^1]: Performance

Measured on an Intel® Core™ Ultra 9 Processor 185H, using a 5,000-prompt pool (p50 500-char / p90 1,300-char). Includes estimated data for an Intel® Core™ i5-12400F.

| Metric | Ultra 9 185H | i5-12400F |
| --- | --- | --- |
| mean | 1.96 ms | 2.33 ms |
| p50 | 1.57 ms | 1.87 ms |
| p90 | 3.33 ms | 3.96 ms |
| p99 | 7.07 ms | 8.41 ms |
| throughput | ~510 prompts/s | ~429 prompts/s |

[^2]: Accuracy

We evaluated Auto mode on 1,190 prompts, selected with seed 42 from the canonical pool of 5,947 labeled prompts.

| Category | Source | AUC | n |
| --- | --- | --- | --- |
| **Agentic** | swechat | **0.711** | 757 |
| | gdpval | 0.604 | 37 |
| | tbench | n/a¹ | 19 |
| | agenttrace | n/a¹ | 2 |
| **Knowledge QA** | hle | 0.443 | 88 |
| | gpqa | 0.603 | 140 |
| | scicode | 0.205 | 19 |
| | critpt | n/a¹ | 8 |
| **Environment-graded** | τ²-bench (trajectories) | **0.993** | 120 |
| **Overall** | all sources | **0.757** | 1,190 |
| *Category aggregates* | agentic (swechat+gdpval+tbench+agenttrace) | 0.714 | 815 |
| | knowledge (hle+gpqa+critpt+scicode) | 0.604 | 255 |
| | env-graded (τ²) | 0.993 | 120 |

¹ The tbench, agenttrace, and critpt results are not reported because those groups are too small or contain only one outcome type, while across all 1,190 evaluated prompts Auto mode achieved a balanced accuracy of 0.611 and a Brier score of 0.187.
