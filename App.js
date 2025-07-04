
import React, { useContext } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeContext, ThemeProvider } from './src/utils/ThemeContext';
import { useTheme } from 'react-native-paper';


export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { theme } = useContext(ThemeContext);
  console.log('Current theme:', theme);
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}