# TokenPill Props & Usage

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/TokenPill.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In"
grep -rE "TokenPill" src/ --include="*.tsx" --exclude="src/components/TokenPill.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
