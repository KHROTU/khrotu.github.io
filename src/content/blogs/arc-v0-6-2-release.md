---
title: 'Arc: v0.6.2 Release'
date: '2026-08-28'
slug: arc-v0-6-2-release
---

Arc version 0.6.2, first released on August 28, 2026.

## Highlights

### Auto Mode V2

Auto mode now understands the kind of task in front of it: code, math, deep reasoning, or agentic work. A new domain head classifies prompts in under a millisecond, and per-domain capability bars replace the old one-size bar, so a code-heavy prompt can reach a code specialist while a quick question stays on something fast and cheap. Model selection weighs reliability, latency, provider health, and cost together to pick the most efficient model that clears the bar, not just the strongest or cheapest. The difficulty model was retrained on the full labeled set, pushing AUC from 0.757 to 0.782, and when Auto mode is confident it can now send without confirmation, falling back to a quick confirm when it isn't. [Learn more](/blogs/arc-auto-mode-update).

### Reliable Rewinding

Reverting to a message now restores both the conversation and your files correctly, even across compaction boundaries. Checkpoint snapshots taken in the same turn merge instead of overwriting each other, restores are fault-tolerant per file, and rewinding to a pre-compaction point brings the archived context back with it.

### Tool-Run Summaries

You can now configure how tool call chains are summarised, either with a usage-based Arc-generated message (e.g. "Globbed and searched files") or a short model-written summary.

## Changelog

### Chat

- LaTeX math now renders in chat via a self-contained mini-KaTeX.
- Code blocks have been restyled to fit better within the chat interface.
- Reopening a chat now restores the exact context percentage and cost, since real provider prompt tokens are persisted instead of re-estimated.
- The recorded model for each turn matches the model you selected, fixing costs showing as $0 from wrong attribution.
- Turns that end with no visible output, including reasoning-only responses, are retried automatically with a hidden continuation prompt.
- Tool chains can be optionally summarised with richer information: a count, a phrase, or a model-written summary.
- Expand no longer clips in long tool chains.
- Native notifications only fire when the VS Code window is unfocused.
- The top-bar cost renders to one decimal place, and hovering shows the exact amount to three.

### Sidebar Chat

- Chat search no longer lets stale results overwrite fresh ones.

### Fullscreen Chat

- None.

### Settings

- Added UI and mono font selection, including custom family inputs.
- Added a tool-run summary setting: count, top tools, or model-written summary.
- Auto mode quality is now a single preset: balanced, economy, or power.
- Added `arc.router.autoRoute` to skip the routed-model confirmation in Auto mode and send directly.
- The compaction safety margin now applies, and the token reserve adapts to the model when no fixed strategy is set.

### Backend

- Auto mode routes per domain: selection minimizes a utility over clearing margin, latency, health, and cost, and the fleet only routes to models with a real Artificial Analysis score, weighted by live provider health and latency.
- A per-user tau raises the bar after soft failures from auto-routed turns.
- Retrained the difficulty model on the full 6,290-prompt set (AUC 0.757 to 0.782) and rebuilt calibration and capability data from all labels with three reliable anchors, dropping a broken anchor that had dragged routing quality to 0.49. Router assets are versioned so caches refresh.
- Requests now send per-provider app-attribution headers, a descriptive user-agent plus vendor-prefixed extras, so providers and aggregators can attribute traffic correctly.
- Compaction was reworked: segmentation no longer miscounts system messages, re-compaction folds prior summaries into the new one, `noCompact` protection covers whole tool chains, and dropped messages are archived so the model can re-read pre-compaction content via `context.retrieve`.
- A rewritten condensing prompt captures intent verbatim, decisions, code state, errors, task state, and constraints.
- Checkpoint snapshots in the same turn now merge instead of overwriting, so restores no longer miss files touched by shell or browser tools.
- Reverting to a message unions every undone turn oldest-wins per file and searches the archived region, so rewinds restore both context and files across compaction; restores are per-file fault-tolerant with an error list.
- The 4 MiB stream cap now counts assistant text only, so long-reasoning turns no longer abort mid-stream.
- Fixed agent lifecycle leaks: orphaned agents are stopped before replacement, approval and clarification timers are cleared, and deactivation now kills processes, terminates provider servers, and disposes listeners.
- Per-token webview broadcasts are coalesced to about 20 messages per second, duplicate session posts are gone, and inbound messages use a cheap size check instead of `JSON.stringify`.
- The MCP marketplace cache is bounded and its searches run in parallel, alongside browser-tab restore.
- Chat history codec bumped to ARCX v2, decoding v1 archives for backward compatibility.
- Audit log lock-contention warnings are suppressed when transient and rate-limited otherwise.
- Migrated to pnpm 11.
