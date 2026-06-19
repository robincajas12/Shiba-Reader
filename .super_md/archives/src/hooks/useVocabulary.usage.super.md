# useVocabulary Usage

This file tracks where the `useVocabulary` hook is consumed. Use this to assess impact before changing hook logic.

```run
echo "## UI Consumers (Screens & Components)"
grep -rE "useVocabulary" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
