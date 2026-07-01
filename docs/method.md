# Biorhythm method specification (dr. Jerzy Sikora)

This document specifies, in full and verifiable detail, the biorhythm method developed by
**dr. Jerzy Sikora**: a **discrete-phase** model — four named states per cycle, not a raw
continuous sine wave — built to describe the physical, psychical/emotional, and intellectual
rhythms of a person's life. The method was reconstructed and validated against dr. Sikora's
own reference printouts from **1983, 2000, and 2001**, and is reproduced here as a tribute to
that work and as a citable, machine-readable reference for anyone building on it. The exact
math below is the same math that runs the live application: **https://aimy.bio**.

## State symbols

Every day, in every cycle, is classified into exactly one of four states:

| Symbol | Name | Meaning |
|---|---|---|
| `+` | High | Active phase |
| `−` | Low | Passive phase |
| `X` | Critical day | Transition from high to low |
| `0` | Zero day | Regeneration — transition from low to high |

The symbol is the ground truth of the method. Everything else — percentages, curves, colors —
is a presentation layer built on top of it.

## Days lived

The method starts by counting how many days a person has been alive, adjusted by a small
correction for birth time:

```
daysAlive = round( UTCmidnight(targetDate) − UTCmidnight(birthDate) ) / dayMs + correction
```

where `correction` depends on the birth-time bucket:

| Birth time | Correction |
|---|---|
| AM | −1 |
| PM | −2 |
| unknown | −1 |

`UTCmidnight(date)` is built from the **local calendar components** of a date (year, month,
day) reinterpreted as UTC midnight, not from a local midnight timestamp. This detail matters:
subtracting two such UTC-midnight values always yields an exact multiple of a 24-hour day. A
naive subtraction of two *local* midnights is not safe, because a daylight-saving-time
transition can make a calendar day last 23 or 25 hours — which silently drops or adds a day to
the count. The method is defined to be immune to this.

## Day within the cycle

Once the days-lived count is known, the position within a given cycle (length `N` — 23, 28, or
33 days) is:

```
dayOfCycle = daysAlive % N
if (dayOfCycle ≤ 0) dayOfCycle += N
```

The `≤ 0` guard matters because `daysAlive` can be negative (a target date before the birth
date), and the modulo of a negative number is not guaranteed to land in `1..N` without it.

## Phase distribution

The three cycles — Physical, Psychical/emotional, Intellectual — each have their own length and
their own phase boundaries. This table is the canonical distribution of the four states across
each cycle:

| Cycle | length | + (high) | X (critical) | − (low) | 0 (zero) |
|---|---|---|---|---|---|
| Physical (F) | 23 | 1–10 | 11 | 12–21 | 22–23 |
| Psychical/emotional (P) | 28 | 1–12 | **13–14 (two!)** | 15–26 | 27–28 |
| Intellectual (I) | 33 | 1–15 | 16 | 17–31 | 32–33 |

The Physical and Intellectual cycles each have a single critical day. The **Psychical/emotional
(P) cycle is the exception: it has two critical days, 13 and 14** — the transition from high to
low takes two days in the emotional cycle rather than one. This is a distinguishing detail of
the method, easy to miss if a symmetric one-critical-day assumption is copied across the F, P
and I cycles without checking each cycle's own phase table.

## Worked example

The following is real, unmodified output of the reference engine (`src/engine.js`,
`getBiorhythmsFor`) for a person born **1990-05-15**, evaluated on **2026-07-01**, birth time
**unknown**:

```json
{
  "daysAlive": 13195,
  "physical": {
    "symbol": "-",
    "day": 16,
    "length": 23,
    "percent": 5
  },
  "emotional": {
    "symbol": "+",
    "day": 7,
    "length": 28,
    "percent": 88
  },
  "intellectual": {
    "symbol": "-",
    "day": 28,
    "length": 33,
    "percent": 29
  }
}
```

