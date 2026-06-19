# EntryCard Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/EntryCard.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "EntryCard" src/ --include="*.tsx" --exclude="src/components/EntryCard.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
