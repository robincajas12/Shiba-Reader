# SRS Health Check

This file tracks the usage of types defined in `SRS.ts`. Use this to assess impact before making changes to the SRS schema.

```run
echo "## Defined Types in SRS.ts"
grep -E "export (type|interface) [A-Z]" src/db/schemas/SRS.ts

echo -e "\n## Impact Analysis: Where SRSEntry is used"
grep -rE "SRSEntry" src/ --exclude-dir={ja-dic-engine,native,webview} --exclude="src/db/schemas/SRS.ts" | cut -d: -f1 | sort | uniq | sed 's/^/- /'

echo -e "\n## UI Impact (Screens & Components)"
# Tracks the type and the primary hook that provides this data to the UI
grep -rE "SRSEntry|useSRS" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
