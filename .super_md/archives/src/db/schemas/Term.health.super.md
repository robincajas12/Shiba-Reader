# Term Health Check

This file tracks the usage of types defined in `Term.ts`. Use this to assess impact before making changes to the Term schema.

```run
echo "## Defined Types in Term.ts"
grep -E "export (type|interface) [A-Z]" src/db/schemas/Term.ts

echo -e "\n## Impact Analysis: Where TermBankEntry is used"
grep -rE "TermBankEntry" src/ --exclude-dir={ja-dic-engine,native,webview} --exclude="src/db/schemas/Term.ts" | cut -d: -f1 | sort | uniq | sed 's/^/- /'

echo -e "\n## UI Impact (Screens & Components)"
# Tracks the type and hooks that handle dictionary/term data
grep -rE "TermBankEntry|useDictionary|useReaderLookup" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
