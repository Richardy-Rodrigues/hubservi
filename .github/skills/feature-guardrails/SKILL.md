---
name: feature-guardrails
description: "Use when implementing a new feature to enforce safe steps for architecture, business rules, authorization, migrations, tests, and documentation updates."
---

# Feature Guardrails Skill

## Goal
Guide implementation so new features do not break business rules or data security.

## Implementation protocol
1. Clarify feature intent and impacted user role
2. Map impacted layers:
   - page/component
   - auth/role checks
   - database schema/policies
   - tests and docs
3. Define invariants to preserve:
   - ownership constraints
   - allowed status transitions
   - data shape compatibility
4. Implement in small reversible changes
5. Validate with lint/test/build
6. Update docs and changelog notes

## Domain guardrails
- Any change to booking flow must respect status transition rules
- Any change to service creation must keep provider ownership semantics
- Any change to profile handling must avoid privilege escalation through user_type
- Any schema change must evaluate RLS impact

## Done criteria
- Functional behavior verified
- Authorization boundaries preserved
- Relevant tests added/updated
- Documentation updated in docs and README hub
