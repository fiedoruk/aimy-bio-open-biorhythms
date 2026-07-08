# Golden vectors — data dictionary

These vectors pin the engine's correctness. Reproduce with `npm test` (runs `src/engine.test.mjs`).
They are the same vectors that guard the aimy.bio app; the app repository is the source of truth.

## `sikora.json` — 741 vectors
Array of objects, one per (cycle, day-count) case:

| field | type | meaning |
|---|---|---|
| `type` | `"F"` \| `"P"` \| `"I"` | cycle: Physical (23), Psychical/emotional (28), Intellectual (33) |
| `daysAlive` | integer | days lived (may be negative; birth-time correction applied upstream) |
| `symbol` | `"+"` \| `"-"` \| `"X"` \| `"0"` | Sikora phase symbol: high / low / critical / zero |
| `day` | integer | day within the cycle, 1..length |

Asserted: `getSikoraSymbol(type, daysAlive) === symbol` and `getDayOfCycle(type, daysAlive) === day`.

## `biomatch.json` — 211 vectors
Array of objects, one per partner-compatibility case:

| field | type | meaning |
|---|---|---|
| `userDays` | integer | person A's raw `daysAlive` (from `daysSinceBirth`) on the shared reference date |
| `partnerDays` | integer | person B's raw `daysAlive` on the same shared reference date |
| `physical` | integer 0–100 | rounded physical sync (folded day-in-cycle distance, Physical cycle) |
| `emotional` | integer 0–100 | rounded emotional sync (folded day-in-cycle distance, Psychical/emotional cycle) |
| `intellectual` | integer 0–100 | rounded intellectual sync (folded day-in-cycle distance, Intellectual cycle) |
| `overall` | integer 0–100 | weighted overall: 0.25·F + 0.45·P + 0.30·I |
| `type` | `"sync"` \| `"complement"` \| `"mixed"` | compatibility class (≥70 / ≤40 / else) |
| `advice` | string (PL) | canonical Polish advice text for the resulting advice key |

Asserted: `calculateBioMatch(userDays, partnerDays)` reproduces `physical`/`emotional`/`intellectual`/`overall`/`type` exactly, and the resulting `adviceKey` maps (via `advice-pl.json`) to `advice`.

## `advice-pl.json` — advice map
The six `matchAdvice*` keys → canonical Polish advice strings, snapshotted from the app i18n.
Used only to verify the advice-key → text mapping in the BioMatch golden test.
