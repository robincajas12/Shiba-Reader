# Header Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/Header.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "Header" src/ --include="*.tsx" --exclude="src/components/Header.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
