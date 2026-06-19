# Vocabulary Health Check

This file tracks the usage of types defined in `Vocabulary.ts`. Use this to assess impact before making changes to the Vocabulary schema.

```run
echo "## Defined Types in Vocabulary.ts"
grep -E "export (type|interface) [A-Z]" src/db/schemas/Vocabulary.ts

echo -e "\n## Impact Analysis: Where VocabularyEntry is used"
grep -rE "VocabularyEntry" src/ --exclude-dir={ja-dic-engine,native,webview} --exclude="src/db/schemas/Vocabulary.ts" | cut -d: -f1 | sort | uniq | sed 's/^/- /'

echo -e "\n## UI Impact (Screens & Components)"
# Tracks the type and the primary hook that provides this data to the UI
grep -rE "VocabularyEntry|useVocabulary" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
