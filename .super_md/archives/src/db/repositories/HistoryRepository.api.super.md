# HistoryRepository API

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/HistoryRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "HistoryRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