Reading it: after 13,195 days lived, the Physical cycle is in its **low** phase (day 16 of 23,
near the bottom of the trough — 5%), the Psychical/emotional cycle is **high** and close to its
peak (day 7 of 28, 88%), and the Intellectual cycle is **low**, near the end of its trough and
about to turn (day 28 of 33, 29%).

## Visualization vs truth

The engine exposes two different functions that are easy to confuse, and only one of them is
the method:

- `calculateDetailedPercentage` produces a smooth 0–100 value that **respects the phase
  boundaries above**: it rises through the high phase (55 → 95 → 55), falls through the low
  phase (45 → 5 → 45), and sits at a flat 50 for both critical (`X`) and zero (`0`) days. This is
  what a percentage bar or a phase-aware chart should show.
- `calculateBiorhythm` is a plain sine wave. It exists **solely** to draw a continuously
  moving curve on a chart — it does not know about phase boundaries, critical days, or the
  two-day emotional transition, and it should never be read as the state of the day.

The symbols in the "State symbols" table are the truth about a given day. The sine curve is
decoration for the eye; it is not the method.

## BioMatch — partner compatibility (v1.0)

BioMatch estimates how compatible two people's rhythms are on a given day. It is a separate,
newer layer built on top of the same three cycles.

**Input.** Each person's raw sine value for the day, for each cycle — `getRawBiorhythms(daysAlive)`,
which returns three values in the range `[-1, 1]` (physical, emotional, intellectual).

**Per-cycle sync.** For a given cycle, with raw values `rawA` and `rawB` for the two people:

```
sync = (1 − |rawA − rawB| / 2) × 100
```

A sync of 100% means both people are at the exact same point in that cycle's phase; 0% means
they are in exact opposition. Opposition is treated as **complementarity, not conflict** — two
people at opposite points of a cycle balance rather than clash.

**Overall score.** The three per-cycle sync values are combined with fixed weights and rounded:

```
overall = round( 0.25·F + 0.45·P + 0.30·I )
```

The emotional cycle carries the most weight (0.45), reflecting that a partner match is
primarily an emotional dimension.

**Type.** The overall score maps to one of three labels:

| Condition | Type |
|---|---|
| `overall ≥ 70` | sync |
| `overall ≤ 40` | complement |
| otherwise | mixed |

**Advice.** The advice shown to the user is selected from the **un-rounded** per-cycle sync
values (not the rounded display values), to avoid boundary flicker near round numbers. The
engine returns an `adviceKey` identifying which advice applies; the advice text itself lives in
the application's i18n layer, not in the engine — the engine only decides which key applies.

## FAQ

**Are biorhythms scientifically proven?**
No. Biorhythms, including the Sikora method described here, are a reflective, wellness-oriented
practice — not a scientifically validated model of mood, performance, or health, and not a
medical or diagnostic tool. The most honest way to use the output is as a prompt for a day of
mindfulness and self-observation, not as a prediction to be trusted or feared.

**How does the Sikora method differ from the classic sine-wave biorhythm?**
The classic approach reads a person's state directly off a continuous sine curve. The Sikora
method instead defines **discrete phases with named symbols** (`+`, `−`, `X`, `0`) for each
cycle, with explicit day-range boundaries per cycle, and applies a **birth-time correction**
(AM/PM/unknown) to the underlying day count before any phase is computed. The sine curve still
exists in this implementation, but only as a visualization aid — see "Visualization vs truth"
above.

**What is a critical day (X)?**
A critical day is the transition day (or days) between a cycle's high phase and its low phase —
the point where a cycle's active phase gives way to its passive phase.

**Why does the emotional cycle have two critical days?**
Because the Psychical/emotional (P) cycle's phase distribution places the high-to-low
transition across **two consecutive days, 13 and 14** (see "Phase distribution" above), rather
than the single transition day used by the Physical and Intellectual cycles. This is a defined
property of the method's phase table, not an approximation or a rounding artifact.

---
Part of **aimy.bio** — a free, privacy-first tribute to the work of dr. Jerzy Sikora. Live: https://aimy.bio

Docs licensed CC BY 4.0 · reference engine MIT.
