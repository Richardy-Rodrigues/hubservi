---
name: pre-merge-review
description: "Use when reviewing pull requests or code changes before merge, especially for regressions in auth, booking, dashboard, RLS, and business rules."
---

# Pre Merge Review Skill

## Goal
Detect functional regressions and business-rule violations before merge with medium rigor.

## Inputs expected
- Changed files
- Scope of feature/fix
- Any migration or policy changes

## Review workflow
1. Identify affected flow:
   - auth
   - services
   - booking
   - dashboard
2. Check authorization boundaries:
   - frontend route guards
   - role-based UI checks
   - Supabase RLS/policies consistency
3. Validate domain invariants:
   - booking status transitions
   - provider/client ownership
   - price range constraints
4. Run quality checks:
   - lint
   - tests
   - build
5. Report findings ordered by severity:
   - critical
   - high
   - medium
   - low

## Mandatory checks
- No new path allows unauthorized create/update/delete
- No weakening of policy conditions in migrations
- No broken navigation in protected routes
- No breaking change in expected table fields used by frontend

## Output format
- Findings first with file references
- Open questions/assumptions
- Short summary of confidence and residual risk
