# aimy-bio-open-biorhythms

> The open, verified engine and specification of dr. Jerzy Sikora's biorhythm method — powering the free app at [aimy.bio](https://aimy.bio).

![golden](https://github.com/fiedoruk/aimy-bio-open-biorhythms/actions/workflows/test.yml/badge.svg)

## What this is

This repository is the reference engine (`src/engine.js`) and the canonical specification
(`docs/method.md`) of **dr. Jerzy Sikora**'s discrete-phase biorhythm method — a tribute to his
work, not a product. It is privacy-first and free: there is no telemetry here, no account, and
no dependency to install — just math you can read line by line and verify yourself.

## See it live

**Live app → https://aimy.bio**

## Verify it yourself

No trust required — clone it and run the same golden-vector suite that CI runs on every commit:

```bash
git clone https://github.com/fiedoruk/aimy-bio-open-biorhythms
cd aimy-bio-open-biorhythms
npm test   # 663 Sikora + 86 BioMatch golden vectors -> ALL GREEN
```

Zero dependencies — plain Node.js, nothing to install first.

## The method in 30 seconds

Every day, in every cycle, is classified into exactly one of four states:

| Symbol | Name | Meaning |
|---|---|---|
| `+` | High | Active phase |
| `−` | Low | Passive phase |
| `X` | Critical day | Transition from high to low |
| `0` | Zero day | Regeneration — transition from low to high |

That symbol — not a percentage, not a curve — is the ground truth of the method.

Full specification → [`docs/method.md`](docs/method.md)

## What's inside

- [`docs/method.md`](docs/method.md) — the full, verifiable method specification (day-count, phase tables, BioMatch).
- [`docs/philosophy.md`](docs/philosophy.md) — why this exists and why it's open.
- Polish / po polsku: [`docs/pl/method.md`](docs/pl/method.md) · [`docs/pl/philosophy.md`](docs/pl/philosophy.md)
- [`src/engine.js`](src/engine.js) — the reference implementation, zero dependencies.
- [`data/README.md`](data/README.md) — data dictionary for the 663 + 86 golden vectors that pin correctness.

## Cite this repository

This repository ships a [`CITATION.cff`](CITATION.cff), so GitHub exposes a "Cite this repository"
button on the repo page. If you use this method or engine, please cite it and link back to
https://aimy.bio.

## Licensing

- `src/**` — [MIT](LICENSE).
- `docs/**` and `data/**` — [CC BY 4.0](LICENSE-docs) (attribution to aimy.bio required).

## Contributing

PRs for docs, translations, and UX ideas are welcome under the DCO. **The engine math is a
mirror** of the canonical source that powers aimy.bio — PRs changing the math in `src/engine.js`
will be redirected there instead of merged here. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

A tribute to the work of dr. Jerzy Sikora.
