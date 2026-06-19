# Webview Bridge Map

This file tracks the communication between the React Native app and the Webview reader.

```run
echo "## Outgoing: Webview -> App (postMessage)"
grep -rE "postMessage\(JSON.stringify" src/webview/script.tsx | sed 's/^[ ]*//'

echo -e "\n## Incoming: App -> Webview (onMessage handlers)"
grep -rE "onMessage={|handleMessage" src/components/Reader.tsx | sed 's/^[ ]*//'

echo -e "\n## Injected Code (App -> Webview)"
grep -rE "injectJavaScript" src/components/Reader.tsx | sed 's/^[ ]*//'
```
