---
name: test-safety-net
description: "Use when adding or modifying logic in auth, services, bookings, forms, or migrations and you need a practical test safety net before merge."
---

# Test Safety Net Skill

## Goal
Ensure each relevant change is protected by fast and meaningful validation.

## Strategy
1. Classify change type:
   - UI behavior
   - form validation
   - async data fetching
   - access control
   - migration or policy
2. Select minimum test set:
   - unit tests for pure validation/rules
   - component tests for interaction and rendering
   - integration tests for protected flows
3. Execute command sequence:
   - npm run lint
   - npm run test
   - npm run build
4. If failure occurs:
   - isolate root cause
   - fix with minimal scope
   - rerun full sequence

## Priority test targets
- Auth context and protected route behavior
- Booking creation guardrails
- Service form validation edge cases
- Dashboard role-based rendering

## Output
- Test scope applied
- Commands executed
- Failures found and fixes
- Residual test gaps
