---
name: uiux-excellence-guide
description: Use when designing, redesigning, auditing, or implementing UI/UX; improving design systems, accessibility, responsive behavior, microcopy, motion, or Web Vitals.
---

# UI UX Excellence Guide

## Overview

Turn vague UI requests into production-ready decisions and implementation guidance.
Treat visual quality, clarity, usability, accessibility, responsiveness, and performance as one system.

## Workflow Selection

Choose one primary workflow before proposing changes:

1. `Greenfield`: create a new screen, feature, product surface, or design system slice.
2. `Refactor`: improve existing UI while preserving product behavior.
3. `Audit`: critique, diagnose, or prioritize fixes before implementation.

If the user asks directly for implementation, do the workflow internally and deliver the changed UI. If the request is ambiguous but low risk, make reasonable assumptions and state them.

## Shared Rules

Apply these rules in every workflow:

1. Start from the user's task, audience, platform, and success signal.
2. Decide layout rhythm early: spacing ramp, grid, margins, gutters, and density.
3. Use semantic tokens for spacing, typography, color, radius, elevation, and motion.
4. Treat microcopy, empty states, loading states, and errors as interaction design.
5. Keep accessibility constraints non-negotiable; document any unmet item as risk.
6. Validate the actual touched surface before delivery whenever tooling allows it.

Read `references/uiux-baseline-2026.md` when you need numeric defaults, accessibility thresholds, touch targets, motion rules, or Web Vitals criteria. Read `references/uiux-delivery-template.md` only for complete design handoffs or audit reports.

## Greenfield

1. Frame the problem:
- Identify audience, platform, key journeys, and success criteria.
- Confirm if there is an existing design system; if none, define a minimal token contract.

2. Establish structural system:
- Set spacing, grid, margins, gutters, and density before decorative styling.
- Prefer `compact` only for data-heavy or operational surfaces.

3. Define readability and hierarchy:
- Define type scale, line-height, content hierarchy, and concise state-first labels.
- Ensure contrast, focus visibility, and non-text affordance contrast.

4. Define motion and state communication:
- Use short, purposeful transitions for state change and spatial continuity.
- Provide reduced-motion fallback behavior.

5. Plan validation:
- Set UX, accessibility, responsive, and performance acceptance criteria before implementation.

## Refactor

1. Audit the current surface:
- Map friction points: confusion, misclicks, unreadable content, poor hierarchy.
- Identify inconsistent tokens, spacing rhythm, responsive behavior, and interaction patterns.

2. Prioritize changes:
- Rank by impact on task success, error reduction, and accessibility risk.
- Prefer low-risk structural fixes before visual polish.

3. Refactor with guardrails:
- Preserve working behavior unless regression is explicitly accepted.
- Normalize onto semantic tokens and remove one-off values.
- Improve copy, state feedback, and recovery paths where users get stuck.

4. Validate and report:
- Compare before/after behavior for the touched surface.
- Include exact files touched and expected user-visible improvements.

## Audit

1. Produce findings first, ordered by severity.
2. Attach concrete evidence (component, flow, file, line when applicable).
3. Provide actionable fixes, not vague recommendations.
4. Separate hard blockers from enhancement opportunities.
5. State validation gaps explicitly if checks cannot be completed.

## Output Contract

For substantial design or implementation work, return outcomes in this order:

1. `Direction`: concise visual and UX direction statement.
2. `Decisions`: spacing, typography, density, motion, accessibility, and performance choices.
3. `Implementation`: exact edits or code-level plan.
4. `Validation`: checklist and measured/proxy results.
5. `Risks`: what is still unknown or untested.

For small fixes, answer briefly but still mention the user-visible change, validation performed, and remaining risk.

## References

- `references/uiux-baseline-2026.md`: implementation defaults and thresholds.
- `references/uiux-delivery-template.md`: reusable response format for design and implementation tasks.
