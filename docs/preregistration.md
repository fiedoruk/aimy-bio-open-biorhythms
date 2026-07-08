<!-- Public pre-registration (Phase 0) of the validation programme for Dr. Sikora's discrete
     biorhythm method for aimy.bio. Frozen and registered with a timestamp BEFORE any data collection.
     Polish original: docs/pl/preregistration.md (canonical). -->

# Pre-registration: a bottom-up test of Dr. Sikora's discrete biorhythm method

**Status:** PUBLICLY REGISTERED 2026-07-08 (Phase 0), BEFORE any data collection. From this point the
analysis plan is BINDING (no p-hacking) — amending it after the fact would destroy the value of the pre-registration.
*Correction 2026-07-08 (before any data collection): clarified the Phase 2 status (opt-in available, not "dormant") and the wording on age (the "adults only" notice is in the app's opt-in) — no change to the hypotheses or analysis plan.*

## 1. Background and goal

The classic (sinusoidal) biorhythm model is considered unsupported in the literature (e.g. Hines 1998 —
a review of ~134 studies, no effect). Dr. Jerzy Sikora's discrete method (phases +/−/X/0, birth-time
correction) **has never been publicly tested**. Goal: to honestly estimate whether there is ANY repeatable
relationship between cycle phase and self-rated state — bottom-up, anonymous, pre-registered.
**Default hypothesis = no effect (H0).**

## 2. Hypotheses (falsifiable, frozen)

- **H1 — critical days:** the mean self-rating (energy/mood/focus) on critical days (X) of a given cycle is
  **lower** than on "high" days (+) of that cycle, by an effect larger than in a random (permutation) model.
- **H2 — phase ↔ state (within-person):** a positive correlation between the physical cycle's phase value
  and self-rated energy (analogously: emotional↔mood, intellectual↔focus).
- **H0 (default):** the effect distributions do not differ from the random model. We reject it only with a
  real, repeatable effect of a pre-set minimum size.

## 3. Measurement (operationalisation)

- **Daily self-rating (before revealing the chart — see §4):** FROZEN — 3 items, 1–5 scale (1 = very low,
  5 = very high), mapping 1:1 onto the three cycles:
  - **Energy** (physical: strength/stamina) → physical cycle (23 days)
  - **Mood** (well-being/sensitivity) → emotional cycle (28 days)
  - **Focus** (concentration/clarity) → intellectual cycle (33 days)
  No overall item and no free-text notes (minimisation + no risk of PII in content).
- **Phase (computed locally by the `engine.js` engine):** for each cycle, the state {+, −, X, 0} and a
  continuous phase value. The birth date is used ONLY for local computation — it never leaves the device.
- Unit of analysis: the pair (a given cycle's phase on a given day, the corresponding self-rating), within-person.

## 4. Study design and bias control (critical)

- **Blinding:** the user fills in the day's rating BEFORE seeing the chart/phase for that day ("blind diary"
  mode). This eliminates confirmation of the hypothesis — the most important credibility mechanism.
- **Null (permutation) model:** for each person we shuffle phase labels against ratings (≥1000 permutations)
  and build a "random-effect" distribution; the real effect is compared to that distribution.
- **N-of-1 + meta:** first the within-person statistic (each device computes its own), then a meta-analysis
  of the distribution of effects across people (see §5 — edge analytics).
- **Inclusion criteria (pre-set):** for adults (the Phase 2 opt-in carries an "adults only" notice; we collect
  neither age nor identity — the study is anonymous); min. 30 days with a rating per person; exclusion of "constant rating" (e.g. the same number
  on ≥95% of days — no variance); exclusion of < 1 full cycle (33 days).

## 5. Data and privacy (anonymous by design)

- Statistics are computed **on the device** (federated). Only the aggregate result leaves it: per-person
  effect coefficients (e.g. r phase↔rating for 3 cycles; the X vs + difference) **+ N days**.
- **What does not leave the device:** birth date, raw diary, name, any persistent identifier.
- Single send; the aggregate is **designed to be anonymous** — on the server side it cannot be linked to a
  person (consistent with the CJEU's relative approach, C-413/23 P, EDPS v SRB, 4 Sep 2025: data irreversible
  for the recipient). The raw self-ratings and birth date — from which the coefficients are computed —
  **never leave the device** and remain covered by the privacy policy and the user's consent. Should the
  aggregated coefficients nonetheless be deemed personal data, the legal basis is **consent (Art. 6(1)(a)
  GDPR)**, and for any special category — **explicit consent (Art. 9(2)(a))** or **scientific research
  (Art. 9(2)(j))** with the safeguards of Art. 89.
- Activation only by an explicit, informed action (double opt-in, off by default). The user can at any time
  **stop future sends**. Note: a single already-sent anonymous batch cannot be withdrawn — precisely because
  it is unlinkable (there is no identifier by which to find it); this fact is communicated before consent.

## 6. Analysis plan (frozen)

