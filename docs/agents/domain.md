# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

**This repo:** single-context. The Tend glossary lives in the tend-marketing repo, at `../tend-marketing/GLOSSARY.md`, not at this repo root. Read that file. Do not create a second `GLOSSARY.md` in tend-web: add new terms to the tend-marketing glossary. ADRs live in `docs/adr/` here.

- **`../tend-marketing/GLOSSARY.md`**: the Tend glossary.
- **`docs/adr/`**: read ADRs that touch the area you work in.

If an ADR does not exist yet, proceed silently. The `/domain-modeling` skill creates ADRs here when a decision is resolved. It adds new terms to the tend-marketing glossary, not to a glossary in this repo.

## File structure

Single-context repo (most repos):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
