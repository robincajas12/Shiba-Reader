# TermBankEntryRepository API

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/TermBankEntryRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "TermBankEntryRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
