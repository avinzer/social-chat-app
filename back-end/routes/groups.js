const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// Get all groups
router.get('/all', auth, async (req, res) => {
  try {
    console.log('Fetching all groups');
    const groups = await Group.find()
      .populate('creator', 'username profileImage')
      .populate('members.user', 'username profileImage');
    
    console.log('Groups fetched:', groups);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

// Create new group
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating group with data:', req.body);
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const newGroup = new Group({
      name,
      type,
      creator: req.user.userId,
      members: [{ user: req.user.userId, status: 'approved' }]
    });

    await newGroup.save();
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('creator', 'username')
      .populate('members.user', 'username');

    console.log('Group created:', populatedGroup);
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

module.exports = router; 
// Join group request
router.post('/:groupId/join', auth, async (req, res) => {
  try {
    console.log('Join group request:', { groupId: req.params.groupId, userId: req.user.userId });
    
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.userId
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add member with appropriate status
    const memberStatus = group.type === 'public' ? 'approved' : 'pending';
    group.members.push({ 
      user: req.user.userId, 
      status: memberStatus 
    });

    await group.save();

    // If it's a private group, create notification for group creator
    if (group.type === 'private') {
      const notification = new Notification({
        recipient: group.creator,
        sender: req.user.userId,
        type: 'group_join_request',
        content: `requested to join ${group.name}`,
        read: false
      });
      await notification.save();
    }

    // Get updated group data
    const updatedGroup = await Group.findById(group._id)
      .populate('creator', 'username')
      .populate('members.user', 'username profileImage');

    res.json({ 
      message: `Successfully ${memberStatus === 'approved' ? 'joined' : 'requested to join'} group`,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
});

// Handle join request (approve/reject)
router.put('/:groupId/members/:userId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is group creator
    if (group.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find and update member status
    const memberIndex = group.members.findIndex(
      member => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    group.members[memberIndex].status = status;
    await group.save();

    // Create notification for the user
    const notification = new Notification({
      recipient: req.params.userId,
      sender: req.user.userId,
      type: 'group_join_response',
      content: `Your request to join ${group.name} has been ${status}`,
      read: false
    });
    await notification.save();

    // Get updated group data
    const updatedGroup = await Group.findById(group._id)
      .populate('creator', 'username')
      .populate('members.user', 'username profileImage');

    res.json({
      message: `Member ${status}`,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error handling join request:', error);
    res.status(500).json({ message: 'Error handling join request', error: error.message });
  }
});

// Delete group
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Group.findByIdAndDelete(req.params.groupId);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group' });
  }
});