# Contributing

Thanks for your interest in this project.

## Welcome, and scope

Welcome:

- documentation fixes and clarifications,
- translations,
- UX ideas and feedback,
- typo fixes.

**Not here:** changes to the engine's math (`src/engine.js`). This engine is a **snapshot
mirror** of the canonical implementation that powers [aimy.bio](https://aimy.bio) — it is not
developed independently in this repository. PRs that change the math will be redirected to the
canonical source rather than merged here.

Whatever you change, `npm test` must stay **ALL GREEN** (663 Sikora + 86 BioMatch golden
vectors). A PR that breaks the golden suite cannot be merged.

## DCO (Developer Certificate of Origin)

Every commit must be signed off:

```bash
git commit -s
```

This adds a `Signed-off-by:` trailer to your commit message and is a condition for a PR to be
accepted. By signing off, you certify — in the sense of the
[Developer Certificate of Origin 1.1](https://developercertificate.org/) — that you wrote the
contribution or otherwise have the right to submit it under this project's license.

## Licensing of contributions

By submitting a PR, you agree that your contribution is licensed the same way the rest of the
repository is: documentation and data under **CC BY 4.0**, and code under **MIT**.

## How to run

Requires Node.js ≥ 20. Zero dependencies.

```bash
npm test
```