- Primary H1 measure: the standardised mean difference (Cohen's d) rating[+] − rating[X], per cycle.
- Primary H2 measure: r (or rho) phase↔rating, per cycle, per person.
- Aggregation: the distribution of effects + an N-weighted meta-mean; **confidence intervals**, not just p.
- **Multiple-comparison correction** (3 cycles × 3 ratings): Benjamini–Hochberg (FDR).
- **Sensitivity threshold (pre-set):** |d| ≥ 0.2 or |r| ≥ 0.1 AND an advantage over the null model (a real
  effect outside the 95% permutation distribution). Below = a result consistent with H0.

## 7. Decision rule and publication

- We publish the result (including null) **provided a minimum sample is collected (§11.1)**; below the
  threshold — we openly publish the **pilot status** (without conclusions) rather than staying silent.
  Committed in advance.
- Openness: the anonymous aggregate dataset + analysis code (repo) → a report on the blog + possibly a preprint.
- A null result is a full-fledged result — it strengthens credibility ("we test honestly").

## 8. Ethics / GDPR

- The study is intended for adults — the Phase 2 opt-in ("Share anonymously") carries an "adults only" notice,
  so by enabling sharing the user confirms adulthood; we collect neither age nor identity. Clear information before consent.
  **No raw ratings or well-being data enter the transmission — only aggregated correlation coefficients,
  which do not constitute health data.** Raw self-ratings (which could be treated as data on one's well-being
  state under Art. 9 GDPR) **remain solely on the device** and are not processed by us. The nature of the tool
  is **wellness/self-reflective, not medical.**
- **A legal (GDPR) assessment was carried out before starting data collection** (Legal review, 2026-07-07;
  the final wording of the legal-basis clauses + the age limit under Art. 8 of the Polish Data Protection Act
  to be confirmed with counsel before scaling). The privacy section on the site = the truth, 1:1.

## 9. Dependencies on later phases (beyond Phase 0)

- **Phase 1 (app):** "blind diary" mode (rating before the chart), localStorage, N-of-1 locally.
- **Phase 2 (backend):** a narrow, opt-in endpoint for anonymous aggregates — **requires an infrastructure
  decision (where/host) + a Legal/GDPR review**. A deliberate exception to zero-backend.
- **Phase 3:** analysis + open data + publication.

## 10. Frozen decisions (2026-06-15) — previously open questions

Resolved in advance according to best research practice:

1. **Scale (§3) — FROZEN:** 3 items (Energy / Mood / Focus), 1–5, mapping onto 3 cycles. Consistent wording
   across 8 languages (i18n keys — see the Phase 1 spec).
2. **Aggregate-send frequency (Phase 2):** computed on the device; sent at milestones of **30 / 90 / 180 days**
   (max 3 times). Each send = per-cycle coefficients (d for X vs +, r phase↔rating) + N days + coarse meta
   (app version, language bucket). Cap at 180 days.
3. **Endpoint host (Phase 2) — a dedicated server on our own infrastructure, NOT shared hosting.** Rationale:
   full control (rate-limit, hardening, rotation), isolation from the static production frontend. **The app
   stays static (frontend untouched);** we relax the "zero-backend" rule ONLY on a separate, opt-in endpoint
   (`research.aimy.bio`, CORS for `aimy.bio`, POST of the anonymous aggregate only).
4. **Identifier — NO persistent ID in the transmission.** The device keeps a local salt (NEVER sent) only for
   its own N-of-1 continuity; each send carries only a random nonce (unlinkable) to avoid double-counting.
   Anonymous by design (unlinkable on the server side); we treat it as **anonymous data**, and should it be
   deemed personal — the basis is **consent (Art. 6(1)(a) GDPR)**. A deliberate cost: no server-side
   cross-send longitudinal analysis (within-person is computed locally and sent as a finished coefficient) —
   acceptable, because that is exactly what protects anonymity.

## 11. Phase-transition criteria + result interpretation (2026-06-15, audit)

Frozen BEFORE data collection — amending after the fact would destroy the value of the pre-registration.

1. **Phase 1 → Phase 2 transition criterion (collecting the aggregate makes sense):** Phase 2 collection
   starts only on the user's deliberate double opt-in (off by default; a kill-switch `RESEARCH_ENDPOINT` = null is available for immediate disabling).
   Orientation threshold for **real analysis** (Phase 3): **≥ 50 independent submissions** at a milestone
   (first bridge: 30 days). Below — we treat the data as a pilot and do not publish conclusions.
2. **Statistical power vs length (N-of-1 honesty):** 30 days = ~1 physical cycle (23) and <1 emotional (28).
   A within-person Cohen d/r from 30 days has **wide confidence intervals — unstable at the person level.**
   Therefore: **Phase 1 (blind diary) = a SELF-REFLECTION tool for the user, NOT proof.** Credibility grows
   with cross-person meta-analysis (Phase 3) and longer series (90/180 days). **Communication MUST separate:**
   "your patterns" (Phase 1, private, indicative) from the "shared result" (Phase 2/3, population-level). We
   do not promise a scientific answer at the person level from 30 days.
3. **Null-result narrative (frozen — null is the most likely per the literature):**
   - We publish null as a full-fledged result (the commitment from §7). The value = **rigour, not direction.**
   - **Tribute THROUGH honesty:** "we were the first to *openly* test Dr. Sikora's discrete method" — that is
     greater respect than uncritical repetition. Faithfulness to the method (a 1:1 port, golden vectors)
     concerns the *reconstruction* of what Sikora described — regardless of whether an effect exists.
   - **The tool's value is independent of correlation:** like a journal or a mindfulness ritual — an honest
     daily self-rating can be worth more than any coefficient. We say this plainly (already in the "open study"
     article + the privacy section), so a null does not undermine the app's point.
   - The app stays **free and privacy-first regardless of the result** — there is no incentive to fudge.
