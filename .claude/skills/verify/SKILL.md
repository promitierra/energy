---
name: verify
description: Run type-check, the full test suite and a production build, then report results.
disable-model-invocation: true
---

Run these in order from the repo root, stopping at the first failure:

1. `npx tsc --noEmit`
2. `npm test -- --run`
3. `npm run build`

Report pass/fail per step. On failure, show the relevant error output and the root cause; do not fix anything unless asked.
