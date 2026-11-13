# Claude Opus 5.5 Portfolio Project Prompts

Use these prompts in Claude Code opened at the root of this portfolio repository. Start with Prompt 0, answer its intake questions, and confirm the project sequence before building. Run the three build prompts one at a time, then use the final review prompt.

The target is three portfolio-ready projects in 48 hours: a chat application, a combined Rakuten Link + Drive concept, and a mobile app redesign. The prompts prioritize interactive front-end demos over production backends.

---

## Prompt 0 — Repo check and project decisions

```text
You are Claude Opus 5.5 working in Claude Code at the root of my portfolio repository. I have 48 hours to add at least three strong portfolio projects for product designer / design engineer opportunities.

My priorities:
1. A chat application
2. A combined Rakuten Link + Rakuten Drive concept
3. A mobile app redesign

Do not code yet.

First inspect the repository state and relevant project instructions. Read the existing showcase implementation, including:
- apps/portfolio/src/lib/showcase.ts
- apps/portfolio/content/projects/fintech-components.mdx
- one existing showcase project’s route, theme.css, docs, and case-study pages
- the repo’s project/agent instructions

Before coding, check the existing git status. Do not overwrite or modify unrelated work, including untracked files/folders. Do not commit, push, deploy, or run a production build unless I explicitly ask.

The portfolio has project-specific conventions. Follow its existing patterns rather than inventing a new app structure. Read the locally installed Next.js guidance under node_modules/next/dist/docs/ before using Next.js APIs; if it is unavailable, say so and follow existing in-repo patterns.

Ask me one concise batch of only the decisions that materially affect the work:
1. Chat app audience/use case and its one standout problem to solve.
2. Whether the Rakuten work is official/commissioned, existing work I can disclose, or an independent concept; ask what brand assets/screenshots I can provide.
3. The key Link + Drive workflow to demonstrate.
4. Whether I have a specific mobile app/screenshots to redesign; if not, offer three distinct fictional product concepts for me to choose from.
5. Whether to replace three of the current numbered project placeholders or add three more entries. Recommend the safer option after inspecting the project list.
6. Any visual references or style constraints.

Do not ask questions already answered here. Wait for my answers before implementation. If I leave a noncritical choice unanswered, recommend a sensible default and state it. Never imply Rakuten affiliation or invent client work, user research, outcomes, metrics, or personal experience. If the Rakuten work is independent, include a clear “Independent concept; not affiliated with Rakuten” disclosure in the demo and case study.

After I answer, summarize the three projects, their acceptance criteria, and the proposed sequence in a short checklist, then wait for approval before coding.
```

## Prompt 1 — Build the chat application

```text
Build project 1: the chat application we agreed on in the intake. Work in the existing portfolio repo and follow its showcase patterns.

Before editing, confirm the approved brief and inspect the current git status. Do not touch unrelated changes. Do not commit, push, deploy, or run a production build unless I explicitly request it.

Deliver a polished, responsive, interactive front-end demo—not a static mockup. Use realistic seeded sample data and browser-local persistence where useful. Do not add a real backend, real authentication, external API dependency, or fake file-upload service.

Keep the scope to one complete, impressive core workflow. At minimum, implement the approved chat use case’s key navigation and conversation flow, message composition/sending, and the interactions we selected. Include useful empty, loading or simulated states only where they improve the demo. Avoid adding features that don’t strengthen the agreed story.

Integrate it using the existing conventions:
- Components in apps/portfolio/src/components/project-demos/<approved-slug>/
- Showcase route under apps/portfolio/src/app/(showcase)/showcase/<approved-slug>/
- Register it in apps/portfolio/src/lib/showcase.ts
- Add its portfolio project entry/content using the agreed replace-or-add decision
- Follow the existing route/layout/docs/case-study/theme.css conventions

Use the repo’s shadcn components, Tailwind utilities, semantic theme tokens, and accessible keyboard/focus behavior. Avoid arbitrary color values and avoid empty image src attributes. Keep the visual identity original and consistent with the project brief.

Do not fabricate research, customers, business results, or metrics in the case study. Label concept work honestly. Before finishing, run the smallest relevant tests, lint, and typecheck available. Report files changed, implemented flows, checks and results, known limitations, and the exact next step.
```

## Prompt 2 — Build the Rakuten Link + Drive concept

