# BookmarkRepository API

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/BookmarkRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "BookmarkRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
