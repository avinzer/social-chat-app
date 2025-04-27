/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import '../style/_groups.scss';

const Group = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', type: 'public' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/api/groups/all');
        console.log('Groups data:', response.data);
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch groups');
        setLoading(false);
        console.error('Error fetching groups:', err);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/groups', newGroup);
      setShowCreateForm(false);
      setNewGroup({ name: '', type: 'public' });
      // Refresh groups
      const response = await api.get('/api/groups/all');
      setGroups(response.data);
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/api/groups/${groupId}`);
        setGroups(groups.filter(group => group._id !== groupId));
      } catch (err) {
        console.error('Error deleting group:', err);
      }
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroup(groupId);
      const response = await api.post(`/api/groups/${groupId}/join`);
      
      // Update groups list with new data
      setGroups(groups.map(group => 
        group._id === groupId ? response.data.group : group
      ));
      
      // Show success message based on group type
      const message = response.data.message;
      // You can add a toast notification here if you want
      
    } catch (err) {
      console.error('Error joining group:', err);
      // Show error message
    } finally {
      setJoiningGroup(null);
    }
  };

  const handleJoinRequest = async (groupId, userId, status) => {
    try {
      const response = await api.put(`/api/groups/${groupId}/members/${userId}`, { status });
      
      // Update groups list with new data
      setGroups(groups.map(group => 
        group._id === groupId ? response.data.group : group
      ));
      
      // Show success message
      // You can add a toast notification here
      
    } catch (err) {
      console.error('Error handling join request:', err);
      // Show error message
    }
  };

  if (loading) return <div className="groups-loading">Loading...</div>;
  if (error) return <div className="groups-error">{error}</div>;

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Groups</h1>
        <button 
          className="create-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create Group
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateGroup} className="create-group-form">
          <input
            type="text"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="Group Name"
            required
          />
          <select
            value={newGroup.type}
            onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {groups.length === 0 ? (
        <p className="no-groups">No groups available</p>
      ) : (
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group._id} className="group-card">
              <div className="group-header">
                <div className="group-title">
                  <h3>{group.name}</h3>
                  <span className="group-creator">
                    Created by {group.creator?.username || 'Unknown'}
                  </span>
                </div>
                <span className="group-type">{group.type}</span>
              </div>
              <div className="group-info">
                <span>{group.members.length} members</span>
                {group.creator === user.id ? (
                  <div className="group-actions">
                    <button 
                      onClick={() => handleDeleteGroup(group._id)}
                      className="delete-button"
                    >
                      Delete Group
                    </button>
                    {/* Show pending join requests for private groups */}
                    {group.type === 'private' && group.members
                      .filter(member => member.status === 'pending')
                      .map(member => (
                        <div key={member.user._id} className="join-request">
                          <span>{member.user.username} wants to join</span>
                          <div className="request-actions">
                            <button onClick={() => handleJoinRequest(group._id, member.user._id, 'approved')}>
                              Accept
                            </button>
                            <button onClick={() => handleJoinRequest(group._id, member.user._id, 'rejected')}>
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  !group.members.some(member => member.user === user.id) && (
                    <button 
                      onClick={() => handleJoinGroup(group._id)}
                      className="join-button"
                      disabled={joiningGroup === group._id}
                    >
                      {joiningGroup === group._id ? 'Joining...' : 
                        group.type === 'private' ? 'Request to Join' : 'Join Group'}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Group;