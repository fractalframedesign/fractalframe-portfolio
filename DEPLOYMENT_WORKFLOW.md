# Deployment Workflow

## Overview

This project follows a **three-stage deployment pipeline**.

```text
feature/* (or new-content)
        │
        ▼
Pull Request
        │
        ▼
GitHub Actions (CI)
 ├── Install Dependencies
 ├── Lint
 ├── Run Tests
 └── Build
        │
        ▼
staging (Preview / QA)
        │
Automatic Vercel Deployment
        │
        ▼
QA Testing & Approval
        │
        ▼
Pull Request
staging → main
        │
        ▼
GitHub Actions (CI)
        │
        ▼
Production Deployment
```

---

# Branch Strategy

| Branch      | Purpose             | Environment    | Deployment |
| ----------- | ------------------- | -------------- | ---------- |
| `feature/*` | Feature development | Local          | Manual     |
| `staging`   | QA / Preview        | Vercel Preview | Automatic  |
| `main`      | Production          | Production     | Automatic  |

---

# Development Workflow

## 1. Create a Feature Branch

Always create a new branch from `staging`.

```bash
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/navbar-animation
```

---

## 2. Develop Your Feature

Work on your feature locally.

Commit regularly.

```bash
git add .
git commit -m "Add animated navbar"
```

Push your branch.

```bash
git push origin feature/navbar-animation
```

---

## 3. Create a Pull Request

Create a Pull Request:

```
feature/navbar-animation
            │
            ▼
         staging
```

Do **not** merge locally using `git merge`.

GitHub Pull Requests are required so that:

* Code Review can happen
* GitHub Actions can run
* Branch protection rules are enforced
* Deployment history remains clean

---

# Continuous Integration (CI)

Whenever a Pull Request is opened to **staging** or **main**, GitHub Actions automatically performs:

* Install dependencies
* Run ESLint
* Run Tests
* Build the application

If any step fails:

❌ The Pull Request cannot be merged.

---

# Merge to Staging

Once the Pull Request is:

* Reviewed
* Approved
* CI passes

Merge into `staging`.

After merging:

* Vercel automatically deploys a Preview build.
* QA verifies the changes.
* Fix any issues before promoting to production.

---

# Promote to Production

After QA approval:

Create another Pull Request:

```
staging
    │
    ▼
main
```

Requirements:

* QA Approved
* CI Passed
* Code Reviewed
* Team Lead / Maintainer Approval

Once merged:

* GitHub Actions runs again.
* Vercel automatically deploys Production.

---

# Branch Protection Rules

## main

* ✅ Pull Request required
* ✅ Minimum 2 approvals
* ✅ CI must pass
* ✅ No direct pushes
* ✅ No force pushes
* ✅ Only maintainers can merge

---

## staging

* ✅ Pull Request required
* ✅ CI must pass
* ✅ At least 1 approval
* ✅ No direct pushes

---

# Release Checklist

Before merging **staging → main**

* [ ] CI passed
* [ ] Code reviewed
* [ ] QA approved
* [ ] Preview deployment verified
* [ ] No critical bugs
* [ ] Product Owner / Team Lead approval

---

# Emergency Rollback

If production has a critical issue:

Find the commit to revert.

```bash
git revert <commit-hash>
git push origin main
```

This creates a rollback commit.

GitHub Actions automatically runs again.

Vercel deploys the rollback version.

---

# Useful Git Commands

## Get latest staging

```bash
git checkout staging
git pull origin staging
```

---

## Create feature branch

```bash
git checkout -b feature/your-feature-name
```

---

## Push branch

```bash
git push origin feature/your-feature-name
```

---

## Delete local branch after merge

```bash
git branch -d feature/your-feature-name
```

---

## Delete remote branch

```bash
git push origin --delete feature/your-feature-name
```

---

# CI/CD Pipeline

```text
Developer
    │
    ▼
Feature Branch
    │
    ▼
Pull Request
    │
    ▼
GitHub Actions
 ├── Checkout Code
 ├── Install Dependencies
 ├── Lint
 ├── Run Tests
 └── Build
    │
    ▼
Merge → staging
    │
    ▼
Automatic Preview Deployment (Vercel)
    │
    ▼
QA Testing
    │
    ▼
Approval
    │
    ▼
Pull Request
staging → main
    │
    ▼
GitHub Actions
    │
    ▼
Automatic Production Deployment
```

---

# Environment URLs

## Preview

```
https://staging.example.com
```

Replace with your Vercel Preview URL.

---

## Production

```
https://your-domain.com
```

Replace with your production domain.

---

## Vercel Dashboard

```
https://vercel.com/fractalframedesign/fractalframe-portfolio/deployments
```

---

# Team Responsibilities

| Role                   | Responsibility                                                 |
| ---------------------- | -------------------------------------------------------------- |
| Developer              | Create feature branches, implement changes, open Pull Requests |
| Reviewer               | Review code and approve Pull Requests                          |
| QA                     | Validate functionality in the Preview environment              |
| Team Lead / Maintainer | Approve releases to Production                                 |
| GitHub Actions         | Run automated CI checks                                        |
| Vercel                 | Deploy Preview and Production environments automatically       |

---

# Workflow Summary

```
Feature Branch
      │
      ▼
Pull Request
      │
      ▼
CI (GitHub Actions)
      │
      ▼
staging
      │
      ▼
Preview Deployment (Vercel)
      │
      ▼
QA Approval
      │
      ▼
Pull Request
staging → main
      │
      ▼
CI (GitHub Actions)
      │
      ▼
Production Deployment
```
