---
title: 'Arc: v0.6.1 Release'
date: '2026-08-12'
slug: arc-v0-6-1-release
---

Arc version 0.6.1, first released on August 12, 2026.

## Highlights

### Settings Overhaul

Settings have been reorganized into more granular tabs, so you can find what you need more easily. The new Tools tab lets you disable specific tools, saving tokens on requests.

### Clickable File References

References in chat now render as clickable chips. Clicking `path:line` or `path:start-end` opens the file and selects the exact range.

### Reversible Context Compression

Oversized tool outputs are now compressed before they're stored in history, and can be pulled back in full on demand. Long sessions stay usable without losing anything.

## Changelog

### Chat

- File references now render as clickable chips that link to the source.
- File-edit diffs stream live in the chat as they're applied.
- Compaction now shows a standalone "Compacted N messages" summary row instead of disappearing silently.
- Fixed chat-cost inflation that grew with history; costs and context percentage now hydrate correctly on open.

### Sidebar Chat

- Made the chat list more compact.

### Fullscreen Chat

- None.

### Settings

- Settings reorganized into more tabs.
- Added a Tools tab with category and individual tool checkboxes; disabled tools are omitted from model tool definitions.
- Added settings UI for reasoning effort, shell approval, and sandbox profile.
- Added `arc.diffView.autoOpen` to auto-open and stream file-edit diffs in the main window.

### Backend

- Oversized tool outputs (JSON, logs, text) are compressed before history and restored on demand via `context.retrieve`.
- Added `memory.note` and automatic per-workspace notes, written to `~/.arc` NOTES.md and injected into future sessions.
- Added polling-free wait tools (`wait.for`, `wait.until`, `wait.forProcess`, `wait.forCommand`) with abort support.
- Subagents now inherit the parent's approval config, so steering no longer triggers repeated approval prompts.
- `trackToolMistakes` now only trips when the identical tool call fails three times in a row.
- Approval dialogs now show readable summaries for every tool.
- Provider catalog expanded from 150+ to 262+ providers.
