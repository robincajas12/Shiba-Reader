/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { buildTargetUrl } from '../src/screens/HomeScreen';
import { hasDefaultGoogleBookmark } from '../src/hooks/useBrowser';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('uses Google search for text queries and the home page for blank input', () => {
  expect(buildTargetUrl('')).toBe('https://www.google.com/');
  expect(buildTargetUrl('猫')).toBe('https://www.google.com/search?q=%E7%8C%AB');
  expect(buildTargetUrl('example.com')).toBe('https://example.com');
  expect(buildTargetUrl('https://example.com/path')).toBe('https://example.com/path');
});

test('does not treat the default Google bookmark as missing when it already exists', () => {
  const bookmarks = [{ id: 1, title: 'Google', url: 'https://www.google.com/', created_at: Date.now() }];

  expect(hasDefaultGoogleBookmark(bookmarks)).toBe(true);
  expect(hasDefaultGoogleBookmark([])).toBe(false);
});
