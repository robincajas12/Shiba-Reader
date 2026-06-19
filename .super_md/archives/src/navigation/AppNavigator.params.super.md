# Navigation Parameters Reference

This file tracks the expected parameters for each screen in the app. Use this before performing navigation to ensure correct data flow.

```run
echo "## Navigation Parameter Interfaces"
# Captures parameter lists for both Tab and Stack navigators
grep -A 30 "ParamList = {" src/navigation/AppNavigator.tsx | grep -vE "const .* =|return \(" | grep -vE "^[ ]*header|^[ ]*backgroundColor"

echo -e "\n## Screen Definitions"
# Extracts screen names and components mapping
grep -E "name=\"[^\"]+\"|component=\{[^\}]+\}" src/navigation/AppNavigator.tsx | sed 's/^[ ]*//' | sed 's/name=//' | sed 's/component=/ -> /' | tr -d '\"{}>' | paste -d \"\" - - | sed 's/^[ ]*//'
```
