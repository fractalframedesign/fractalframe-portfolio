# Git Skill

## Remote
- Repo: `https://github.com/fractalframedesign/fractalframe-portfolio.git`
- Auth: PAT for `fractalframedesign-commits` — embedded in remote URL

## Branches
| Branch    | Purpose            |
|-----------|--------------------|
| `main`    | Active development |
| `staging` | Preview (Vercel)   |
| `prod`    | Production (live)  |

## Workflow
```
main → staging (test) → prod (ship)
```

## Sync staging with main
```bash
git checkout staging && git merge main && git push && git checkout main
```
