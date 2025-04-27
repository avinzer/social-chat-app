/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import '../style/_profile.scss';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('Fetching profile for user:', user);
        const response = await api.get(`/api/users/${user.id}`);
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to fetch profile data');
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);

  if (!user) return <div className="profile-error">Please log in</div>;
  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profileData) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profileData.profileImage ? (
            <img 
              src={`http://localhost:5000${profileData.profileImage}`} 
              alt="Profile" 
            />
          ) : (
            <div className="avatar-placeholder">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h1>{profileData.username}</h1>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <label>Username</label>
          <span>{profileData.username}</span>
        </div>
        <div className="detail-item">
          <label>Phone Number</label>
          <span>{profileData.phoneNumber}</span>
        </div>
        <div className="detail-item">
          <label>Country</label>
          <span>{profileData.country}</span>
        </div>
        <div className="detail-item">
          <label>Member Since</label>
          <span>{new Date(profileData.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;