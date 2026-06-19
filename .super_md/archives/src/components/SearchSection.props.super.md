# SearchSection Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/SearchSection.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "SearchSection" src/ --include="*.tsx" --exclude="src/components/SearchSection.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
