# Settings Health Check

This file tracks the usage of types defined in `Settings.ts`. Use this to assess impact before making changes to the Settings schema.

```run
echo "## Defined Types in Settings.ts"
grep -E "export (type|interface) [A-Z]" src/db/schemas/Settings.ts

echo -e "\n## Impact Analysis: Where SettingEntry is used"
grep -rE "SettingEntry" src/ --exclude-dir={ja-dic-engine,native,webview} --exclude="src/db/schemas/Settings.ts" | cut -d: -f1 | sort | uniq | sed 's/^/- /'

echo -e "\n## UI Impact (Screens & Components)"
# Tracks the type and the primary hook for app settings
grep -rE "SettingEntry|useSettings" src/ --include="*.tsx" --exclude-dir={ja-dic-engine,native,webview} | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
