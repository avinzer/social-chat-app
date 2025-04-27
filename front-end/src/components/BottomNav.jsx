/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/_bottomNav.scss';

const BottomNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  return (
    <nav className="bottom-nav">
      <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
        Profile
      </Link>
      <Link to="/posts" className={location.pathname.startsWith('/posts') ? 'active' : ''}>
        Posts
      </Link>
      <Link to="/groups" className={location.pathname.startsWith('/groups') ? 'active' : ''}>
        Groups
      </Link>
      <Link to="/news" className={location.pathname.startsWith('/news') ? 'active' : ''}>
        News
      </Link>
      <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>
        Chat
      </Link>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </nav>
  );
};

export default BottomNav; 