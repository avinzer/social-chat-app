/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import '../style/_login.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phoneNumber: '',
    country: '',
    profileImage: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profileImage: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let response;
      if (isLogin) {
        response = await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        });
      } else {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key]) {
            data.append(key, formData[key]);
          }
        });
        response = await api.post('/auth/signup', data);
      }

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-login'>
      <div className='login'>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <form onSubmit={handleSubmit} className='login-form'>
        <div className='login-form-inputs'>
          <label htmlFor="username">Username: </label>
          <input 
            type="text" 
            name='username' 
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className='login-form-inputs'>
          <label htmlFor="password">Password: </label>
          <input 
            type="password" 
            name='password' 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {!isLogin && (
          <>
            <div className='login-form-inputs'>
              <label htmlFor="phoneNumber">Phone: </label>
              <input 
                type="tel" 
                name='phoneNumber' 
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className='login-form-inputs'>
              <label htmlFor="country">Country: </label>
              <input 
                type="text" 
                name='country' 
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div className='login-form-inputs'>
              <label htmlFor="profileImage">Profile Picture: </label>
              <input 
                type="file" 
                name='profileImage'
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </>
        )}
        <button 
          type='submit' 
          className='login-form-button'
          disabled={loading}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <div className="auth-switch">
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;