/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { buildTargetUrl } from '../src/screens/HomeScreen';
import { hasDefaultGoogleBookmark } from '../src/hooks/useBrowser';
import { SettingsScreen } from '../src/screens/SettingsScreen';

jest.mock('../src/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        surface: '#ffffff',
        primary: '#3b82f6',
        accent: '#14b8a6',
        border: '#d1d5db',
        textMuted: '#6b7280',
        text: '#111827',
        header: '#111827',
        success: '#22c55e',
        secondary: '#8b5cf6',
        white: '#ffffff',
        onPrimary: '#ffffff',
      },
      spacing: { lg: 16 },
      radius: { lg: 12, md: 8 },
      fonts: { serif: 'serif' },
    },
    themeName: 'light',
    setTheme: jest.fn(),
  }),
}));

jest.mock('../src/hooks/useVocabulary', () => ({
  useVocabulary: () => ({ dailyGoal: 10, setDailyGoal: jest.fn() }),
}));

jest.mock('../src/hooks/useSettings', () => ({
  useSettings: () => ({ searchByReading: false, setSearchByReading: jest.fn() }),
}));

jest.mock('../src/hooks/useDatabaseSeeding', () => ({
  useDatabaseSeeding: () => ({ loadingSeeding: false, handleVerifyDatabase: jest.fn() }),
}));

jest.mock('../src/hooks/useDictionaryImport', () => ({
  useDictionaryImport: () => ({ importFromZip: jest.fn(), isImporting: false, progress: '' }),
}));

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

test('settings screen uses English labels instead of Spanish text', () => {
  const tree = ReactTestRenderer.create(<SettingsScreen />);
  const text = tree.root.findAllByType(Text).map((node) => {
    const children = node.props.children;
    if (Array.isArray(children)) {
      return children.join(' ');
    }
    return String(children ?? '');
  }).join(' ');

  expect(text).toContain('Settings');
  expect(text).toContain('Reading & Learning');
  expect(text).toContain('Daily Goal');
  expect(text).not.toContain('Configuración');
  expect(text).not.toContain('Buscar por Lectura');
});
