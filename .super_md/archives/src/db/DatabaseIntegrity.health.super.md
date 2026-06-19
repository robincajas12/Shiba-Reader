# Database Integrity Health Check

This file monitors the codebase for direct SQL execution (`db.execute`) outside of the authorized Repository pattern.

```run
echo "## Unauthorized SQL Execution"
echo "The following files contain direct .execute() calls outside of Repositories:"
grep -rE "\.execute\(" src/ \
  --exclude-dir=repositories \
  --exclude=config.ts \
  --exclude=engine.ts \
  --exclude="*.super.md" \
  | sed 's/^/- /'

echo -e "\n## Summary"
# Count without command substitution to show user
grep -rE "\.execute\(" src/ --exclude-dir=repositories --exclude=config.ts --exclude=engine.ts --exclude="*.super.md" | wc -l | xargs -I {} echo "Found {} unauthorized SQL call(s)."
```
