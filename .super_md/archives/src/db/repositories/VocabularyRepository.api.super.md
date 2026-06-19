# VocabularyRepository API

This file tracks the public methods available in the `VocabularyRepository`. Use this as a reference before adding new data logic.

```run
echo "## Public Methods"
grep -E "async .*\(" src/db/repositories/VocabularyRepository.ts | sed 's/^[ ]*//' | grep -v "private"

echo -e "\n## Hook Usage"
grep -rE "VocabularyRepository" src/hooks/ | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
