# useSRS Usage

This file tracks where the `useSRS` hook is consumed. Use this to assess impact before changing SRS/Review logic.

```run
echo "## UI Consumers (Screens & Components)"
grep -rE "useSRS" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
