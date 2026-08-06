import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../Button';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  return (
    <header className="app-global-navigation-header">
      <div className="navigation-inner-container">
        
        <Link to="/" className="navigation-brand-logo-link">
            Weather App
        </Link>

        <div className="navigation-actions-row-alignment">
          <Link 
            to="/favorites" 
            className={`navigation-menu-item-link ${
              location.pathname === '/favorites' ? 'state-active-route' : ''
            }`}
          >
              Favorites
          </Link>
          
          <Button 
            onClick={onToggleTheme} 
            variant="secondary" 
            size="sm"
          >
            {theme === 'light' ? ' Switch Dark' : ' Switch Light'}
          </Button>
        </div>

      </div>
    </header>
  );
};


export default Header;