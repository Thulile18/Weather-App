import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay-backdrop"
          onClick={onClose}
        />
      )}
      
      <div className={`sidebar-drawer-panel ${isOpen ? 'sidebar-state-open' : ''}`}>
        <div className="sidebar-inner-content">
          
          <button 
            onClick={onClose}
            className="sidebar-close-action-btn"
            title="Close Menu"
          >
            ✕
          </button>
          
          <h2 className="sidebar-menu-title"> Menu </h2>
          
          <nav className="sidebar-nav-menu-links">
            <Link 
              to="/" 
              className="sidebar-nav-item-link"
              onClick={onClose} 
            >
               Home
            </Link>
            
            <Link 
              to="/favorites" 
              className="sidebar-nav-item-link"
              onClick={onClose}
            >
               Favorites
            </Link>
          </nav>
          
        </div>
      </div>
    </>
  );
};

export default Sidebar;
