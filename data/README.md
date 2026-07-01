# Golden vectors — data dictionary

These vectors pin the engine's correctness. Reproduce with `npm test` (runs `src/engine.test.mjs`).
They are the same vectors that guard the aimy.bio app; the app repository is the source of truth.

## `sikora.json` — 663 vectors
Array of objects, one per (cycle, day-count) case:

| field | type | meaning |
|---|---|---|
| `type` | `"F"` \| `"P"` \| `"I"` | cycle: Physical (23), Psychical/emotional (28), Intellectual (33) |
| `daysAlive` | integer | days lived (may be negative; birth-time correction applied upstream) |
| `symbol` | `"+"` \| `"-"` \| `"X"` \| `"0"` | Sikora phase symbol: high / low / critical / zero |
| `day` | integer | day within the cycle, 1..length |

Asserted: `getSikoraSymbol(type, daysAlive) === symbol` and `getDayOfCycle(type, daysAlive) === day`.

## `biomatch.json` — 86 vectors
Array of objects, one per partner-compatibility case:

| field | type | meaning |
|---|---|---|
| `user` | `[number, number, number]` | raw sine values (physical, emotional, intellectual) for person A |
| `partner` | `[number, number, number]` | raw sine values for person B |
| `physical` | integer 0–100 | rounded physical sync |
| `emotional` | integer 0–100 | rounded emotional sync |
| `intellectual` | integer 0–100 | rounded intellectual sync |
| `overall` | integer 0–100 | weighted overall: 0.25·F + 0.45·P + 0.30·I |
| `type` | `"sync"` \| `"complement"` \| `"mixed"` | compatibility class (≥70 / ≤40 / else) |
| `advice` | string (PL) | canonical Polish advice text for the resulting advice key |

## `advice-pl.json` — advice map
The six `matchAdvice*` keys → canonical Polish advice strings, snapshotted from the app i18n.
Used only to verify the advice-key → text mapping in the BioMatch golden test.
