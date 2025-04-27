/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const MakeGroup = () => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/groups', { name: groupName });
    setGroupName(''); // Clear the input after submission
    // Optionally navigate to the Group page or show a success message
  };

  return (
    <div>
      <h1>Create a New Group</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
};

export default MakeGroup;