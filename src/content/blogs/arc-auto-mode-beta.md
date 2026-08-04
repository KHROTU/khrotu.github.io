---
title: 'Arc: Auto Mode (Beta)'
date: '2026-08-04'
slug: arc-auto-mode-beta
---

[promo video](/blogs/arc-auto-mode-beta/video.webm)

Today, we're introducing Auto mode in beta.

## Highlights

Arc now looks at the prompt in front of you, estimates how difficult it is, and routes it to the cheapest model that gets the job done.

The result is a more practical model choice: faster on routine prompts, more deliberate on difficult ones, and it adapts to any set of models.

You can also adjust the quality setting to route toward stronger or cheaper models, depending on your need.

It's still in beta. Routing is strong on the prompts we've tuned for, and less consistent outside that range. We'll keep improving it from here.

## Methodology

We trained a small model that answers a simple question: how hard is this prompt?

To get the labels, we ran current models at four capability levels, scores 14, 34, 51, and 57 on the intelligence index, against a large number of prompts made up of real coding sessions and various benchmarks[^1]. Every model answered inside Arc's own environment with the same system prompt and tools used in production, so difficulty is measured the way it's actually used.

Grading was the hard part. Where we could run the task for real, like the agentic banking and telecom suites, we let the agent work through the whole thing for up to eight turns with tools executing against the real environment, then replayed the trajectory and graded it against database checks and natural-language assertions. Everywhere else, we use an LLM-as-a-judge approach to grade responses.

The classifier is a simple TF-IDF over word pairs with a logistic curve. We also experimented with fancier models, including MiniLM fine-tunes and a three-fold ensemble, and they all landed within 0.01 AUC of the simple one, so we went with the simplest and fastest option.

In internal testing we see 0.79 AUC on mixed prompts, 0.71 on real coding prompts, and 0.9 to 0.99 on the agentic suites.

If you want to help us improve Auto mode, see the [community repo](https://github.com/KHROTU/arc-community).

[^1]: Every source in the aggregated prompt dataset, containing 6,127 unique prompts.

| Source | Prompts |
| --- | --- |
| [swechat](https://huggingface.co/datasets/SALT-NLP/SWE-chat) | 3,735 |
| [tau2](https://github.com/sierra-research/tau2-bench) | 761 |
| [gpqa](https://huggingface.co/datasets/hendrydong/gpqa_main) / [gpqa_diamond](https://huggingface.co/datasets/hendrydong/gpqa_diamond) | 646 |
| [hle](https://huggingface.co/datasets/cais/hle) | 500 |
| [gdpval](https://huggingface.co/datasets/openai/gdpval) | 220 |
| [agenttrace](https://huggingface.co/datasets/trace-commons/agent-traces) | 167 |
| [tbench](https://github.com/harbor-framework/terminal-bench-2-1) | 89 |
| [scicode](https://huggingface.co/datasets/SciCode1/SciCode) | 80 |
| [critpt](https://huggingface.co/datasets/CritPt-Benchmark/CritPt) | 70 |
