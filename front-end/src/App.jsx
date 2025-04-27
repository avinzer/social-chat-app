/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from "./components/login.jsx"
import Profile from './components/Profile.jsx';
import Posts from './components/Posts.jsx';
import NewPost from './components/NewPost.jsx';
import Group from './components/Group.jsx';
import News from './components/News.jsx';
import Chat from './components/Chat.jsx';
import TopNav from './components/TopNav.jsx';
import "./style/App.scss"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <TopNav />
      <Routes>
        <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/profile" />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/posts/*" element={
          <ProtectedRoute>
            <Posts />
          </ProtectedRoute>
        } />
        <Route path="/groups/*" element={
          <ProtectedRoute>
            <Group />
          </ProtectedRoute>
        } />
        <Route path="/news/*" element={
          <ProtectedRoute>
            <News />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
