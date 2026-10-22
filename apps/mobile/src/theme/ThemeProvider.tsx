import React, { createContext, useContext, type ReactNode } from 'react';
import { theme, type AppTheme } from './tokens';

const ThemeContext = createContext<AppTheme>(theme);

export interface ThemeProviderProps {
  children: ReactNode;
  value?: AppTheme;
}

export function ThemeProvider({ children, value = theme }: ThemeProviderProps) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
