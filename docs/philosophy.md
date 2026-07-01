# Philosophy — why aimy.bio exists

**Why aimy.bio exists.** aimy.bio is an online tribute to the work of **dr. Jerzy Sikora** on
describing biorhythms through discrete phases and a birth-time correction, rather than a plain
continuous sine wave. That method was reconstructed from dr. Sikora's own reference printouts
from **1983, 2000, and 2001**, and validated against them digit by digit. aimy.bio exists to
keep that work alive, accessible, and free — not to monetize it, and not to reinvent it.

## What it is

aimy.bio is a free web application built on the method described in
[`docs/method.md`](./method.md):

- three cycles — Physical (23 days), Psychical/emotional (28 days), Intellectual (33 days);
- key-day lookups (the next critical or zero day for each cycle);
- a calendar view;
- up to ten locally stored profiles, so a household or family can track everyone from one
  browser;
- a family view, to see several profiles side by side;
- BioMatch, a partner-compatibility score built on the same cycles;
- Polish and English interfaces;
- fully offline-capable as an installable PWA.

## What it is NOT

- **Not commercial.** There are no paywalls, no accounts, and no collection of personal data.
  Nothing about aimy.bio is sold, and nothing about a visitor is captured to be sold later.
- **Not medical.** The method and the application are a wellness and self-reflection practice,
  not a diagnostic or predictive medical tool. This is stated as a disclaimer wherever the
  method's output is shown, and it is repeated here deliberately: treat a "critical day" as a
  cue to pay attention, not as a prophecy.
- **Not a laboratory for reinventing the algorithm.** The math is canonical, not experimental.
  It is pinned by a golden-vector test suite (see [`data/README.md`](../data/README.md)) and is
  not "improved" or drifted between releases — fidelity to the source method is the point.

## Three pillars

1. **Fidelity to the method.** The engine in this repository is a 1:1 port of the canonical
   implementation, checked against 663 Sikora phase vectors and 86 BioMatch compatibility
   vectors. The sine wave you may see on a chart is a visualization convenience only — it never
   substitutes for the method's discrete-phase symbols as the source of truth for a given day.
2. **Privacy by architecture.** Profiles live exclusively in the browser's local storage. The
   server's job is to serve static files, nothing more — there is no account system and no
   database of personal data to leak, because none exists.
3. **Calm, original character.** The guiding idea behind both the method's framing and the
   application's design is simple: after the dip, the rise always comes. The interface reflects
   that with a calm, wellness-toned green palette, a handwritten accent typeface, no emoji, and
   no dark patterns — nothing designed to alarm, addict, or manipulate.

## Why open-source

This repository exists because of an honest observation about the underlying application: the
code for a static, client-side app is trivially copyable by anyone who wants to. Rather than
treat that as a threat, this project turns it into an asset.

Opening the method specification and the reference engine gives visitors something more
convincing than a claim: **inspectable proof of the privacy promise** — anyone can read every
line of the engine and confirm for themselves that no personal data is transmitted anywhere.
It also turns the tribute itself into something the community can verify and build on, not just
take on faith. The CC BY attribution requirement means that every citation, fork, or derivative
work carries a link back home, to the method's origin and to dr. Sikora's work.

The moat here was never secrecy of the code. It is fidelity to the method, and the trust that
fidelity earns.

---
Part of **aimy.bio** — a free, privacy-first tribute to the work of dr. Jerzy Sikora. Live: https://aimy.bio

Docs licensed CC BY 4.0 · reference engine MIT.
