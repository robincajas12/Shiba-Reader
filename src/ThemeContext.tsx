import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Themes, ThemeType, ThemeName, DefaultTheme } from './theme';
import { dbEngine } from './db/engine';

interface ThemeContextType {
  theme: ThemeType;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const settingsRepo = dbEngine.getRepository('SettingsRepository');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await settingsRepo.get('theme_name', 'light');
        if (savedTheme && Themes[savedTheme as ThemeName]) {
          setThemeName(savedTheme as ThemeName);
        }
      } catch (e) {
        console.error('Error loading theme:', e);
      }
    };
    loadTheme();
  }, [settingsRepo]);

  const theme = Themes[themeName] || DefaultTheme;

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      await settingsRepo.set('theme_name', name);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
