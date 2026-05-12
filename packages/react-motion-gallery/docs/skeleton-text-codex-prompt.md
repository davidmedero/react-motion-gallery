# Skeleton Text Codex Prompt

Use this prompt when you want Codex, Cursor, or another repo-aware AI agent to update skeleton text authoring through the browser-measurement workflow.

## Generic Prompt

```text
Update skeleton text authoring in <file> using the repo's browser-based skeleton text workflow.

Requirements:
- inspect the component and find the real rendered title/body text nodes that the skeleton should model
- add or reuse stable selectors for those nodes when needed
- for equal-height sliders, add a stable canonical item id attribute and role selectors inside each card
- create or update a browser manifest for the file
- use the browser manifest to measure the live page with the repo's supported skeleton text scripts
- prefer px barWidth values from browser measurement unless the file already relies on percentage caps
- keep runtime code readable and do not change unrelated rendering behavior

After measuring:
- regenerate the .generated.ts sidecar module
- patch the component to import and use the generated values
- for equal-height sliders, import and apply the generated rowHeightCompensation export too
- summarize the selectors, manifest entries, and generated outputs you used
- mention any assumptions about render mode, fonts, or page URLs
```

## Stronger Prompt For Existing Demos

```text
Update skeleton text authoring in <file> using the repo's browser-based skeleton text workflow.

Process:
- inspect the component and locate every real rendered text node that should drive skeleton lines/barWidth
- make sure each target has a stable selector such as a data attribute
- for equal-height sliders, measure all canonical items with slider manifest mode instead of only the first visible slots
- create or update a *.skeleton-text.browser.manifest.json file beside the component
- use npm run --silent generate:skeleton-text-module with --analysis-output to inspect browser-measured results and regenerate the sidecar module in one scan
- wire the generated values into the component without changing unrelated layout logic

Constraints:
- use the browser manifest and supported skeleton text scripts
- prefer width caps that reflect browser-measured px values
- keep object shapes stable and easy to diff
- for equal-height sliders, reserve extra height through rowHeightCompensation rather than per-slot margin hacks
```

## When To Prefer The Non-AI Route

Use the manifest-driven generator directly when:

- the user wants deterministic regeneration without AI patching source
- the same skeleton authoring data will be regenerated repeatedly in CI or local scripts
- the project prefers importing sidecar-generated authoring objects over editing inline literals
