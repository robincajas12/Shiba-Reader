# SettingsRepository API

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/SettingsRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "SettingsRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
