---
title: 'Arc: v0.7.0 Release'
date: '2026-09-02'
slug: arc-v0-7-0-release
---

Arc version 0.7.0, first released on September 2, 2026.

## Highlights

### One-Click Data Migration

Using Arc coming from other tools has never been easier. Arc can automatically import chat histories and API keys from Cline, Kilo Code, OpenCode, ZCode, and Continue, with support for more tools and data (memory, MCP, etc.) coming soon. Tool calls, reasoning, and responses are converted to Arc's native format, so you don't lose any work. We've also optimised chat history loading, so the chat stays reponsive regardless of the length.

### Prompt-Injection Protection

Arc now includes a built-in prompt-injection scanner, so malicious content is flagged and stopped before reaching the model. It detects role-tag forgeries, instruction overrides, sleeper triggers, and Base64-encoded evasion attempts. Untrusted remote outputs from web, browser, and MCP tools are datamarked and quarantined on deny, while write-time gates prevent persistent notes, skills, and workspace rules from being poisoned.

### Windows Sandboxing

Windows shell execution is no longer sandbox-less. Commands run under restricted tokens with dropped privileges, Low mandatory integrity, and Job Object lifecycle limits, matching our macOS seatbelt and Linux bwrap profiles.

### Shell Terminal Selection & Integrated Terminal

You can now choose the exact shell Arc uses for execution across Windows, macOS, and Linux (PowerShell, Git Bash, WSL distros, zsh, fish, Nushell, and more). Commands can run via Arc's background runner with sandboxing, or inside an integrated VS Code terminal.

## Changelog

### Chat

- Added an auto-approve selector in the top bar (Always ask, Safelist, Allowlist, Hail mary) for more granular control.
- Large conversations now use a windowed transcript rendering the newest 400 messages with scroll-to-top history expansion and a "Load earlier messages" button.
- Reverting to a message now reliably restores its text back into the composer even when retracting identical text consecutively.
- Foreground shell commands that time out are adopted into the background registry instead of killed, allowing you to inspect output, send input, or wait for completion.
- Browser steps (`browser.runCode` and `browser.evaluate`) now display captured code labeled "Code".
- The working indicator stays visible during reasoning and tool-preparation steps even while text streams.
- Added three attention sound styles: pitched beeps, bubble pops, and system default notification sounds.
- Attach submenus now dynamically open toward whichever viewport side has room.
- Model selections and auto-approve state changes broadcast instantly across all open webview panels.

### Sidebar Chat

- None.

### Fullscreen Chat

- None.

### Settings

- Reorganized settings into five tabs: Models, Providers, Agent, Tools, and Workspace, with collapsible nested sections.
- Added a dedicated About tab with version info, update log links, and the new Agent Data Import panel.
- Added one-click migration from Cline, Kilo Code, OpenCode, ZCode, and Continue, with selective credential and chat history import.
- Added shell terminal selection, automatically detecting installed shells across Windows (pwsh, PowerShell 5.1, Git Bash, WSL, cmd, Nushell), macOS, and Linux.
- Added shell execution surface setting: choose between Arc-handled background execution or running in an integrated VS Code terminal.
- Added multiple API keys support per provider with key preview masking, key addition/replacement/deletion, and automatic rotation.
- Added prompt-injection protection level setting (off, balanced, strict) in Tools > Security.
- Added OpenRouter embeddings provider option alongside Ollama for semantic search with automatic model discovery.
- Added dynamic model catalog search with provider-specific context, pricing, and output parameter overrides.
- Added curated default tool presets with a one-click reset to defaults button.
- Added a system sandbox profile option alongside workspace and read-only profiles.

### Backend

- One-click agent importer streams and normalizes chats and tool calls from Cline, Kilo Code, OpenCode, ZCode, and Continue, raising history caps to 100k messages and 512 MB.
- Built-in prompt-injection protection scanner detects token forgery, role hijacking, evasion encoding, and exfiltration attempts, datamarking remote tool outputs and quarantining denied payloads.
- Write-time security gates prevent memory poisoning in persistent notes, skill bodies, and workspace instructions.
- Added Windows sandbox support via restricted low-integrity tokens and Job Objects, providing write confinement matching macOS seatbelt and Linux bwrap.
- Added system sandbox profile across Windows, macOS, and Linux, allowing home directory writes while protecting core OS files.
- Added native git tools (`git.stage`, `git.commit`, `git.push`, `git.branch`, `git.pr`) with ref validation and force-with-lease safety.
- Added workspace hook management tools (`hooks.list`, `hooks.create`, `hooks.update`, `hooks.delete`) with interactive Arc prompt generation.
- Integrated VS Code terminal runner executes shell commands in a dedicated "Arc" terminal with serialized queues and shell-integration output capture.
- Provider failover loop rotates through multiple API keys per provider automatically across retries and failovers.
- One-click internal provider setup for free GLM 5.3 Flash and Qwen3.8 Flash models with direct process lifecycle management.
- Replaced static Artificial Analysis leaderboard data with live OpenRouter metadata and seven-day cached scoring.
- Added MCP SSE transport with live traffic capture and full OAuth authentication with loopback callback handling.
- Batched chat loading via `session/replaceState` replaces per-message IPC, loading large imports in a single state update.
- Hardened git resolution with null-caching and descriptive error messages.
