# useSettings Usage

This file tracks where the `useSettings` hook is consumed. Use this to assess impact before changing app settings logic.

```run
echo "## UI Consumers (Screens & Components)"
grep -rE "useSettings" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
