# Changelog

## Unreleased — 2026-07-08
Engine corrected to match Dr. Sikora's 1983 source book (phase table, birth-time convention,
BioMatch = his biopowinowactwo formula); validated against his own worked examples.

- Phase tables (F/P/I): day 1 of every cycle is now the zero day — at birth, all three cycles
  start together at day 1 — instead of a trailing 2-day zero window at the end. The emotional/P
  cycle's two critical days move later by one day each to stay consistent with the corrected
  table.
- Birth-time correction: now AM +2 / PM +1 / unknown +1, an inclusive day-count (the birth day
  itself counts as day 1 of life) with one further day added for morning births — replacing the
  previous, incorrect negative-offset convention.
- BioMatch per-cycle sync now uses dr. Sikora's own biopowinowactwo formula — the folded
  day-in-cycle distance between two people, `(1 − foldedDiff/(N/2)) × 100` — instead of a
  comparison of raw sine values.
- Golden vectors: 741 Sikora + 211 BioMatch — a larger, corrected set, verified in CI
  (`npm test`).
- Provenance corrected: validated against dr. Sikora's own 1983 book and his own worked
  examples (e.g. Mickiewicz, Goethe+Schiller), replacing the earlier, unverifiable claim of
  validation against supplementary reference printouts from later years.

## 1.0.0 — 2026-07-01
Initial public release.

- Reference engine `src/engine.js` — snapshot of the private aimy.bio app engine.
- Golden vectors: 741 Sikora + 211 BioMatch, verified in CI (`npm test`).
- Method specification (EN + PL) and philosophy/tribute (EN + PL).
- Licensing: MIT (code) + CC BY 4.0 (docs & data).
