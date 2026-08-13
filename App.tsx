import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Components/Pages/Home';
import Favourites from './Components/Pages/Favourites';
import Settings from './Components/Settings/Settings';
import Header from './Components/Layout/Header';
import { WeatherProvider } from './Components/Context/WeatherContext';
import { useWeather } from './Components/Hooks/UseWeather';
import './App.css';

// AppShell reads the shared theme setting and applies it to the whole
// document, then renders the header and whichever page the user is on.
const AppShell: React.FC = () => {
  const { settings, updateSettings } = useWeather();
  const theme = settings?.theme || 'light';

  // Whenever the theme changes, add a data-theme attribute to the <html>
  // element. Our CSS files use this attribute to switch color variables.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (!settings) return;
    updateSettings({ ...settings, theme: theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <div className="app-viewport-root">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main-content-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <WeatherProvider>
        <AppShell />
      </WeatherProvider>
    </Router>
  );
};

export default App;
