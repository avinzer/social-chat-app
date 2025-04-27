import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/_topNav.scss';

const TopNav = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <Link to="/" className="app-title">Avinzer</Link>
      </div>
      
      {user && (
        <div className="nav-center">
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
        </div>
      )}
      
      {user && (
        <div className="nav-right">
          <span className="user-name">{user.username}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default TopNav; 