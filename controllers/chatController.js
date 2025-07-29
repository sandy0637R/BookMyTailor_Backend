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
     console.log("📥 Backend received messageIds:", messageIds); // Debug
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'Invalid message IDs' });
    }

    const result = await Chat.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } }
    );
    console.log("✅ Mongo update result:", result);

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

    const chats = await Chat.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ timestamp: -1 }) // Latest first
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    const userMap = new Map();
    const unreadCounts = {};

    chats.forEach(chat => {
      const otherUser =
        chat.sender._id.toString() === currentUserId.toString()
          ? chat.receiver
          : chat.sender;

      const otherUserId = otherUser._id.toString();

      // Fill chat user info if not already set
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          user: otherUser,
          lastMessage: chat.message,
          timestamp: chat.timestamp,
        });
      }

      // ✅ Count unread messages correctly
      if (
  chat.receiver._id.toString() === currentUserId.toString() &&
  !chat.read
) {
  unreadCounts[otherUserId] = (unreadCounts[otherUserId] || 0) + 1;
}

    });

    const result = Array.from(userMap.values());

    res.json({
      chatUsers: result,
      unreadCounts,
    });
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

// Start a new chat between two users (even if no message sent yet)
exports.startChat = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver || sender === receiver) {
      return res.status(400).json({ error: "Invalid sender or receiver" });
    }

    // Check if any previous chat exists
    const existingChat = await Chat.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    });

    if (existingChat) {
      return res.status(200).json({ success: true, message: "Chat already exists" });
    }

    // Create a dummy entry to start chat
    const newChat = new Chat({
      sender,
      receiver,
      message: "hi", 
    });

    await newChat.save();

    res.status(201).json({ success: true, message: "Chat started successfully" });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "Server error" });
  }
};
