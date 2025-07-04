import { DefaultTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2A4D69',
    secondary: '#4B86B4',
    surface: '#E7ECEF',
    background: '#F8FAFC',
    text: '#1E293B',
    secondaryText: '#64748B',
    success: '#22C55E',
    error: '#EF4444',
    onSurface: '#1E293B',
    accent: '#D97706',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
};

export const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2A4D69',
    secondary: '#4B86B4',
    surface: '#1F2A44',
    background: '#0F172A',
    text: '#E2E8F0',
    secondaryText: '#94A3B8',
    success: '#22C55E',
    error: '#EF4444',
    onSurface: '#E2E8F0',
    accent: '#D97706',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
};