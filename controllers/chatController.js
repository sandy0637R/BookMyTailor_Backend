const Chat = require("../models/Chat");

//  Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    if (
      !userId1 ||
      !userId2 ||
      userId1 === "undefined" ||
      userId2 === "undefined" ||
      userId1 === userId2
    ) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const messages = await Chat.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender receiver", "name email profileImage");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

//  Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: "Invalid message IDs" });
    }

    const result = await Chat.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

//  Get list of users the current user has chatted with
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ timestamp: -1 })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    const userMap = new Map();
    const unreadCounts = {};

    chats.forEach((chat) => {
      const otherUser =
        chat.sender._id.toString() === currentUserId.toString()
          ? chat.receiver
          : chat.sender;

      const otherUserId = otherUser._id.toString();

      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          user: otherUser,
          lastMessage: chat.message,
          timestamp: chat.timestamp,
        });
      }

      if (
        chat.receiver._id.toString() === currentUserId.toString() &&
        !chat.read
      ) {
        unreadCounts[otherUserId] = (unreadCounts[otherUserId] || 0) + 1;
      }
    });

    res.json({
      chatUsers: Array.from(userMap.values()),
      unreadCounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat users" });
  }
};

//  Send a new message
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

    if (req.app.get("io")) {
      req.app.get("io").to(receiver).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

//  Start a new chat (creates a dummy entry if no messages yet)
exports.startChat = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver || sender === receiver) {
      return res.status(400).json({ error: "Invalid sender or receiver" });
    }

    const existingChat = await Chat.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ success: true, message: "Chat already exists" });
    }

    const newChat = new Chat({
      sender,
      receiver,
      message: "hi",
      timestamp: new Date(),
      read: false,
    });

    await newChat.save();

    res
      .status(201)
      .json({ success: true, message: "Chat started successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
