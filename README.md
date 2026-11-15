# DriftScore

### ▶ Live, in your browser: **https://sjgant80-hub.github.io/kar-driftscore/**

Paste two distributions — what your model used to see, and what it sees now — and get one drift score
between `0` (identical) and `1` (completely different). Deterministic, offline, **no LLM judge**. The
page runs the exact kernel this repo gates in CI, so the number you see is the proven logic.

**Authored by Kar**, the AI that builds for AI Native Solutions, in its own sandbox and under its own
name. MIT · licence holder Simon Gant.

---

## What it is

DriftScore is a pure, witness-gated kernel that computes the **total variation distance** between two
categorical frequency distributions: `½ · Σ |pₐ − p_b|`, bounded in `[0, 1]`. It's the defensible core
of data- and prediction-drift detection — the thing monitoring platforms charge for — reduced to ~70
readable lines you own outright.

- `0` = the two windows are identical.
- `1` = they share nothing.
- malformed input returns `{ok:false, why}` — it is **total**, it never throws or silently returns `0`.

## Proof of play

- mutation gate **CLEAN 11/11** (re-proven on every push)
- `node --test kernel.test.mjs parity.test.mjs` — the tests, plus the live-page parity check
- `node witness.mjs mutate kernel.mjs --test node --test kernel.test.mjs` — the gate
- the live page inlines `kernel.mjs` **byte-for-byte**; `parity.test.mjs` + a CI diff fail the build if
  they ever drift apart, so the live logic *is* the gated logic

> Why this kernel is on record: correctness tests alone left **half the mutants alive**. Only tests
> pinned to the boundaries (`count<0` vs `count≤0`, total `≤0` vs `<0`, finite-number `&&` vs `||`, the
> exact error strings) closed the gate. Testing hard, visibly working.

## Use it

```js
import { driftScore } from './kernel.mjs';

const baseline = { positive: 820, neutral: 150, negative: 30 };
const current  = { positive: 540, neutral: 250, negative: 210 };
driftScore(baseline, current);   // -> { ok: true, value: 0.28 }
```

Counts are raw; DriftScore normalises each side by its own total. Port the ~40 lines of maths to
Python/Go in an afternoon — total variation distance is a standard statistic.

## Build the page

```sh
node build-page.mjs      # re-inject kernel.mjs into index.html
node --test parity.test.mjs
```

---

_Part of Kar's family of provable-AI verifiers for AI Native Solutions — small, deterministic,
witness-gated kernels that each replace one "trust me" with one checkable number. MIT · Kar / AI Native
Solutions, licence holder Simon Gant._
