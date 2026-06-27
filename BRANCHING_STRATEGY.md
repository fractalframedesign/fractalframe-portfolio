# Branching Strategy

## Branch Structure

```
main        ← production (live site)
 └── staging ← integration branch (test before releasing)
      └── feat/your-feature ← your work goes here
```

- **`main`** — always reflects what's live. Never commit directly to this.
- **`staging`** — features land here first and get tested. Never commit directly to this either.
- **Feature branches** — all work happens here, then gets merged into `staging` via a PR.

---

## Starting a New Feature

```bash
# 1. Make sure you're up to date
git checkout staging
git pull origin staging

# 2. Create a feature branch
git checkout -b feat/your-feature-name
```

---

## Branch Naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Config, deps, tooling |
| `refactor/` | Code cleanup with no behavior change |

Examples: `feat/contact-form`, `fix/mobile-nav`, `chore/update-deps`

---

## Opening a Pull Request

When your feature is ready:

```bash
git push -u origin feat/your-feature-name
gh pr create --base staging --title "feat: short description" --body "What and why"
```

- PRs must target `staging`, not `main`
- CI runs automatically (lint + build) — fix any failures before merging

---

## Releasing to Production

Once your feature is merged into `staging` and tested:

1. Open a PR from `staging` → `main`
2. Once approved, it auto-merges via the `auto-promote` workflow
3. Vercel picks up the merge and deploys automatically

---

## Rules

- Never push directly to `staging` or `main`
- Always branch from the latest `staging`
- Keep PRs small and focused — one feature or fix per PR
- Write a clear commit message: `feat: add hero section` not `update stuff`
