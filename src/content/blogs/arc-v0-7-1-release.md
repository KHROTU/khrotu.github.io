---
title: 'Arc: v0.7.1 Release'
date: '2026-09-04'
slug: arc-v0-7-1-release
---

Arc version 0.7.1, first released on September 4, 2026.

## Highlights

### OpenCode Headers

As OpenCode Go/Zen will require a custom session tracking header starting September 6th, we had to quickly make this update to ensure you can keep working without interruption. Normal updates are still roughly weekly.

### Responses API Support

Arc now officially supports OpenAI's Responses API; while previously some providers were able to convert requests of Responses-only models to Chat Completions, the official support ensures minimal errors.

### Cost-Aware Compaction

Compaction now uses a new algorithm to estimate the most cost efficient time to compact, taking into account cache hit/miss pricing output pricing, session token usage, summary size, and the cost of losing context.

## Changelog

### Chat

- None.

### Sidebar Chat

- None.

### Fullscreen Chat

- None.

### Settings

- Added provider pricing and model metadata to routing and settings.

### Backend

- Added OpenAI Responses API support with streaming content, reasoning, tools, images, cached-token usage, and format fallback.
- Improved Anthropic tool-result handling and provider model metadata.
- Added forced OpenRouter catalog refreshes.
- Compaction now chooses its boundary using cache pricing, token estimates, summary size, and context-loss penalties instead of token count alone.
- Compressed snapshots retain backward-compatible decoding, with increased limits for large histories.
- Windows sandbox shells stay on native Win32 terminals instead of being routed through a compatibility shell.
- Provider metadata, attribution headers, and model catalog entries were refreshed.
- Updated OpenAI-compatible usage handling and transport metadata.
- Added coverage for Responses API streaming, cost-aware compaction, catalog refresh, routing, agent reversion, edit validation, shell timeouts, attribution, and security hardening.
