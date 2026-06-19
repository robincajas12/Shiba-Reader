# SRSRepository API

This file tracks the public methods available in the `SRSRepository`.

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/SRSRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "SRSRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
