---
name: supabase-safe-migration
description: "Use when creating or reviewing Supabase SQL migrations, especially schema changes, RLS updates, triggers, and status transition logic."
---

# Supabase Safe Migration Skill

## Goal
Apply database changes safely while preserving authorization and domain behavior.

## Migration checklist
1. Schema impact
- Added/removed columns and defaults
- Nullability and backward compatibility
- Index impact for key queries

2. Security impact
- RLS remains enabled
- Existing policies still enforce ownership rules
- No broad public write access introduced

3. Domain impact
- Booking transitions remain valid
- Service ownership model unchanged
- Review constraints preserved

4. Runtime impact
- Existing frontend queries still resolve expected fields
- Trigger behavior remains deterministic

5. Rollback readiness
- Define rollback path for destructive changes
- Avoid irreversible data loss when possible

## Validation
- Review SQL changes line by line
- Run local verification queries
- Re-test impacted frontend flows

## Output
- Risk summary
- Required follow-up actions
- Migration readiness decision
