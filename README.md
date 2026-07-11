# Open Biorhythms — dr. Jerzy Sikora's method, verified and free

> The open, verified engine and specification of dr. Jerzy Sikora's biorhythm method — powering the free app at [aimy.bio](https://aimy.bio).

![golden](https://github.com/fiedoruk/aimy-bio-open-biorhythms/actions/workflows/test.yml/badge.svg) [![npm version](https://img.shields.io/npm/v/aimy-bio-open-biorhythms?logo=npm&color=cb3837)](https://www.npmjs.com/package/aimy-bio-open-biorhythms) ![license MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-2ea44f)

**Try it — no install:** `npx aimy-bio-open-biorhythms 1990-05-15`

## What this is

This repository is the reference engine (`src/engine.js`) and the canonical specification
(`docs/method.md`) of **dr. Jerzy Sikora**'s discrete-phase biorhythm method — a tribute to his
work, not a product. The method is dr Jerzy A. Sikora's — a Polish researcher (b. 1930,
Cieszyn), the father of Polish biorhythmics. It is privacy-first and free: there is no
telemetry here, no account, and no dependency to install — just math you can read line by line
and verify yourself.

Reconstructed from dr. Sikora's own book, *Biodiagram prawdę Ci powie* (KAW, 1983), and
validated digit by digit against his own worked examples — e.g. the poet Mickiewicz's
biorhythm (F22/P15/I1) and the Goethe+Schiller biopowinowactwo (compatibility) match
(F100/P86/I82) — then pinned by 741 + 211 golden vectors so it can't drift.

## See it live

**Live app → https://aimy.bio** — free, 8 languages, works offline, nothing to install.

## Verify it yourself

No trust required — clone it and run the same golden-vector suite that CI runs on every commit:

```bash
git clone https://github.com/fiedoruk/aimy-bio-open-biorhythms
cd aimy-bio-open-biorhythms
npm test   # 741 Sikora + 211 BioMatch golden vectors -> ALL GREEN
```

Zero dependencies — plain Node.js, nothing to install first.

Or try it on your own birthday: `node examples/today.mjs 1990-05-15`

## Install / use as a package

No cloning required — try it directly with npx:

```bash
npx aimy-bio-open-biorhythms 1990-05-15   # or, once installed: aimy-biorhythm 1990-05-15
```

Add `--json` for machine-readable output, or `--help` for all CLI options (`--date`).

Or add it as a dependency and use the engine directly:

```bash
npm i aimy-bio-open-biorhythms
```

```js
import { getBiorhythmsFor } from 'aimy-bio-open-biorhythms';
console.log(getBiorhythmsFor(new Date(1990, 4, 15), new Date()));
```

## Use with AI assistants (MCP)

The package also ships a zero-dependency [MCP](https://modelcontextprotocol.io) server
(`aimy-bio-mcp`), so AI assistants can actually *compute* dr. Sikora's method instead of
hallucinating generic sine waves. Zero PII by design: dates are processed in flight — nothing is
stored, logged, or sent anywhere.

Claude Code — one command:

```bash
claude mcp add biorhythms -- npx -y --package=aimy-bio-open-biorhythms@latest aimy-bio-mcp
```

Claude Desktop (or any MCP client) — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "biorhythms": {
      "command": "npx",
      "args": ["-y", "--package=aimy-bio-open-biorhythms@latest", "aimy-bio-mcp"]
    }
  }
}
```

(Note the `--package=` form — plain `npx aimy-bio-open-biorhythms` runs the default CLI bin, not
the MCP server.)

Tools: `biorhythm_for_date` (full state for any date) · `critical_days` (upcoming critical
transitions and strong-phase starts) · `biomatch` (two-person compatibility, biopowinowactwo).

## The method in 30 seconds

Every day, in every cycle, is classified into exactly one of four states:

| Symbol | Name | Meaning |
|---|---|---|
| `+` | High | Active phase |
| `−` | Low | Passive phase |
| `X` | Critical day | Transition from high to low |
| `0` | Zero day | Regeneration — transition from low to high |

That symbol — not a percentage, not a curve — is the ground truth of the method.

This is unmodified output of `src/engine.js` (born 1990-05-15, on 2026-07-01) — reproduce it
yourself with `npm test`.

```json
{
  "daysAlive": 13197,
  "physical": {
    "symbol": "-",
    "day": 18,
    "length": 23,
    "percent": 9
  },
  "emotional": {
    "symbol": "+",
    "day": 9,
    "length": 28,
    "percent": 82
  },
  "intellectual": {
    "symbol": "-",
    "day": 30,
    "length": 33,
    "percent": 30
  }
}
```

Full specification → [`docs/method.md`](docs/method.md)

## What's inside

- [`docs/method.md`](docs/method.md) — the full, verifiable method specification (day-count, phase tables, BioMatch).
- [`docs/philosophy.md`](docs/philosophy.md) — why this exists and why it's open.
- Polish / po polsku: [`docs/pl/method.md`](docs/pl/method.md) · [`docs/pl/philosophy.md`](docs/pl/philosophy.md)
- [`src/engine.js`](src/engine.js) — the reference implementation, zero dependencies.
- [`data/README.md`](data/README.md) — data dictionary for the 741 + 211 golden vectors that pin correctness.

## Cite this repository

This repository ships a [`CITATION.cff`](CITATION.cff), so GitHub exposes a "Cite this repository"
button on the repo page. If you use this method or engine, please cite it and link back to
https://aimy.bio.

## Licensing

- `src/**` — [MIT](LICENSE).
- `docs/**` and `data/**` — [CC BY 4.0](LICENSE-docs) (attribution to aimy.bio required).

## Using this? Link back

Docs & data are CC BY 4.0 — reuse freely, just keep the credit. Paste-ready:

> Biorhythm engine & method spec: aimy.bio — https://aimy.bio (CC BY 4.0)

Or drop this badge in your README:

```md
[![biorhythm engine: aimy.bio](https://img.shields.io/badge/biorhythm_engine-aimy.bio-2ea44f)](https://aimy.bio)
```

## Contributing

PRs for docs, translations, and UX ideas are welcome under the DCO. **The engine math is a
mirror** of the canonical source that powers aimy.bio — PRs changing the math in `src/engine.js`
will be redirected there instead of merged here. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

A tribute to the work of dr. Jerzy Sikora.
