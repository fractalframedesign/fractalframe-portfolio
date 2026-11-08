# Fractal Frame

Kiran Pingle's portfolio, component showcase and the admin console that controls who can see them. One repo, several apps, managed with npm workspaces and [Turborepo](https://turborepo.com).

## Layout

```
apps/
  portfolio/            Next.js site: portfolio, /showcase and /admin (one Vercel project)
packages/
  typescript-config/    shared tsconfig presets (base, nextjs)
docs/                   branching, deployment, plans and specs
.nvmrc                  Node version used everywhere (local, CI, Vercel)
turbo.json              tasks and the env vars each build may read
```

Inside `apps/portfolio`, the site, showcase and admin are separate route groups with their own layouts and styles. See `CLAUDE.md` for how they fit together.

## Getting started

1. Use Node 24. With [fnm](https://github.com/Schniz/fnm) or nvm, run `fnm use` (or `nvm use`) in this folder; it reads `.nvmrc`.
2. Install everything from the repo root:

   ```bash
   npm install
   ```

3. Copy `apps/portfolio/.env.example` to `apps/portfolio/.env.local` and fill in what you need. The site runs without any of them; `/admin` needs `DATABASE_URL`, `ADMIN_SESSION_SECRET` and `ADMIN_PASSWORD`.
4. Start the site at [localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Commands

Run from the repo root; Turborepo runs them in every app that has the script.

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Starts the portfolio                         |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | TypeScript                                   |
| `npm test`          | Vitest                                       |
| `npm run build`     | Production build (CI runs all four of these) |

Only for the portfolio: `npm run env:check -w portfolio` lists missing or invalid environment variables.

## Environment variables

- Every variable is listed, with what it does, in `apps/portfolio/src/lib/env.ts` and `.env.example`.
- Real values live in Vercel → Settings → Environment Variables. Never commit `.env.local`.
- A **production** deploy stops with a clear message if a required one is missing. Previews and local builds only warn.
- Adding a variable: add it to `env.ts`, `.env.example` and the `env` list in `turbo.json` (Turborepo hides unlisted variables from the build).

## Adding an app

See "Monorepo" in `CLAUDE.md`.

## Branches and deploys

- [Branching strategy](docs/branching-strategy.md)
- [Deployment workflow](docs/deployment-workflow.md)
