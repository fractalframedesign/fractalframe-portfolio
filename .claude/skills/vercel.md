# Vercel Skill

## Environments
| Environment | Branch    | URL                  |
|-------------|-----------|----------------------|
| Production  | `main`    | Custom domain        |
| Staging     | `staging` | Vercel preview URL   |

## Account
- Vercel account: `fractalframedesign`
- Project: `fractalframe-portfolio`

## Known fixes applied
- `ProjectsTabs` wrapped in `<Suspense>` — nuqs uses `useSearchParams()` internally
- Smart/curly quotes in `src/app/projects/page.tsx` caused Turbopack parse error
- `next-mdx-remote` updated from `5.0.0` → `6.0.0` (vulnerability fix)
