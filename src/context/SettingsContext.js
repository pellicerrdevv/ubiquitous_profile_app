import React, { createContext, useState, useContext } from 'react';
import { Colors, i18n } from '../constants/theme';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState('en');

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const t = i18n[lang];

  return (
    <SettingsContext.Provider value={{ isDarkMode, setIsDarkMode, lang, setLang, theme, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);