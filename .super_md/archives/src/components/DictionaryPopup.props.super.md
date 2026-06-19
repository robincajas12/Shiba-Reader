# DictionaryPopup Props & Usage

This file tracks the interface and consumption of the `DictionaryPopup` component.

```run
echo "## Props Interface"
grep -A 10 "interface .*Props" src/components/DictionaryPopup.tsx | grep -v "{" | grep -v "}"

echo -e "\n## Rendered In (Screens)"
grep -rE "DictionaryPopup" src/screens/ --include="*.tsx" | cut -d: -f1 | sort | uniq | sed 's/^/- /'
```
