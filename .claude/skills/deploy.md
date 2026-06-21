# Deploy Skill

## Merge main → staging
```bash
git checkout staging && git merge main && git push && git checkout main
```

## Merge staging → prod
```bash
git checkout prod && git merge staging && git push && git checkout main
```

## Push current branch
```bash
git add . && git commit -m "<message>" && git push
```
