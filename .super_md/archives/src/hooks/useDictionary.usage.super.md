# useDictionary Usage

This file tracks where the `useDictionary` hook is consumed. Use this to assess impact before changing dictionary lookup logic.

```run
echo "## UI Consumers (Screens & Components)"
grep -rE "useDictionary" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
