# Philosophy — why aimy.bio exists

**Why aimy.bio exists.** It is a tribute to **dr Jerzy A. Sikora** — a Polish researcher born in
1930 in Cieszyn, often called the father of Polish biorhythmics and author of the 1983 book
*Biodiagram prawdę Ci powie* — who described biorhythms through discrete phases and a
birth-time correction rather than a plain continuous sine wave. That method was reconstructed
from dr. Sikora's own reference printouts from **1983, 2000, and 2001**, and validated against
them digit by digit. aimy.bio exists to keep that work alive, accessible, and free — not to
monetize it, and not to reinvent it.

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
- available in 8 languages;
- fully offline-capable as an installable PWA.

## What it is NOT

- **Not commercial.** There are no paywalls, no accounts, and no personal data collected to
  build a user profile or to sell. Nothing about aimy.bio is sold, and nothing about a visitor
  is captured to be sold later.
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
   server's job is to serve static files; your profiles never leave the browser — there is no
   account system and no database of personal data to leak, because none exists.
3. **Calm, original character.** The guiding idea behind both the method's framing and the
   application's design is simple: after the dip, the rise always comes. The interface reflects
   that with a calm, wellness-toned green palette, a handwritten accent typeface, no emoji, and
   no dark patterns — nothing designed to alarm, addict, or manipulate.

## Why open-source

Opening the method and the reference engine turns a promise into something you can check
yourself. The engine is pure computation — anyone can read every line and confirm it makes no
network calls and transmits nothing; in the app, your profiles live only in your browser. (How
the hosted site handles data — cookieless, privacy-respecting analytics, an opt-in anonymous
research aggregate, and IP processing by the hosting/CDN providers — is described in the
aimy.bio privacy policy: https://aimy.bio.) Openness also lets anyone verify and build on the
tribute rather than take it on faith, and the CC BY attribution keeps a link back to
dr. Sikora's work on every fork and citation.

There is little to lose by opening it: the code of a static, client-side app is trivially
copyable anyway. The advantage here was never secrecy — it is fidelity to the method, and the
trust that fidelity earns.

---
Part of **aimy.bio** — a free, privacy-first tribute to the work of dr. Jerzy Sikora. Live: https://aimy.bio

Docs licensed CC BY 4.0 · reference engine MIT.