```text
Build project 2: the combined Rakuten Link + Rakuten Drive experience from our approved intake.

First restate the approved project status and disclosure. If I have not confirmed whether this is official work or an independent concept, stop and ask before using Rakuten branding. Never imply Rakuten endorsement, employment, or client involvement unless I explicitly confirm it. For independent work, visibly disclose “Independent concept; not affiliated with Rakuten.”

Build a responsive, interactive front-end demo around the agreed Link + Drive workflow. Use seeded local data and browser-local persistence if needed. No real accounts, messaging backend, cloud storage, real file uploads, or external APIs. Make simulated interactions clear and honest.

Prioritize the end-to-end workflow we chose—for example, finding a file, sharing it into a conversation, and locating it again in Drive—rather than attempting to recreate two complete production apps. Keep it distinct from the separate chat-app project: emphasize the approved Link/Drive integration problem and its solution.

Use only approved assets I provide. Otherwise create an original UI using the project’s own visual direction; do not copy proprietary screens pixel-for-pixel or invent product capabilities as facts.

Integrate it using the portfolio’s existing showcase patterns:
- Components in apps/portfolio/src/components/project-demos/<approved-slug>/
- Showcase route under apps/portfolio/src/app/(showcase)/showcase/<approved-slug>/
- Registration in apps/portfolio/src/lib/showcase.ts
- Project content using the agreed replace-or-add decision
- Existing route, docs, case-study, and scoped theme.css conventions

Use shadcn components, Tailwind utilities, semantic theme tokens, responsive layout, and keyboard accessibility. Do not fabricate research, results, metrics, or client claims.

Check git status first and preserve unrelated work. Do not commit, push, deploy, or run a production build unless asked. Run focused tests, lint, and typecheck. Report the working flow, disclosure, files changed, checks, limitations, and next step.
```

## Prompt 3 — Build the mobile app redesign

```text
Build project 3: the mobile app redesign from our approved intake.

Use the specific app/screenshots/product concept and design problem I approved. If no target app or concept has been approved, stop and ask me to choose; do not invent a redesign subject and start coding.

Create a mobile-first, interactive portfolio demo focused on one complete user journey and a small set of essential screens/states. Make the experience responsive at phone and desktop sizes, but prioritize the phone layout. Use local sample data and local state; no backend, real login, payments, or third-party API calls.

If this is a redesign of an existing product, distinguish my proposed design from the real product and use only source material I provide. If it is a fictional concept, label it as a concept. Do not claim real user research, test results, business impact, or client work.

Follow the repo’s existing showcase conventions:
- Components in apps/portfolio/src/components/project-demos/<approved-slug>/
- Showcase route under apps/portfolio/src/app/(showcase)/showcase/<approved-slug>/
- Registration in apps/portfolio/src/lib/showcase.ts
- Project entry/content using the agreed replace-or-add decision
- Existing route, docs, case-study, and scoped theme.css conventions

Use shadcn components, Tailwind utilities, semantic theme tokens, accessible touch targets, keyboard/focus behavior, and the repo’s established typography and layout utilities. Avoid arbitrary color values and empty image src attributes.

Check git status before editing and preserve unrelated work. Do not commit, push, deploy, or run a production build unless asked. Run focused tests, lint, and typecheck. Report the implemented journey, responsive behavior, files changed, checks, limitations, and next step.
```

## Prompt 4 — Final portfolio review

```text
Review the three completed projects as a portfolio-quality product designer / design engineer deliverable. Do not begin broad redesigns or unrelated refactors.

Check:
- Each project has the correct route, showcase registration, project-list entry, docs, and case-study links.
- The three demos have distinct purposes and at least one complete, working core flow each.
- Interactions work with seeded data and local persistence as specified; no misleading fake backend behavior.
- Rakuten affiliation/disclosure is accurate and visible wherever required.
- Case studies do not contain invented research, outcomes, metrics, or client claims.
- Layouts work on mobile and desktop; keyboard navigation, focus states, and semantic structure are reasonable.
- No broken routes, empty headings, empty image src values, placeholder content presented as finished work, or console errors.
- Existing projects and unrelated work remain unchanged.

Run focused tests, lint, and typecheck. Do not commit, push, deploy, or run a production build unless I explicitly ask. Fix only issues directly related to these three projects, rerun the relevant checks, then give me a concise launch checklist and remaining known limitations.
```
