---
title: 'Arc: Auto Mode Update'
date: '2026-08-15'
slug: arc-auto-mode-update
---

Auto mode just got a lot smarter.

The difficulty model is now trained on the full set of labeled prompts, and it shows. Easy and hard are separated much more reliably, and Auto mode now understands the kind of task in front of it: code, math, deep reasoning, agentic work. That's what lets a code-heavy prompt reach a code-specialist, while a quick question stays on a fast, cheap model.

It also keeps an eye on how your models actually perform, from failure rate to latency, so a flaky provider doesn't quietly waste your turn.

The quality setting is now one simple choice: Balanced, Prefer cheaper, or Prefer stronger. And when Auto mode isn't sure, it shows you the model for a quick confirm instead of guessing.

The numbers moved too. Routing quality went from 0.688 to 0.700, strong-tier calls from 0.66 to 0.75, and average latency across a 30-model fleet from 3.7 seconds to 2.8.

Auto mode is still new, and honestly, we're just getting started.
