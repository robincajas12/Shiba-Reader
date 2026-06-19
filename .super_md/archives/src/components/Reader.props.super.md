# Reader Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/Reader.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "Reader" src/ --include="*.tsx" --exclude="src/components/Reader.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
