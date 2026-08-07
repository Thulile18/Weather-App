import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Pages/Home';
import Favourites from './Components/Pages/Favourites';
import Settings from './Components/Settings/Settings';
import Header from './Components/Layout/Header';
import { WeatherStorageService } from './Components/Services/LocalStorageServices';
import './App.css';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const storage = new WeatherStorageService();

  useEffect(() => {
    const settings = storage.getSettings();
    setTheme(settings.theme || 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, theme: newTheme });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </Router>
  );
};

export default App;