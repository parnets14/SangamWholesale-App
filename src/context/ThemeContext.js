// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

const themes = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    statusBarBackground: '#7B2533',
    statusBarStyle: 'light-content',
    splashBackground: '#7B2533',
    splashText: '#ffffff',
  },
  dark: {
    backgroundColor: '#1c2526',
    textColor: '#ffffff',
    statusBarBackground: '#000000',
    statusBarStyle: 'light-content',
    splashBackground: '#7B2533',
    splashText: '#ffffff',
  },
};

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  const theme = themes[colorScheme];

  return (
    <ThemeContext.Provider value={{ theme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);