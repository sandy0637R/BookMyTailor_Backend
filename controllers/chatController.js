const Chat = require('../models/Chat');

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    if (!userId1 || !userId2 || userId1 === 'undefined' || userId2 === 'undefined' || userId1 === userId2) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const messages = await Chat.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender receiver', 'name email profileImage');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'Invalid message IDs' });
    }

    const result = await Chat.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
