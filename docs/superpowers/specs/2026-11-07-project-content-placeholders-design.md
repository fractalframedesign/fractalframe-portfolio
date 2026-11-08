# Project content placeholders

Status: approved for spec review, 2026-11-07

## Intent

Replace fictional, template-derived project content with clear placeholders so the portfolio does not present sample work, unsupported results, or third-party template links as Kiran's work. Keep the existing project routes available as slots for verified work to be added later.

## Scope

Update these 14 projects under `apps/portfolio/content/projects/`:

- `echo-ui`, `justos`, `happy-stats`, `cactus-plant`, `stellar`, `neobase`
- `charter`, `echo`, `plasma`, `scalar`, `sonic`, `streamline`, `relative`, `bloom`

The existing showcase projects (`fintech-components`, `finance-dashboard`, and `smart-home-dashboard`) are real project entries and are not part of this replacement.

## Design

- Preserve all 14 slugs, routes, project ordering, and `moreProjects` references.
- Rename the placeholder entries `Project 01` through `Project 14`, in the existing projects-page order, so fictional sample names are not mistaken for actual client or product work.
- Mark each placeholder as `upcoming`.
- Replace each summary and detail paragraph with concise, explicit prompts for the real project summary, context, role, and work. Remove unsupported metrics, implementation claims, and case-study narrative.
- Clear technology stacks and outcomes until verified information is provided.
- Remove the fictional Sonic case study structure; all 14 placeholders use the same project-detail layout.
- Use one shared, locally hosted image placeholder for each project cover and its single gallery image. The placeholder visibly says to replace it with a real project image.
- Do not show live-demo or source-code links until a project supplies real destinations. Make those fields optional and render each link only when its URL exists.
- Hide empty stack and highlights sections rather than rendering empty headings or blank content.

## Behavior and data flow

Project MDX remains the source of truth. The existing schema continues validating every entry, while optional live/source URLs let unfinished projects omit unavailable links. Project pages retain the same URL and shared card/detail components; real projects elsewhere remain unchanged.

## Verification

- Run the project content/schema tests and the focused project-page tests.
- Run `npm run lint` and `npm run typecheck` from `apps/portfolio`.
- Render a standard placeholder page and confirm the placeholder image, fill-in prompts, hidden outbound links, and omitted empty sections.
- Confirm the three showcase project entries and routes are unchanged.

## Out of scope

- Creating real project narratives, metrics, or screenshots without source material.
- Changing the existing showcase project content or the projects-page layout.
- Fixing unrelated interface-review findings.
