---
name: docs-sync
description: "Use when code, scripts, business rules, routes, or migrations change and documentation must be updated in README and docs modules."
---

# Docs Sync Skill

## Goal
Keep technical and business documentation synchronized with real code behavior.

## Update workflow
1. Detect changed areas:
   - routes
   - auth flow
   - forms/validation
   - scripts/dependencies
   - migrations/RLS
2. Map each change to docs targets:
   - README hub
   - docs/01-overview.md
   - docs/02-architecture.md
   - docs/03-business-rules.md
   - docs/04-data-and-security.md
   - docs/05-development-and-quality.md
3. Apply bilingual updates (PT-BR and EN)
4. Validate consistency:
   - no contradictions between files
   - commands match package scripts
   - domain rules match SQL and app behavior

## Minimum documentation quality bar
- No placeholder text
- Practical and executable instructions
- Clear constraints and known risks

## Output
- Files updated
- Rule changes documented
- Remaining docs debt
