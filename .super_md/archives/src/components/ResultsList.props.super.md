# ResultsList Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/ResultsList.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "ResultsList" src/ --include="*.tsx" --exclude="src/components/ResultsList.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
