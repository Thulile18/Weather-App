import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../Button';
import Sidebar from './Sidebar';
import './Header.css'; 

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="app-main-header">
        <div className="header-container-inner">
          
          <button 
            onClick={() => setSidebarOpen(true)}
            className="hamburger-menu-btn"
            aria-label="Open navigation menu"
          >
            
          </button>

          <Link to="/" className="header-brand-logo-link">
            Weather Portal
          </Link>

          <div className="header-navigation-controls">
            <Link 
              to="/favourites" 
              className={`header-action-nav-link ${location.pathname === '/favourites' ? 'active-tab' : ''}`}
            >
              Favourites
            </Link>
            
            <Link 
              to="/settings" 
              className={`header-action-nav-link settings-icon-tab ${location.pathname === '/settings' ? 'active-tab' : ''}`}
            >
              Settings
            </Link>
            
            <Button 
              onClick={onToggleTheme} 
              variant="secondary" 
              size="sm"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Header;
