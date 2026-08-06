import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Pages/Home';
import Header from './Components/Layout/Header';
import Favourites from './Components/Pages/Favourites';
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
    storage.saveSettings({ 
      ...settings, 
      theme: newTheme 
    });
  };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-body-reset' : 'light-body-reset';
  }, [theme]);

  return (
    <Router>
      <div className={`app-canvas-frame ${theme}-theme-active`}>
        
        <Header theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="main-content-viewport">
          <Routes>
           
            <Route path="/" element={<Home />} />
            
            <Route path="/favorites" element={<Favourites />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
};

export default App;