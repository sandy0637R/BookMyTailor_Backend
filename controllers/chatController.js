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

// ✅ Get list of users the current user has chatted with
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find distinct users where current user is sender or receiver
    const chats = await Chat.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ timestamp: -1 }) // Latest first
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    const userMap = new Map();

    chats.forEach(chat => {
      const otherUser =
        chat.sender._id.toString() === currentUserId.toString()
          ? chat.receiver
          : chat.sender;

      if (!userMap.has(otherUser._id.toString())) {
        userMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: chat.message,
          timestamp: chat.timestamp,
        });
      }
    });

    const result = Array.from(userMap.values());
    res.json(result);
  } catch (error) {
    console.error("Error fetching chat users:", error.message);
    res.status(500).json({ message: "Failed to fetch chat users" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new Chat({
      sender,
      receiver,
      message,
      timestamp: new Date(),
      read: false,
    });

    const savedMessage = await newMessage.save();

    // ✅ Emit via socket (optional, if setup)
    if (req.app.get("io")) {
      req.app.get("io").to(receiver).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
